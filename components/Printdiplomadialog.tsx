/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Printer,
	ChevronRight,
	ChevronLeft,
	AlertCircle,
	CheckCircle2,
	Eye,
	GraduationCap,
	ClipboardList,
	Award,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DatePicker } from "./ui/DatePicker";
import {
	SelectValue,
	SelectTrigger,
	SelectItem,
	SelectContent,
	Select,
} from "./ui/select";

// Types
interface Student {
	id: string;
	matricule: string;
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	enrollmentYear: string;
	graduationYear: string;
	expand?: {
		fieldId?: { name: string };
		majorId?: { name: string };
		specialtyId?: { name: string };
	};
}

interface DiplomaData {
	firstNameFr: string;
	lastNameFr: string;
	dateOfBirth: string;
	fieldFr: string;
	majorFr: string;
	specialtyFr: string;
	graduationYear: string;
	placeOfBirth: string;
	placeOfBirthAr: string;
	firstNameAr: string;
	lastNameAr: string;
	issuanceDate: string;
	issuanceLocationFr: string;
	issuanceLocationAr: string;
	certNumber: number;
	certDate: string;
	certReferenceNumber: string;
	certFirstRefDate: string;
	certSecondRefDate: string;
	addresseeTitle: string;
	addresseeWilaya: string;
	paperSize: "A4" | "A5" | "Letter";

	branchFr: string;
	diplomaRefNumber: string;
	serialNumber: string;
	serialCode: string;
}

const CERT_COUNTER_KEY = "lagh_auth_cert_counter";

interface PrintDiplomaDialogProps {
	open: boolean;
	onClose: () => void;
	student: Student;
}

// Document Type Registry
// TO ADD CONDITIONS LATER: populate `eligibleFields`, `eligibleMajors`, or
// `eligibleSpecialties` on any entry and uncomment the filter in SelectTypeStep.
// Leave them undefined to mean "available to all students".

export interface DocType {
	id: string;
	labelAr: string;
	labelFr: string;
	descriptionAr: string;
	descriptionFr: string;
	icon: React.ReactNode;
	eligibleFields?: string[]; // match against student.expand?.fieldId?.name
	eligibleMajors?: string[]; // match against student.expand?.majorId?.name
	eligibleSpecialties?: string[]; // match against student.expand?.specialtyId?.name
}

const ALL_DOC_TYPES: DocType[] = [
	{
		id: "transcript",
		labelAr: "شهادة توثيق",
		labelFr: "Certificat d'Authentification",
		descriptionAr:
			"وثيقة رسمية تحتوي على معلومات الطالب وشهاداته للتحقق من صحتها",
		descriptionFr:
			"Document officiel contenant les informations de l'étudiant et ses diplômes pour vérification",
		icon: <ClipboardList className="w-6 h-6" />,
	},
	{
		id: "licence",
		labelAr: "شهادة الليسانس",
		labelFr: "Diplôme de Licence",
		descriptionAr: "شهادة تخرج مرحلة الليسانس (L.M.D)",
		descriptionFr: "Diplôme de fin de cycle Licence (L.M.D)",
		icon: <GraduationCap className="w-6 h-6" />,
	},
	{
		id: "master",
		labelAr: "شهادة الماستر",
		labelFr: "Diplôme de Master",
		descriptionAr: "شهادة تخرج مرحلة الماستر (L.M.D)",
		descriptionFr: "Diplôme de fin de cycle Master (L.M.D)",
		icon: <Award className="w-6 h-6" />,
	},
];

// Helpers
/* const fmtDateFr = (d: string) => {
	if (!d) return "—";
	const dt = new Date(d);
	return [
		String(dt.getDate()).padStart(2, "0"),
		String(dt.getMonth() + 1).padStart(2, "0"),
		dt.getFullYear(),
	].join(".");
};

const fmtDateAr = (d: string) => {
	if (!d) return "—";
	const dt = new Date(d);
	const months = [
		"جانفي",
		"فيفري",
		"مارس",
		"أفريل",
		"ماي",
		"جوان",
		"جويلية",
		"أوت",
		"سبتمبر",
		"أكتوبر",
		"نوفمبر",
		"ديسمبر",
	];
	return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}; */

const fmtDateFr = (d: string) => {
	if (!d) return "—";
	const dt = new Date(d);
	return [
		dt.getFullYear(),
		String(dt.getMonth() + 1).padStart(2, "0"),
		String(dt.getDate()).padStart(2, "0"),
	].join("/");
};

const fmtDateAr = (d: string) => {
	if (!d) return "—";
	const dt = new Date(d);
	return [
		dt.getFullYear(),
		String(dt.getMonth() + 1).padStart(2, "0"),
		String(dt.getDate()).padStart(2, "0"),
	].join("/");
};

function getNextCertNumber(): number {
	const stored = localStorage.getItem(CERT_COUNTER_KEY);
	return stored ? parseInt(stored, 10) + 1 : 108;
}

function saveCertNumber(n: number) {
	localStorage.setItem(CERT_COUNTER_KEY, String(n));
}

