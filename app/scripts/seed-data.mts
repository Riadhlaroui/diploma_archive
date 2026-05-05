import { createRequire } from "module";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_EMAIL ?? "";
const PB_PASSWORD = process.env.PB_PASSWORD ?? "";
const DATA_DIR = path.join(__dirname, "data");

let token = "";

async function pbAuth() {
	const res = await fetch(
		`${PB_URL}/api/collections/_superusers/auth-with-password`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ identity: PB_EMAIL, password: PB_PASSWORD }),
		},
	);
	if (!res.ok) throw new Error(`Auth failed: ${await res.text()}`);
	token = ((await res.json()) as { token: string }).token;
}

async function pbCreate(collection: string, body: Record<string, unknown>) {
	const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Authorization: token },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text());
	return res.json() as Promise<{ id: string }>;
}

async function pbFindOne(
	collection: string,
	filter: string,
): Promise<{ id: string } | null> {
	const url = new URL(`${PB_URL}/api/collections/${collection}/records`);
	url.searchParams.set("page", "1");
	url.searchParams.set("perPage", "1");
	url.searchParams.set("filter", filter);
	url.searchParams.set("fields", "id");
	const res = await fetch(url.toString(), {
		headers: { Authorization: token },
	});
	if (!res.ok) return null;
	const data = (await res.json()) as {
		items: { id: string }[];
		totalItems: number;
	};
	return data.totalItems > 0 ? data.items[0] : null;
}

function readXlsx(filename: string): Record<string, unknown>[] {
	const fp = path.join(DATA_DIR, filename);
	if (!fs.existsSync(fp)) throw new Error(`Missing file: ${fp}`);
	const wb = XLSX.readFile(fp);
	return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<
		string,
		unknown
	>[];
}

