import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = "http://127.0.0.1:8090";
const PB_EMAIL = "archive@gmail.com";
const PB_PASSWORD = "12345678910";
const DATA_DIR = path.join(__dirname, "data");

let token = "";

async function pbAuth() {
	const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ identity: PB_EMAIL, password: PB_PASSWORD }),
	});
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

async function pbExists(collection: string, filter: string): Promise<boolean> {
	const url = new URL(`${PB_URL}/api/collections/${collection}/records`);
	url.searchParams.set("page", "1");
	url.searchParams.set("perPage", "1");
	url.searchParams.set("filter", filter);
	url.searchParams.set("fields", "id");
	const res = await fetch(url.toString(), {
		headers: { Authorization: token },
	});
	if (!res.ok) return false;
	const data = (await res.json()) as { totalItems: number };
	return data.totalItems > 0;
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
const esc = (s: string) => s.replace(/"/g, '\\"');
const isNull = (v: unknown) => {
	const s = String(v ?? "")
		.trim()
		.toLowerCase();
	return !s || s === "nan" || s === "null" || s === "undefined";
};

async function importFaculties(
	rows: Record<string, unknown>[],
): Promise<Map<number, string>> {
	console.log("\n📚  Stage 1 — Faculties");
	const idMap = new Map<number, string>();
	let created = 0,
		skipped = 0;

	for (const row of rows) {
		const name = str(row["nomar"]);
		if (!name) {
			skipped++;
			continue;
		}

		if (await pbExists("Archive_faculties", `name = "${esc(name)}"`)) {
			console.log(`   ~ already exists, skipped: ${name}`);
			skipped++;
			continue;
		}

		try {
			const rec = await pbCreate("Archive_faculties", {
				name,
				numberOfDepartments: 0,
			});
			idMap.set(Number(row["idfaculte"]), rec.id);
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

async function importDepartments(
	rows: Record<string, unknown>[],
	facultyMap: Map<number, string>,
): Promise<Map<number, string>> {
	console.log("\n🏛️   Stage 2 — Departments");
	const idMap = new Map<number, string>();
	let created = 0,
		skipped = 0;

	for (const row of rows) {
		const name = str(row["nomar"]);
		if (!name) {
			skipped++;
			continue;
		}

		const facultyId = facultyMap.get(Number(row["faculte"]));
		if (!facultyId) {
			console.warn(
				`   ⚠ "${name}" — faculte ${row["faculte"]} not found, skipped`,
			);
			skipped++;
			continue;
		}

		if (
			await pbExists(
				"Archive_departments",
				`name = "${esc(name)}" && facultyId = "${facultyId}"`,
			)
		) {
			console.log(`   ~ already exists, skipped: ${name}`);
			skipped++;
			continue;
		}

		try {
			const rec = await pbCreate("Archive_departments", { name, facultyId });
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
	console.log("\n📖  Stage 3 — Fields (Filières)");
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

		const departmentId = departmentMap.get(Number(row["departement"]));
		if (!departmentId) {
			console.warn(
				`   ⚠ "${name}" — departement ${row["departement"]} not found, skipped`,
			);
			skipped++;
			continue;
		}

		if (
			await pbExists(
				"Archive_fields",
				`name = "${esc(name)}" && departmentId = "${departmentId}"`,
			)
		) {
			console.log(`   ~ already exists, skipped: ${name}`);
			skipped++;
			continue;
		}

		try {
			const rec = await pbCreate("Archive_fields", { name, departmentId });
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
	console.log("\n🎓  Stage 4 — Majors (Spécialités)");
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

		const fieldId = fieldMap.get(Number(row["filiere"]));
		if (!fieldId) {
			console.warn(
				`   ⚠ "${name}" — filiere ${row["filiere"]} not found, skipped`,
			);
			skipped++;
			continue;
		}

		if (
			await pbExists(
				"Archive_majors",
				`name = "${esc(name)}" && fieldId = "${fieldId}"`,
			)
		) {
			console.log(`   ~ already exists, skipped: ${name}`);
			skipped++;
			continue;
		}

		try {
			await pbCreate("Archive_majors", { name, fieldId });
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
	console.log(`Data dir   : ${DATA_DIR}\n`);

	await pbAuth();
	console.log("✔ Authenticated as admin");

	const facultyMap = await importFaculties(readXlsx("faculte.xlsx"));
	const departmentMap = await importDepartments(
		readXlsx("departement.xlsx"),
		facultyMap,
	);
	const fieldMap = await importFields(readXlsx("filiere.xlsx"), departmentMap);
	await importMajors(readXlsx("specialite.xlsx"), fieldMap);

	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("   ✅  Seeding complete!");
	console.log("   Archive_specialties is empty.");
	console.log("   Add specialties via addSpecialty() in the app.");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
	console.error("\n❌  Fatal:", err);
	process.exit(1);
});