// Diploma HTML Generator
function buildMasterDiplomaHTML(d: DiplomaData): string {
	const nameFr = `${d.lastNameFr.toUpperCase()} ${d.firstNameFr}`;
	const nameAr =
		d.firstNameAr || d.lastNameAr
			? `${d.lastNameAr} ${d.firstNameAr}`
			: `${d.firstNameFr} ${d.lastNameFr}`;
	const dobFr = fmtDateFr(d.dateOfBirth);
	const issueFr = fmtDateFr(d.issuanceDate);
	const issueAr = fmtDateAr(d.issuanceDate);
	const placeFr = d.placeOfBirth || "—";
	const placeAr = d.placeOfBirthAr || d.placeOfBirth || "—";

	return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>شهادة الماستر – ${nameFr}</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet"/>
<style>

  /* ── Page setup ── */
  @page {
    size: A4 landscape;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    width: 297mm;
    height: 210mm;
    background: #fff;
    font-family: 'Amiri', 'Times New Roman', serif;
    font-size: 11pt;
    color: #000;
    overflow: hidden;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  /* ── Page container ── */
  .page {
    width: 297mm;
    height: 210mm;
    padding: 20mm 20mm 15mm;
    display: flex;
    flex-direction: column;
  }

  /* ── Two-column bilingual layout ── */
  .cols {
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: 0;
    direction: rtl;
    gap: 10mm;
  }

  .col-ar {
    width: 50%;
    flex-shrink: 0;
    direction: rtl;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 3mm;
    padding: 5mm;
  }

  .col-fr {
    width: 50%;
    flex-shrink: 0;
    direction: ltr;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 3mm;
    padding: 5mm;
  }

  /* ── Rows ── */
  .ar-row,
  .fr-row {
    display: flex;
    align-items: baseline;
    gap: 2mm;
    min-height: 8mm;
  }

  .ar-row { font-size: 12pt; line-height: 1.8; }
  .fr-row { font-size: 11pt; line-height: 1.8; }

  /* ── Labels ── */
  .ar-label {
    font-weight: 700;
    white-space: nowrap;
    min-width: 52mm;
  }

  .fr-label {
    font-style: italic;
    white-space: nowrap;
    min-width: 44mm;
  }

  /* ── Values (shared base) ── */
  .ar-value,
  .ar-value-short,
  .fr-value,
  .fr-value-short {
    border-bottom: 1px dotted #555;
    flex: 1;
    font-weight: 700;
    padding-bottom: 0.3mm;
  }

  .ar-value,
  .ar-value-short { font-size: 12pt; }

  .fr-value,
  .fr-value-short { font-size: 11pt; }

  .ar-value-short,
.fr-value-short {
  min-width: 30mm;
  flex: none;
  line-height: 1.8;    
  display: inline-flex;
  align-items: center;
}

  /* ── Values (alignment by column) ── */
  .col-ar .ar-value,
  .col-ar .ar-value-short { text-align: right; }

  .col-fr .fr-value,
  .col-fr .fr-value-short { text-align: left; }

  /* ── Diploma title blocks ── */
  .diploma-type-ar,
  .fr-diploma-title {
    height: 18mm;
    min-width: 60mm;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4mm 0;
  }

  .diploma-type-ar {
    font-family: 'Scheherazade New', serif;
    font-size: 24pt;
    font-weight: 700;
  }

  .fr-diploma-title {
    font-style: italic;
    font-size: 18pt;
    font-weight: 700;
  }

  /* ── Bottom info row ── */
  .bottom-info {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-around;
    font-size: 11pt;
    direction: rtl;
    margin-top: 5mm;
    margin-bottom: 10mm;
  }

  .chunk {
    display: flex;
    align-items: baseline;
    gap: 2mm;
    white-space: nowrap;
  }

  .chunk-label {
    font-weight: 700;
    min-width: 28mm;
    display: inline-block;
  }

  .chunk-val {
    border-bottom: 1px dotted #555;
    min-width: 35mm;
    text-align: right;
    font-weight: 700;
    padding-bottom: 0.3mm;
  }

  /* ── Signatures ── */
  .sigs {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    direction: rtl;
    font-size: 11pt;
    font-weight: 700;
    padding: 0 15mm;
  }

  .sig-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 50mm;
  }

  .sig-title {
    text-align: center;
    line-height: 1.6;
    margin-bottom: 15mm;
  }

  /* ── Serial numbers ── */
  .serials {
    margin-top: auto;
    font-size: 9pt;
    direction: ltr;
    line-height: 1.7;
    font-weight: bold;
  }

  /* ── Print ── */
  @media print {
    body,
    .page {
      width: 297mm;
      height: 210mm;
    }
  }

</style>
</head>
<body>
<div class="page">

  <div class="cols">

    <div class="col-ar">
      <div class="ar-row">
        <span class="ar-label">&nbsp;</span>
        <span class="ar-value">${issueAr}</span>
      </div>
      <div class="ar-row">
        <span class="ar-label">&nbsp;</span>
        <span class="ar-value">${nameAr}</span>
      </div>
      <div class="ar-row" style="align-items: center;">
  <span class="ar-label">&nbsp;</span>
  <span class="ar-value-short">${fmtDateAr(d.dateOfBirth)}</span>
  <span class="ar-label">&nbsp;</span>
  <span class="ar-value">${placeAr}</span>
</div>

      <div class="diploma-type-ar">&nbsp;</div>

      <div class="ar-row">
        <span class="ar-label">&nbsp;</span>
        <span class="ar-value">${d.fieldFr}</span>
      </div>
      <div class="ar-row">
        <span class="ar-label">&nbsp;</span>
        <span class="ar-value">${d.branchFr ?? d.fieldFr}</span>
      </div>
      <div class="ar-row">
        <span class="ar-label">&nbsp;</span>
        <span class="ar-value">${d.specialtyFr}</span>
      </div>
     <div class="ar-row">
  <span class="ar-label">&nbsp;</span>
  <span class="ar-value">جامعة عمار ثليجي الأغواط</span>  <!-- was &nbsp; -->
</div>
    </div>

    <div class="col-fr">
      <div class="fr-row" style="visibility: hidden;">
        <span class="fr-label">Spacer :</span>
        <span class="fr-value">Spacer</span>
      </div>
      <div class="fr-row">
        <span class="fr-label">&nbsp;</span>
        <span class="fr-value">${nameFr}</span>
      </div>
      <div class="fr-row" style="align-items: center;">
  <span class="fr-label">&nbsp;</span>
  <span class="fr-value-short">${dobFr}</span>
  <span class="fr-label">&nbsp;</span>
  <span class="fr-value">${placeFr}</span>
</div>

      <div class="fr-diploma-title">&nbsp;</div>

      <div class="fr-row">
        <span class="fr-label">&nbsp;</span>
        <span class="fr-value">${d.fieldFr}</span>
      </div>
      <div class="fr-row">
        <span class="fr-label">&nbsp;</span>
        <span class="fr-value">${d.branchFr ?? d.fieldFr}</span>
      </div>
      <div class="fr-row">
        <span class="fr-label">&nbsp;</span>
        <span class="fr-value">${d.specialtyFr}</span>
      </div>
     <div class="fr-row">
  <span class="fr-label">&nbsp;</span>
  <span class="fr-value">Université Amar Telidji de Laghouat</span>  <!-- was &nbsp; -->
</div>
    </div>

  </div>

  <div class="bottom-info">
    <div class="chunk">
      <span class="chunk-label">&nbsp;</span>
      <span class="chunk-val">${d.issuanceLocationAr || "&nbsp;"}</span>
    </div>
    <div class="chunk">
      <span class="chunk-label">&nbsp;</span>
      <span class="chunk-val">${issueAr}</span>
    </div>
    <div class="chunk">
      <span class="chunk-label">&nbsp;</span>
      <span class="chunk-val">${d.diplomaRefNumber ?? "&nbsp;"}</span>
    </div>
  </div>

  <div class="sigs">
    <div class="sig-block">
      <div class="sig-title">&nbsp;</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">&nbsp;</div>
    </div>
  </div>

  <div class="serials">
    <div>N: &nbsp;${d.serialNumber ?? "________"}</div>
    <div>e: &nbsp;${d.serialCode ?? "________"}</div>
  </div>

</div>
</body>
</html>`;
}

function buildAuthCertHTML(d: DiplomaData): string {
	const nameAr =
		d.firstNameAr || d.lastNameAr
			? `${d.lastNameAr} ${d.firstNameAr}`
			: `${d.lastNameFr.toUpperCase()} ${d.firstNameFr}`;

	const dobFormatted = d.dateOfBirth
		? new Date(d.dateOfBirth).toLocaleDateString("ar-DZ")
		: "";

	const certDateFormatted = d.certDate
		? new Date(d.certDate).toLocaleDateString("ar-DZ")
		: "";

	const refNumber = d.certReferenceNumber || '<span class="meta-blank"></span>';

	const refFirstDate = d.certFirstRefDate || '<span class="meta-blank"></span>';

	const refSecondDate = d.certSecondRefDate
		? new Date(d.certSecondRefDate).toLocaleDateString("ar-DZ", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
		: '<span class="meta-blank"></span>';

	return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>شهادة توثيق – ${nameAr}</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  @page { size: ${d.paperSize || "A4"} portrait; margin: 20mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Amiri', 'Times New Roman', serif;
    font-size: 13pt;
    color: #000;
    line-height: 2.2;
    direction: rtl;
	padding: 20mm 18mm;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8mm;
    font-size: 11pt;
    line-height: 1.9;
  }
  .header-right { text-align: right; }
  .header-left  { text-align: left; direction: ltr; }

  .divider { border: none; border-top: 1.5px solid #000; margin: 5mm 0; }

  .addressee {
    margin: 5mm 0;
    font-size: 13pt;
  }

  .meta-block {
    margin: 4mm 0;
    font-size: 13pt;
    line-height: 2.4;
  }
  .meta-row { display: flex; gap: 4mm; align-items: baseline; }
  .meta-label { font-weight: 700; white-space: nowrap; }
  .meta-blank {
  min-width: 15mm;
  display: inline-block;
  vertical-align: bottom;
  background: transparent;
}

  .body-text {
    font-size: 13pt;
    line-height: 2.4;
    text-align: justify;
    margin: 6mm 0;
	text-indent: 12mm;
  }

  .closing {
    text-align: center;
    font-size: 13pt;
    font-weight: 700;
    margin: 8mm 0 6mm;
  }

  .sigs {
    display: flex;
    justify-content: space-between;
    margin-top: 4mm;
    font-size: 12pt;
    font-weight: 700;
  }
  .sig-space { height: 20mm; }

  @media print {
    body { font-size: 13pt; }
  }
</style>
</head>
<body>

  <!-- Header: ref number left, date right -->
  <div class="header">
  <div class="header-right" dir="rtl">
      رقم/.........:ن.ر.ج.تع.تم.ش/م.ش.م/${new Date(d.certDate || Date.now()).getFullYear()}/
    </div>
    <div class="header-left">
      الأغواط ${certDateFormatted}
    </div>
  </div>


  <!-- Addressee — left blank for handwriting -->
  <div class="addressee">
    إلى السّيد(ة) : <span class="meta-blank"></span>
  </div>


  <!-- Subject + Reference -->
  <div class="meta-block">
    <div class="meta-row">
      <span class="meta-label">الموضوع :</span>
      <span>ب/خ توثيق شهادة الدراسات الجامعية التطبيقية السّيد(ة) : <strong>${nameAr}</strong></span>
    </div>

  <div class="meta-row">
  <span class="meta-label">المرجع :</span>
  <span>
    إرسالكم رقم :
    <span style="display:inline-block; min-width: 20mm; text-align:center;">${refNumber}</span>
    &nbsp;/&nbsp;
    <span style="display:inline-block; min-width: 25mm; text-align:center;">${refFirstDate}</span>
    &nbsp;، المؤرخة في :&nbsp;
    <span style="display:inline-block; min-width: 25mm; text-align:center;">${refSecondDate}</span>
  </span>
</div>
  </div>


  <!-- Body -->
  <div class="body-text">
    ردًّا على إرسالكم في المرجع أعلاه، بخصوص التَّأكُّد من صحَّة شهادة نجاح السّيد(ة) :<br/>
    <strong>${nameAr}</strong> ،المولود(ة) بتاريخ <strong>${dobFormatted}</strong> <strong>${d.placeOfBirthAr || d.placeOfBirth || ""}</strong><br/>
    يشرّفنا أن نؤكّد لكم بأنّ المعني(ة) قد تخرّج(ت) من جامعة عمّار تليجي بالأغواط بشهادة ،<br/>
    الدراسات الجامعية التطبيقية، شعبة : <strong>${d.fieldFr}</strong> ، تخصّص : <strong>${d.specialtyFr}</strong> ، دورة : <strong>${d.graduationYear}</strong>
  </div>

  <!-- Closing -->
  <div class="closing">تقبَّلوا منَّا فائق الاحترام و التَّقدير</div>

  <!-- Signatures -->
  <div class="sigs">
    <div>
      <div>المحرّر :</div>
      <div class="sig-space"></div>
    </div>
    <div style="text-align:center">
      <div>نائب رئيس الجامعة</div>
      <div class="sig-space"></div>
    </div>
  </div>

</body>
</html>`;
}