const str = (v: unknown) => String(v ?? "").trim();
const esc = (s: string) => s.replace(/'/g, "\\'");
const isNull = (v: unknown) => {
	const s = String(v ?? "")
		.trim()
		.toLowerCase();
	return !s || s === "nan" || s === "null" || s === "undefined";
};

async function importFaculties(
	rows: Record<string, unknown>[],
): Promise<Map<number, string>> {
	console.log("\n📚  Stage 1 — Faculties (كليات)");
	const idMap = new Map<number, string>();
	let created = 0,
		skipped = 0;

	for (const row of rows) {
		const raw = str(row["nomar"])
			.replace(/^كلية:\s*/, "")
			.trim();
		if (!raw) {
			skipped++;
			continue;
		}

		const existing = await pbFindOne(
			"Archive_faculties",
			`name = '${esc(raw)}'`,
		);
		if (existing) {
			idMap.set(Number(row["idfaculte"]), existing.id);
			console.log(`   ~ skip (exists): ${raw}`);
			skipped++;
			continue;
		}

		try {
			const rec = await pbCreate("Archive_faculties", { name: raw });
			idMap.set(Number(row["idfaculte"]), rec.id);
			console.log(`   ✓ ${raw}`);
			created++;
		} catch (err) {
			console.error(`   ✗ ${raw}: ${String(err)}`);
			skipped++;
		}
	}

	console.log(`   ↳ ${created} created, ${skipped} skipped`);
	return idMap;
}

async function importDepartments(
	rows: Record<string, unknown>[],
	facultyMap: Map<number, string>,
): Promise<Map<number, string>> {
	console.log("\n🏛️   Stage 2 — Departments (أقسام)");
	const idMap = new Map<number, string>();
	let created = 0,
		skipped = 0;

	for (const row of rows) {
		const name = str(row["nomar"]);
		if (!name) {
			skipped++;
			continue;
		}

		const facultyPbId = facultyMap.get(Number(row["faculte"]));
		if (!facultyPbId) {
			console.warn(
				`   ⚠ "${name}" — faculte ${row["faculte"]} not in map, skipped`,
			);
			skipped++;
			continue;
		}

		const existing = await pbFindOne(
			"Archive_departments",
			`name = '${esc(name)}' && facultyId = '${facultyPbId}'`,
		);
		if (existing) {
			idMap.set(Number(row["id"]), existing.id);
			console.log(`   ~ skip (exists): ${name}`);
			skipped++;
			continue;
		}

		try {
			const rec = await pbCreate("Archive_departments", {
				name,
				facultyId: facultyPbId,
			});
			idMap.set(Number(row["id"]), rec.id);
			console.log(`   ✓ ${name}`);
			created++;
		} catch (err) {
			console.error(`   ✗ ${name}: ${String(err)}`);
			skipped++;
		}
	}

	console.log(`   ↳ ${created} created, ${skipped} skipped`);
	return idMap;
}

async function importFields(
	rows: Record<string, unknown>[],
	departmentMap: Map<number, string>,
): Promise<Map<number, string>> {
	console.log("\n📖  Stage 3 — Fields (فروع / Filières)");
	const idMap = new Map<number, string>();
	let created = 0,
		skipped = 0;

	for (const row of rows) {
		const name = str(row["nomar"]);
		if (!name) {
			skipped++;
			continue;
		}

		if (isNull(row["departement"])) {
			console.warn(`   ⚠ "${name}" — no departement FK, skipped`);
			skipped++;
			continue;
		}

		const departmentPbId = departmentMap.get(Number(row["departement"]));
		if (!departmentPbId) {
			console.warn(
				`   ⚠ "${name}" — departement ${row["departement"]} not in map, skipped`,
			);
			skipped++;
			continue;
		}

		const existing = await pbFindOne(
			"Archive_fields",
			`name = '${esc(name)}' && departmentId = '${departmentPbId}'`,
		);
		if (existing) {
			idMap.set(Number(row["idfiliere"]), existing.id);
			console.log(`   ~ skip (exists): ${name}`);
			skipped++;
			continue;
		}

		try {
			const rec = await pbCreate("Archive_fields", {
				name,
				departmentId: departmentPbId,
			});
			idMap.set(Number(row["idfiliere"]), rec.id);
			console.log(`   ✓ ${name}`);
			created++;
		} catch (err) {
			console.error(`   ✗ ${name}: ${String(err)}`);
			skipped++;
		}
	}

	console.log(`   ↳ ${created} created, ${skipped} skipped`);
	return idMap;
}

async function importMajors(
	rows: Record<string, unknown>[],
	fieldMap: Map<number, string>,
): Promise<void> {
	console.log("\n🎓  Stage 4 — Majors (تخصصات / Spécialités)");
	let created = 0,
		skipped = 0;

	for (const row of rows) {
		const name = str(row["nomar"]);
		if (!name) {
			skipped++;
			continue;
		}

		if (isNull(row["filiere"])) {
			console.warn(`   ⚠ "${name}" — no filiere FK, skipped`);
			skipped++;
			continue;
		}

		const fieldPbId = fieldMap.get(Number(row["filiere"]));
		if (!fieldPbId) {
			console.warn(
				`   ⚠ "${name}" — filiere ${row["filiere"]} not in map, skipped`,
			);
			skipped++;
			continue;
		}

		const existing = await pbFindOne(
			"Archive_majors",
			`name = '${esc(name)}' && fieldId = '${fieldPbId}'`,
		);
		if (existing) {
			console.log(`   ~ skip (exists): ${name}`);
			skipped++;
			continue;
		}

		try {
			await pbCreate("Archive_majors", { name, fieldId: fieldPbId });
			console.log(`   ✓ ${name}`);
			created++;
		} catch (err) {
			console.error(`   ✗ ${name}: ${String(err)}`);
			skipped++;
		}
	}

	console.log(`   ↳ ${created} created, ${skipped} skipped`);
}

async function main() {
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("   PocketBase University Data Seeder");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(`PocketBase : ${PB_URL}`);
	console.log(`Data dir   : ${DATA_DIR}`);

	await pbAuth();
	console.log("✔ Authenticated\n");

	const faculteRows = readXlsx("faculte.xlsx");
	const departementRows = readXlsx("departement.xlsx");
	const filiereRows = readXlsx("filiere.xlsx");
	const specialiteRows = readXlsx("specialite.xlsx");

	console.log(
		`Loaded: ${faculteRows.length} faculties, ${departementRows.length} departments, ${filiereRows.length} fields, ${specialiteRows.length} majors`,
	);

	const facultyMap = await importFaculties(faculteRows);
	const departmentMap = await importDepartments(departementRows, facultyMap);
	const fieldMap = await importFields(filiereRows, departmentMap);
	await importMajors(specialiteRows, fieldMap);

	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("   ✅  Seeding complete!");
	console.log("   Archive_specialties remains empty —");
	console.log("   add specialties via the app UI.");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
	console.error("\n❌  Fatal:", err);
	process.exit(1);
});