// Step 0: Select Type
interface SelectTypeStepProps {
	student: Student;
	selectedId: string | null;
	onSelect: (id: string) => void;
	onNext: () => void;
}

const SelectTypeStep: React.FC<SelectTypeStepProps> = ({
	student,
	selectedId,
	onSelect,
	onNext,
}) => {
	// FUTURE: Uncomment and extend to filter types by student attributes:
	// const available = ALL_DOC_TYPES.filter((dt) => {
	//   if (dt.eligibleFields && !dt.eligibleFields.includes(student.expand?.fieldId?.name ?? "")) return false;
	//   if (dt.eligibleMajors && !dt.eligibleMajors.includes(student.expand?.majorId?.name ?? "")) return false;
	//   if (dt.eligibleSpecialties && !dt.eligibleSpecialties.includes(student.expand?.specialtyId?.name ?? "")) return false;
	//   return true;
	// });
	const available = ALL_DOC_TYPES;

	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	return (
		<div className="flex flex-col gap-4 pb-2">
			{/* Student context banner */}
			<div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 shrink-0">
				<GraduationCap className="w-5 h-5 text-green-700 dark:text-green-400 shrink-0" />
				<div className="text-sm">
					<span className="font-semibold text-green-800 dark:text-green-300">
						{student.firstName} {student.lastName}
					</span>
					<span className="text-green-600 dark:text-green-500 mx-1.5">·</span>
					<span className="text-green-600 dark:text-green-500">
						{student.expand?.fieldId?.name || "—"}
					</span>
					{student.expand?.specialtyId?.name && (
						<>
							<span className="text-green-600 dark:text-green-500 mx-1.5">
								/
							</span>
							<span className="text-green-600 dark:text-green-500">
								{student.expand.specialtyId.name}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Type grid — grows to fill remaining space */}
			<div className="flex flex-col">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-rows-2 gap-3">
					{available.map((dt) => {
						const isSelected = selectedId === dt.id;
						return (
							<button
								key={dt.id}
								onClick={() => onSelect(dt.id)}
								className={`
                group relative text-left p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer
                ${
									isSelected
										? "border-green-600 bg-green-50 dark:bg-green-900/25 dark:border-green-500 shadow-sm"
										: "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/40 dark:hover:bg-green-900/10"
								}
              `}
							>
								{isSelected && (
									<span className="absolute top-2.5 right-2.5">
										<CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
									</span>
								)}
								<div
									className={`
                  w-10 h-10 rounded-lg mr-auto flex items-center justify-center mb-3 transition-colors
                  ${
										isSelected
											? "bg-green-600 text-white"
											: "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 group-hover:bg-green-100 group-hover:text-green-700 dark:group-hover:bg-green-900/30 dark:group-hover:text-green-400"
									}
                `}
								>
									{dt.icon}
								</div>
								<div className="font-semibold text-sm text-gray-900 dark:text-white leading-tight mb-0.5">
									{dt.labelFr}
								</div>
								<div
									className="font-medium text-gray-700 dark:text-gray-400 mb-1"
									dir="rtl"
								>
									{dt.labelAr}
								</div>
								<div className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
									{dt.descriptionFr}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Footer — pinned to bottom */}
			<div className="flex justify-end shrink-0 pt-1">
				<Button
					onClick={onNext}
					disabled={!selectedId}
					className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6"
				>
					{t("common.continue")}
					{isRtl ? (
						<ChevronLeft className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</Button>
			</div>
		</div>
	);
};

// Step 1: Review & Fill
interface ReviewStepProps {
	data: DiplomaData;
	setData: React.Dispatch<React.SetStateAction<DiplomaData>>;
	selectedTypeId: string;
	onNext: () => void;
	onBack: () => void;
}

type StatusIcon = "ok" | "warn" | "none";

const FieldStatus: React.FC<{ status?: StatusIcon }> = ({ status }) => {
	if (status === "ok")
		return <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />;
	if (status === "warn")
		return <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />;
	return null;
};

const FieldLabel: React.FC<{
	children: React.ReactNode;
	required?: boolean;
	optional?: boolean;
	status?: StatusIcon;
}> = ({ children, required, optional, status }) => (
	<label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#202020] dark:text-zinc-500 mb-1.5">
		<span className="flex items-center gap-1">
			{children}
			{required && <span className="text-red-500 text-xs">*</span>}
		</span>
		{optional && (
			<span className="normal-case font-normal tracking-normal text-gray-300 dark:text-zinc-600 text-[12px]">
				(optional)
			</span>
		)}
		{status && (
			<span className="ml-auto">
				<FieldStatus status={status} />
			</span>
		)}
	</label>
);

const SubGroupDivider: React.FC<{ label: string }> = ({ label }) => (
	<div className="flex items-center gap-3 py-1">
		<span className="h-px w-4 bg-gray-100 dark:bg-zinc-700 shrink-0" />
		<span className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-zinc-600 whitespace-nowrap">
			{label}
		</span>
		<span className="h-px flex-1 bg-gray-100 dark:bg-zinc-700" />
	</div>
);

const SectionCard: React.FC<{
	icon: React.ElementType;
	title: string;
	children: React.ReactNode;
	className?: string;
}> = ({ icon: Icon, title, children, className = "" }) => {
	return (
		<div className={`rounded-xl border bg-white dark:bg-zinc-900 ${className}`}>
			<div className={`flex items-center gap-2.5 px-5 py-3 border-b `}>
				<Icon className={`w-4 h-4 shrink-0 `} />
				<span className="text-[12px] font-semibold uppercase tracking-widest">
					{title}
				</span>
			</div>
			<div className="p-5">{children}</div>
		</div>
	);
};

const ReviewStep: React.FC<ReviewStepProps> = ({
	data,
	setData,
	selectedTypeId,
	onNext,
	onBack,
}) => {
	const set =
		(key: keyof DiplomaData) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setData((prev) => ({ ...prev, [key]: e.target.value }));

	const isAuthCert = selectedTypeId === "transcript";
	const canProceed = isAuthCert
		? !!data.certDate
		: !!data.placeOfBirth && !!data.branchFr;

	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	return (
		<div className="flex flex-col min-h-0 max-w-270">
			<div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
				{isAuthCert && (
					<SectionCard icon={ClipboardList} title={t("diploma.certInfo")}>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
							<div>
								<FieldLabel required>{t("diploma.certDate")}</FieldLabel>
								<DatePicker
									value={data.certDate || null}
									onChange={(val) =>
										setData((p) => ({ ...p, certDate: val ?? "" }))
									}
									placeholder="Select date"
									clearable={false}
								/>
								{!data.certDate && (
									<p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
										<AlertCircle className="w-3 h-3" />{" "}
										{t("diploma.certDateRequired")}
									</p>
								)}
							</div>

							<div>
								<FieldLabel>{t("diploma.paperSize")}</FieldLabel>
								<Select
									value={data.paperSize}
									onValueChange={(value: string) =>
										setData((p) => ({
											...p,
											paperSize: value as DiplomaData["paperSize"],
										}))
									}
								>
									<SelectTrigger className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-colors">
										<SelectValue placeholder="Select paper size" />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="A4">A4</SelectItem>
										<SelectItem value="A5">A5</SelectItem>
										<SelectItem value="Letter">Letter</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<FieldLabel required>{t("diploma.placeOfBirth")}</FieldLabel>
								<Input
									value={data.placeOfBirthAr}
									onChange={set("placeOfBirthAr")}
									dir="rtl"
									className={`h-9 text-sm transition-colors ${
										!data.placeOfBirthAr
											? "border-red-300 focus:border-red-400"
											: "border-gray-200 focus:border-blue-400"
									}`}
								/>
								{!data.placeOfBirthAr && (
									<p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
										<AlertCircle className="w-3 h-3" />{" "}
										{t("diploma.placeOfBirthRequired")}
									</p>
								)}
							</div>

							<div className="flex flex-row gap-3 items-start min-w-0">
								<span className="text-sm shrink-0 mt-2.5">المرجع :</span>
								<Input
									value={data.certReferenceNumber}
									onChange={set("certReferenceNumber")}
									className="h-9 text-sm w-40 shrink-0"
								/>
								<span className="text-sm shrink-0 mt-2.5">/</span>
								<Input
									value={data.certFirstRefDate}
									onChange={set("certFirstRefDate")}
									className="h-9 text-sm w-40 shrink-0"
								/>
								<span className="text-sm shrink-0 mt-2.5">، المؤرخة في :</span>
								<DatePicker
									value={data.certSecondRefDate}
									onChange={(val) =>
										setData((p) => ({ ...p, certSecondRefDate: val ?? "" }))
									}
									className="h-9 text-sm w-40 shrink-0"
								/>
							</div>
						</div>
					</SectionCard>
				)}

				{/* Auto-filled from DB */}
				<SectionCard
					icon={CheckCircle2}
					title={t("diploma.autoFilledFromDB") || "Auto-filled from database"}
				>
					<div className="space-y-5">
						{!isAuthCert && (
							<div className="space-y-3">
								<SubGroupDivider label="French Identity" />
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<FieldLabel status={data.firstNameFr ? "ok" : "warn"}>
											First Name
										</FieldLabel>
										<Input
											value={data.firstNameFr}
											onChange={set("firstNameFr")}
											placeholder="First name"
											className="h-9 text-sm"
										/>
									</div>
									<div>
										<FieldLabel status={data.lastNameFr ? "ok" : "warn"}>
											Last Name
										</FieldLabel>
										<Input
											value={data.lastNameFr}
											onChange={set("lastNameFr")}
											placeholder="Last name"
											className="h-9 text-sm"
										/>
									</div>
								</div>
							</div>
						)}

						<div className="space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<FieldLabel>{t("diploma.firstNameAr")}</FieldLabel>
									<Input
										value={data.firstNameAr}
										onChange={set("firstNameAr")}
										dir="rtl"
										className="h-9 text-sm"
									/>
								</div>
								<div>
									<FieldLabel>{t("diploma.lastNameAr")}</FieldLabel>
									<Input
										placeholder="مثال: قداري"
										value={data.lastNameAr}
										onChange={set("lastNameAr")}
										dir="rtl"
										className="h-9 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Academic info */}
						<div className="space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<FieldLabel status={data.dateOfBirth ? "ok" : "warn"}>
										{t("diploma.dateOfBirth")}
									</FieldLabel>
									<DatePicker
										value={data.dateOfBirth || null}
										onChange={(val) =>
											setData((prev) => ({ ...prev, dateOfBirth: val ?? "" }))
										}
										max={new Date().toISOString().split("T")[0]}
										placeholder={t("datePicker.placeholder")}
										clearable={true}
									/>
								</div>
								<div>
									<FieldLabel status={data.graduationYear ? "ok" : "warn"}>
										{t("diploma.graduationYear")}
									</FieldLabel>
									<Input
										value={data.graduationYear}
										onChange={set("graduationYear")}
										placeholder="e.g. 2024"
										className="h-9 text-sm"
									/>
								</div>
								<div>
									<FieldLabel status={data.fieldFr ? "ok" : "warn"}>
										{t("diploma.fieldOfStudy")}
									</FieldLabel>
									<Input
										value={data.fieldFr}
										onChange={set("fieldFr")}
										placeholder="Field of study"
										className="h-9 text-sm"
									/>
								</div>
								<div>
									<FieldLabel status={data.majorFr ? "ok" : "warn"}>
										{t("diploma.major")}
									</FieldLabel>
									<Input
										value={data.majorFr}
										onChange={set("majorFr")}
										placeholder="Optional major"
										className="h-9 text-sm"
									/>
								</div>
								<div className="sm:col-span-2">
									<FieldLabel status={data.specialtyFr ? "ok" : "warn"}>
										{t("diploma.specialty")}
									</FieldLabel>
									<Input
										value={data.specialtyFr}
										onChange={set("specialtyFr")}
										placeholder="Specialty"
										className="h-9 text-sm"
									/>
								</div>
							</div>
						</div>
					</div>
				</SectionCard>

				{!isAuthCert && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Identity & Birth */}
						<SectionCard icon={AlertCircle} title="Required — not in database">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<FieldLabel required>Place of Birth (French)</FieldLabel>
									<Input
										placeholder="e.g. Laghouat"
										value={data.placeOfBirth}
										onChange={set("placeOfBirth")}
										className={`h-9 text-sm transition-colors ${
											!data.placeOfBirth
												? "border-red-300 focus:border-red-400"
												: ""
										}`}
									/>
									{!data.placeOfBirth && (
										<p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
											<AlertCircle className="w-3 h-3" /> Required
										</p>
									)}
								</div>
								<div>
									<FieldLabel optional>Place of Birth (Arabic)</FieldLabel>
									<Input
										placeholder="مثال: الأغواط"
										value={data.placeOfBirthAr}
										onChange={set("placeOfBirthAr")}
										dir="rtl"
										className="h-9 text-sm"
									/>
								</div>

								{/* Filière — separate from Domaine */}
								<div className="sm:col-span-2">
									<FieldLabel required status={data.branchFr ? "ok" : "warn"}>
										Filière (Branch)
									</FieldLabel>
									<Input
										placeholder="e.g. Langue Française"
										value={data.branchFr}
										onChange={set("branchFr")}
										className={`h-9 text-sm ${
											!data.branchFr
												? "border-amber-300 focus:border-amber-400"
												: ""
										}`}
									/>
								</div>
							</div>
						</SectionCard>

						{/* Issuance Details */}
						<SectionCard icon={Printer} title="Issuance Details">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
								<div className="sm:col-span-2">
									<FieldLabel>Date of Issuance</FieldLabel>
									<DatePicker
										value={data.issuanceDate || null}
										onChange={(val) =>
											setData((prev) => ({ ...prev, issuanceDate: val ?? "" }))
										}
										placeholder="Select issuance date"
										clearable={false}
									/>
								</div>
								<div>
									<FieldLabel>Location (French)</FieldLabel>
									<Input
										placeholder="Laghouat"
										value={data.issuanceLocationFr}
										onChange={set("issuanceLocationFr")}
										className="h-9 text-sm"
									/>
								</div>
								<div>
									<FieldLabel>Location (Arabic)</FieldLabel>
									<Input
										placeholder="الأغواط"
										value={data.issuanceLocationAr}
										onChange={set("issuanceLocationAr")}
										dir="rtl"
										className="h-9 text-sm"
									/>
								</div>

								{/* Reference number row: تحت رقم م ش م / 047/2025 */}
								<div className="sm:col-span-2">
									<FieldLabel>تحت رقم (Reference No.)</FieldLabel>
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-500 shrink-0">
											م ش م /
										</span>
										<Input
											placeholder="e.g. 047/2025"
											value={data.diplomaRefNumber}
											onChange={set("diplomaRefNumber")}
											className="h-9 text-sm"
										/>
									</div>
								</div>
							</div>
						</SectionCard>
					</div>
				)}

				{!isAuthCert && (
					<SectionCard icon={ClipboardList} title="Serial Numbers (N° / C)">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
							<div>
								<FieldLabel>N° (Serial Number)</FieldLabel>
								<Input
									placeholder="e.g. 0702949"
									value={data.serialNumber}
									onChange={set("serialNumber")}
									className="h-9 text-sm"
									dir="ltr"
								/>
							</div>
							<div>
								<FieldLabel>C (Code)</FieldLabel>
								<Input
									placeholder="e.g. UN0301/2021/2016/39003424/M/047"
									value={data.serialCode}
									onChange={set("serialCode")}
									className="h-9 text-sm"
									dir="ltr"
								/>
							</div>
						</div>
					</SectionCard>
				)}
			</div>

			{/* ── Footer navigation ── */}
			<div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-gray-100 dark:border-zinc-800 shrink-0">
				<Button
					variant="outline"
					onClick={onBack}
					className="flex items-center gap-2 h-9 px-4 text-sm"
				>
					{isRtl ? (
						<ChevronRight className="w-4 h-4" />
					) : (
						<ChevronLeft className="w-4 h-4" />
					)}
					{t("common.back")}
				</Button>

				<Button
					onClick={onNext}
					disabled={!canProceed}
					className="flex items-center gap-2 h-9 px-6 text-sm bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all"
				>
					{t("diploma.previewDocument")}
					{isRtl ? (
						<ChevronLeft className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</Button>
			</div>
		</div>
	);
};

// Step 2: Preview & Print
interface PreviewStepProps {
	data: DiplomaData;
	selectedType: DocType;
	onBack: () => void;
	onPrint: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
	data,
	selectedType,
	onBack,
	onPrint,
}) => {
	const html =
		selectedType.id === "transcript"
			? buildAuthCertHTML(data)
			: buildMasterDiplomaHTML(data);

	const isLandscape = selectedType.id !== "transcript";
	const docW = isLandscape ? "297mm" : "210mm";
	const docH = isLandscape ? "210mm" : "297mm";

	const [zoom, setZoom] = useState(isLandscape ? 0.95 : 1.15);

	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	return (
		<div className="flex flex-col flex-1 min-h-0 space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
					<Eye className="w-4 h-4" />
					<span>
						Printing:&nbsp;
						<strong className="text-gray-700 dark:text-gray-300">
							{selectedType.labelFr}
						</strong>
						<span className="mx-1 text-gray-400">·</span>
						<span dir="rtl">{selectedType.labelAr}</span>
					</span>
				</p>
				<div className="flex items-center gap-2" dir="ltr">
					<button
						onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
						className="px-2 py-1 rounded border text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
					>
						-
					</button>
					<span className="text-sm w-12 text-center">
						{Math.round(zoom * 100)}%
					</span>
					<button
						onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
						className="px-2 py-1 rounded border text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
					>
						+
					</button>
					<button
						onClick={() => setZoom(1.35)}
						className="px-2 py-1 rounded border text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500"
					>
						Reset
					</button>
				</div>
			</div>

			<div
				className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900 flex justify-center py-4"
				style={{ height: "75vh" }}
			>
				<div
					style={{
						// Switch dimensions based on doc type
						width: selectedType.id === "transcript" ? "210mm" : "297mm",
						height: selectedType.id === "transcript" ? "297mm" : "210mm",
						transform: `scale(${zoom})`,
						transformOrigin: "top center",
						flexShrink: 0,
					}}
				>
					<iframe
						srcDoc={html}
						title="Diploma Preview"
						style={{
							width: docW, // ← matches the document exactly
							height: docH, // ← matches the document exactly
							border: "none",
							background: "#fff",
							boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
						}}
					/>
				</div>
			</div>

			<div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-zinc-800 shrink-0">
				<Button
					variant="outline"
					onClick={onBack}
					className="flex items-center gap-2"
				>
					{isRtl ? (
						<ChevronRight className="w-4 h-4" />
					) : (
						<ChevronLeft className="w-4 h-4" />
					)}
					{t("diploma.backToReview")}
				</Button>
				<Button
					onClick={onPrint}
					className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white"
				>
					<Printer className="w-4 h-4" />
					{t("diploma.printDiploma")}
				</Button>
			</div>
		</div>
	);
};

export const PrintDiplomaDialog: React.FC<PrintDiplomaDialogProps> = ({
	open,
	onClose,
	student,
}) => {
	const { t } = useTranslation();
	const today = new Date().toISOString().split("T")[0];

	const [step, setStep] = useState<"select" | "review" | "preview">("select");
	const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

	const [data, setData] = useState<DiplomaData>({
		firstNameFr: student.firstName,
		lastNameFr: student.lastName,
		dateOfBirth: student.dateOfBirth || "",
		fieldFr: student.expand?.fieldId?.name || "",
		majorFr: student.expand?.majorId?.name || "",
		specialtyFr:
			student.expand?.specialtyId?.name || student.expand?.majorId?.name || "",
		graduationYear: student.graduationYear || "",
		placeOfBirth: "",
		placeOfBirthAr: "",
		firstNameAr: student.firstName,
		lastNameAr: student.lastName,
		issuanceDate: today,
		issuanceLocationFr: "Laghouat",
		issuanceLocationAr: "الأغواط",
		certNumber: 108,
		certDate: today,
		certReferenceNumber: "",
		certSecondRefDate: "",
		certFirstRefDate: "",
		paperSize: "A4",
		addresseeTitle: "",
		addresseeWilaya: "",

		branchFr: student.expand?.majorId?.name || "",
		diplomaRefNumber: "",
		serialNumber: "",
		serialCode: "",
	});

	useEffect(() => {
		if (open) {
			setData((prev) => ({ ...prev, certNumber: getNextCertNumber() }));
		}
	}, [open]);

	const handleClose = () => {
		setStep("select");
		setSelectedTypeId(null);
		onClose();
	};

	const handlePrint = () => {
		const isAuthCert = selectedTypeId === "transcript";
		const html = isAuthCert
			? buildAuthCertHTML(data)
			: buildMasterDiplomaHTML(data);

		const win = window.open("", "_blank", "width=900,height=700");
		if (!win) {
			alert("Please allow pop-ups to print.");
			return;
		}
		win.document.open();
		win.document.write(html);
		win.document.close();
		win.focus();
		setTimeout(() => {
			win.print();
			win.close();
			// Only save the counter after a successful print
			if (isAuthCert) saveCertNumber(data.certNumber);
		}, 800);
	};

	const selectedType =
		ALL_DOC_TYPES.find((dt) => dt.id === selectedTypeId) ?? null;

	const STEPS: { key: typeof step; label: string }[] = [
		{
			key: "select",
			label: t("diploma.stepSelect", { defaultValue: "Select Type" }),
		},
		{
			key: "review",
			label: t("diploma.stepReview", { defaultValue: "Review & Fill" }),
		},
		{
			key: "preview",
			label: t("diploma.stepPreview", { defaultValue: "Preview & Print" }),
		},
	];

	const stepIndex: Record<typeof step, number> = {
		select: 0,
		review: 1,
		preview: 2,
	};
	const { i18n } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent
				className="min-w-270 max-h-[90vh] overflow-hidden p-4 flex flex-col gap-2 backdrop-blur-sm border "
				dir={i18n.language === "ar" ? "rtl" : "ltr"}
				aria-describedby={undefined}
			>
				<DialogHeader className="pb-0 mb-0">
					<DialogTitle className="flex items-center gap-2 text-lg pr-8">
						<Printer className="w-5 h-5 text-green-700" />
						{t("diploma.generateTitle", { defaultValue: "Generate Document" })}
					</DialogTitle>
				</DialogHeader>

				{/* Step indicator */}
				<div className="flex items-center gap-2 py-1 border-b border-gray-100 dark:border-zinc-800 mb-2 mt-2">
					{STEPS.map((s, i) => {
						const current = stepIndex[step];
						const isDone = i < current;
						const isActive = step === s.key;
						return (
							<React.Fragment key={s.key}>
								<button
									onClick={() => {
										if (isDone) setStep(s.key);
									}}
									className={`flex items-center gap-2 text-sm font-medium transition-colors ${
										isActive
											? "text-green-700 dark:text-green-400"
											: isDone
												? "text-green-600 dark:text-green-500 hover:text-green-700 cursor-pointer"
												: "text-gray-400 dark:text-gray-500 cursor-default"
									}`}
								>
									<span
										className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
											isActive
												? "bg-green-700 text-white"
												: isDone
													? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
													: "bg-gray-200 text-gray-500 dark:bg-zinc-700"
										}`}
									>
										{isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
									</span>
									{s.label}
								</button>
								{i < STEPS.length - 1 && (
									<ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
								)}
							</React.Fragment>
						);
					})}
				</div>

				{step === "select" && (
					<SelectTypeStep
						student={student}
						selectedId={selectedTypeId}
						onSelect={setSelectedTypeId}
						onNext={() => setStep("review")}
					/>
				)}
				{step === "review" && (
					<ReviewStep
						data={data}
						setData={setData}
						selectedTypeId={selectedTypeId ?? ""}
						onNext={() => setStep("preview")}
						onBack={() => setStep("select")}
					/>
				)}
				{step === "preview" && selectedType && (
					<PreviewStep
						data={data}
						selectedType={selectedType}
						onBack={() => setStep("review")}
						onPrint={handlePrint}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default PrintDiplomaDialog;
