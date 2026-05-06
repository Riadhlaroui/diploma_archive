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
	addresseeTitle: string;
	addresseeWilaya: string;
	paperSize: "A4" | "A5" | "Letter";
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
const fmtDateFr = (d: string) => {
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
};

function getNextCertNumber(): number {
	const stored = localStorage.getItem(CERT_COUNTER_KEY);
	return stored ? parseInt(stored, 10) + 1 : 108;
}

function saveCertNumber(n: number) {
	localStorage.setItem(CERT_COUNTER_KEY, String(n));
}

// Diploma HTML Generator

function buildDiplomaHTML(d: DiplomaData): string {
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
	const fieldAr = d.fieldFr;
	const specAr = d.specialtyFr;

	return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width"/>
<title>شهادة الليسانس – ${nameFr}</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 210mm; height: 297mm; background: #fff; font-family: 'Amiri', 'Times New Roman', serif; color: #1a1a1a; overflow: hidden; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .page { width: 210mm; height: 297mm; position: relative; display: flex; flex-direction: column; align-items: center; background: #fff; }
  .border-frame { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .border-outer { position: absolute; inset: 6mm; border: 3.5mm solid transparent; border-image: repeating-linear-gradient(45deg, #1a6b35 0px, #1a6b35 5px, #c8a850 5px, #c8a850 8px, #1a6b35 8px, #1a6b35 13px, #fff 13px, #fff 15px) 14; }
  .border-inner { position: absolute; inset: 13mm; border: 1px solid #1a6b35; box-shadow: inset 0 0 0 2px #c8a850, inset 0 0 0 4px #1a6b35; }
  .corner { position: absolute; width: 22mm; height: 22mm; }
  .corner svg { width: 100%; height: 100%; }
  .corner-tl { top: 5mm; left: 5mm; }
  .corner-tr { top: 5mm; right: 5mm; transform: scaleX(-1); }
  .corner-bl { bottom: 5mm; left: 5mm; transform: scaleY(-1); }
  .corner-br { bottom: 5mm; right: 5mm; transform: scale(-1,-1); }
  .content { position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; padding: 22mm 20mm 18mm; align-items: center; }
  .republic-seal { display: flex; flex-direction: column; align-items: center; margin-bottom: 3mm; }
  .seal-badge { width: 22mm; height: 22mm; border-radius: 50%; border: 2px solid #1a6b35; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0faf3 0%, #e0f3e6 100%); box-shadow: 0 0 0 1.5px #c8a850; margin-bottom: 2mm; padding: 2mm; text-align: center; line-height: 1.2; }
  .seal-badge span { font-size: 5pt; color: #1a6b35; font-weight: 700; display: block; }
  .ministry-title { font-size: 10.5pt; color: #1a1a1a; text-align: center; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 1mm; }
  .diploma-title { font-family: 'Scheherazade New', 'Amiri', serif; font-size: 26pt; font-weight: 700; color: #1a1a1a; text-align: center; margin: 2mm 0 5mm; letter-spacing: 2px; }
  .decree-text { font-size: 8.5pt; text-align: center; color: #333; line-height: 2; max-width: 150mm; margin-bottom: 5mm; direction: rtl; }
  .student-block-ar { width: 100%; max-width: 160mm; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 4mm 0; margin-bottom: 4mm; direction: rtl; }
  .student-row { display: flex; align-items: baseline; gap: 4mm; margin: 2mm 0; font-size: 11pt; line-height: 1.8; }
  .row-label { font-weight: 700; color: #1a1a1a; white-space: nowrap; min-width: 38mm; }
  .row-value { font-size: 12pt; font-weight: 700; color: #000; border-bottom: 1px dotted #888; flex: 1; padding-bottom: 0.5mm; }
  .diploma-type-ar { text-align: center; font-size: 14pt; font-weight: 700; margin: 3mm 0; color: #1a1a1a; }
  .field-row { display: flex; justify-content: space-between; align-items: baseline; width: 100%; max-width: 160mm; direction: rtl; font-size: 10.5pt; gap: 3mm; margin-bottom: 6mm; }
  .field-item { display: flex; align-items: baseline; gap: 2mm; }
  .field-label { font-weight: 700; white-space: nowrap; }
  .field-value { border-bottom: 1px dotted #888; min-width: 50mm; padding-bottom: 0.5mm; font-size: 11pt; font-weight: 700; }
  .french-section { width: 100%; max-width: 160mm; direction: ltr; text-align: left; border-top: 1px solid #ccc; padding-top: 4mm; margin-bottom: 5mm; }
  .fr-line { display: flex; align-items: baseline; gap: 3mm; margin: 1.5mm 0; font-size: 9.5pt; }
  .fr-label { font-weight: 700; white-space: nowrap; min-width: 30mm; font-style: italic; }
  .fr-value { font-size: 10pt; font-weight: 700; border-bottom: 1px dotted #888; flex: 1; padding-bottom: 0.5mm; font-style: normal; text-transform: uppercase; }
  .fr-diploma-line { font-size: 9.5pt; margin: 2mm 0 1mm; }
  .signatures-row { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; max-width: 160mm; margin-top: auto; gap: 8mm; direction: rtl; }
  .sig-block { display: flex; flex-direction: column; align-items: center; min-width: 45mm; }
  .sig-title { font-size: 7.5pt; text-align: center; font-weight: 700; color: #1a1a1a; line-height: 1.5; margin-bottom: 12mm; }
  .sig-line { width: 40mm; border-top: 1px solid #666; }
  .location-date { font-size: 9pt; text-align: center; color: #333; margin-bottom: 4mm; direction: rtl; width: 100%; max-width: 160mm; }
  @media print { body, .page { width: 210mm; height: 297mm; } }
</style>
</head>
<body>
<div class="page">
  <div class="border-frame">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    ${["corner-tl", "corner-tr", "corner-bl", "corner-br"]
			.map(
				(cls) => `
    <div class="corner ${cls}">
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L60 0 L60 8 L8 8 L8 60 L0 60 Z" fill="#1a6b35"/>
        <path d="M8 8 L52 8 L52 15 L15 15 L15 52 L8 52 Z" fill="#c8a850"/>
        <path d="M15 15 L45 15 L45 22 L22 22 L22 45 L15 45 Z" fill="#1a6b35"/>
        <circle cx="30" cy="30" r="8" fill="none" stroke="#1a6b35" stroke-width="2"/>
        <rect x="25" y="25" width="10" height="10" transform="rotate(45 30 30)" fill="#c8a850"/>
        <rect x="27.5" y="27.5" width="5" height="5" transform="rotate(45 30 30)" fill="#1a6b35"/>
      </svg>
    </div>`,
			)
			.join("")}
  </div>
  <div class="content">
    <div class="republic-seal">
      <div class="seal-badge">
        <span>الجمهورية الجزائرية</span>
        <span>الديمقراطية الشعبية</span>
      </div>
      <div class="ministry-title">وزارة التعليم العالي والبحث العلمي</div>
    </div>
    <div class="diploma-title">شهادة الليسانس</div>
    <div class="decree-text">
      إن وزير التعليم العالي والبحث العلمي، بمقتضى المرسوم التنفيذي المتضمن إنشاء شهادة الليسانس
      <br/>
      وبمقتضى محضر لجنة المداولات
    </div>
    <div class="student-block-ar">
      <div class="student-row">
        <span class="row-label">:يمنح السيد(ة) :</span>
        <span class="row-value">${nameAr}</span>
      </div>
      <div class="student-row">
        <span class="row-label">:المولود(ة) في :</span>
        <span class="row-value">${fmtDateAr(d.dateOfBirth)}</span>
        <span style="font-weight:700;white-space:nowrap;">د.</span>
        <span class="row-value">${placeAr}</span>
      </div>
    </div>
    <div class="diploma-type-ar">شهادة الليسانس</div>
    <div class="field-row">
      <div class="field-item">
        <span class="field-label">الميدان</span>
        <span class="field-value">${fieldAr}</span>
      </div>
      <div class="field-item">
        <span class="field-label">تخصص :</span>
        <span class="field-value">${specAr}</span>
      </div>
    </div>
    <div class="french-section">
      <div class="fr-line">
        <span class="fr-label">Il est décerné à M: ${nameFr}</span>
      </div>
      <div class="fr-line">
        <span class="fr-label">Né(e) le</span>
        <span class="fr-value">${dobFr}</span>
        <span style="font-weight:700;margin:0 2mm;">à</span>
        <span class="fr-value">${placeFr}</span>
      </div>
      <div class="fr-diploma-line">
        Le <strong>DIPLOME DE LICENCE ${fieldAr.toUpperCase()}</strong>
      </div>
      <div class="fr-line">
        <span class="fr-label">Option</span>
        <span class="fr-value">${specAr.toUpperCase()}</span>
      </div>
    </div>
    <div class="location-date">
      بـ ${d.issuanceLocationAr} في ${issueAr} &nbsp;|&nbsp;
      <span dir="ltr">à ${d.issuanceLocationFr} le ${issueFr}</span>
    </div>
    <div class="signatures-row">
      <div class="sig-block">
        <div class="sig-title">رئيس لجنة المداولات</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-block">
        <div class="sig-title">عميد كلية العلوم الاقتصادية<br/>والتجارية وعلوم التسيير</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-block">
        <div class="sig-title">نائب المدير المكلف بالتعليم<br/>بالنيابة عن وزير التعليم العالي</div>
        <div class="sig-line"></div>
      </div>
    </div>
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
		: "—";

	const certDateFormatted = d.certDate
		? new Date(d.certDate).toLocaleDateString("ar-DZ")
		: "—";

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
  min-width: 50mm;
  display: inline-block;
  vertical-align: bottom;
  background: transparent;
}

  .body-text {
    font-size: 13pt;
    line-height: 2.4;
    text-align: justify;
    margin: 6mm 0;
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
        <span class="meta-blank"></span>
        ، المؤرخة في :
        <span class="meta-blank"></span>
      </span>
    </div>
  </div>


  <!-- Body -->
  <div class="body-text">
    ردًّا على إرسالكم في المرجع أعلاه، بخصوص التَّأكُّد من صحَّة شهادة نجاح السّيد(ة) :<br/>
    <strong>${nameAr}</strong> ،المولود(ة) بتاريخ <strong>${dobFormatted}</strong> <strong>${d.placeOfBirthAr || d.placeOfBirth || "—"}</strong><br/>
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

// Step 0: Select Document Type

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
		<div className="flex flex-col flex-1 gap-4 pb-2 min-h-0">
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
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-rows-3 gap-3 h-full">
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
                  w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors
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
	const canProceed = isAuthCert ? !!data.certDate : !!data.placeOfBirth;

	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	return (
		<div className="flex flex-col flex-1 min-h-0">
			<div className="flex-1 overflow-y-auto min-h-0 space-y-5 py-2 pr-1">
				{/* ── Auth-cert specific section ── */}
				{isAuthCert && (
					<div className="rounded-xl border border-blue-200 dark:border-blue-800">
						<div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
							<ClipboardList className="w-4 h-4 text-blue-500" />
							<h3 className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest">
								{t("diploma.certInfo")} — معلومات الوثيقة
							</h3>
						</div>
						<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
							{/* Doc date */}
							<div className="space-y-1">
								<label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
									تاريخ الوثيقة
								</label>
								<DatePicker
									value={data.certDate || null}
									onChange={(val) =>
										setData((p) => ({ ...p, certDate: val ?? "" }))
									}
									placeholder="Select date"
									clearable={false}
								/>
							</div>

							{/* Paper size */}
							<div className="space-y-1">
								<label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t("diploma.paperSize")}
								</label>
								<select
									value={data.paperSize}
									onChange={(e) =>
										setData((p) => ({
											...p,
											paperSize: e.target.value as DiplomaData["paperSize"],
										}))
									}
									className="w-full h-9 px-3 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
								>
									<option value="A4">A4</option>
									<option value="A5">A5</option>
									<option value="Letter">Letter</option>
								</select>
							</div>

							{/* Place of birth Arabic — required for the body text */}
							<div className="space-y-1">
								<label className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
									مكان الميلاد <span className="text-red-500">*</span>
								</label>
								<Input
									placeholder="مثال: عين وسارة-الجلفة"
									value={data.placeOfBirthAr}
									onChange={set("placeOfBirthAr")}
									dir="rtl"
									className={`h-9 text-sm ${!data.placeOfBirthAr ? "border-red-300" : ""}`}
								/>
							</div>

							{/* Arabic name override */}
							<div className="space-y-1">
								<label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
									الاسم واللقب بالعربية
									<span className="normal-case font-normal text-gray-400 ml-1">
										(اختياري)
									</span>
								</label>
								<Input
									placeholder="مثال: بن شويطة محمد"
									value={`${data.lastNameAr} ${data.firstNameAr}`.trim()}
									onChange={(e) => {
										const parts = e.target.value.trim().split(" ");
										setData((p) => ({
											...p,
											lastNameAr: parts.slice(0, -1).join(" "),
											firstNameAr: parts.at(-1) ?? "",
										}));
									}}
									dir="rtl"
									className="h-9 text-sm"
								/>
							</div>
						</div>
					</div>
				)}
				{/* Section 1: Auto-filled */}
				<div className="rounded-xl border border-gray-200 dark:border-zinc-700">
					<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
						<CheckCircle2 className="w-4 h-4 text-green-500" />
						<h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
							Auto-filled from database
						</h3>
					</div>

					<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
						{!isAuthCert && (
							<>
								<div className="space-y-1 md:col-span-2">
									<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Full Name (French)
										<CheckCircle2 className="w-3 h-3 text-green-500" />
									</label>
									<Input
										value={`${data.lastNameFr} ${data.firstNameFr}`.trim()}
										onChange={(e) => {
											const parts = e.target.value.trim().split(" ");
											setData((p) => ({
												...p,
												lastNameFr: parts.slice(0, -1).join(" "),
												firstNameFr: parts.at(-1) ?? "",
											}));
										}}
										placeholder="e.g. KADRI Ayoub"
										className="h-9 text-sm"
									/>
								</div>

								<div className="space-y-1">
									<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										First Name (French)
										{data.firstNameFr ? (
											<CheckCircle2 className="w-3 h-3 text-green-500" />
										) : (
											<AlertCircle className="w-3 h-3 text-amber-400" />
										)}
									</label>
									<Input
										value={data.firstNameFr}
										onChange={set("firstNameFr")}
										placeholder="First name"
										className="h-9 text-sm"
									/>
								</div>
								<div className="space-y-1">
									<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Last Name (French)
										{data.lastNameFr ? (
											<CheckCircle2 className="w-3 h-3 text-green-500" />
										) : (
											<AlertCircle className="w-3 h-3 text-amber-400" />
										)}
									</label>
									<Input
										value={data.lastNameFr}
										onChange={set("lastNameFr")}
										placeholder="Last name"
										className="h-9 text-sm"
									/>
								</div>
							</>
						)}

						<div className="space-y-1">
							<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Date of Birth
								{data.dateOfBirth ? (
									<CheckCircle2 className="w-3 h-3 text-green-500" />
								) : (
									<AlertCircle className="w-3 h-3 text-amber-400" />
								)}
							</label>
							<DatePicker
								value={data.dateOfBirth || null}
								onChange={(val) =>
									setData((prev) => ({ ...prev, dateOfBirth: val ?? "" }))
								}
								max={new Date().toISOString().split("T")[0]}
								placeholder="Select date of birth"
								clearable={false}
							/>
						</div>
						<div className="space-y-1">
							<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Graduation Year
								{data.graduationYear ? (
									<CheckCircle2 className="w-3 h-3 text-green-500" />
								) : (
									<AlertCircle className="w-3 h-3 text-amber-400" />
								)}
							</label>
							<Input
								value={data.graduationYear}
								onChange={set("graduationYear")}
								placeholder="e.g. 2024"
								className="h-9 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Field of Study
								{data.fieldFr ? (
									<CheckCircle2 className="w-3 h-3 text-green-500" />
								) : (
									<AlertCircle className="w-3 h-3 text-amber-400" />
								)}
							</label>
							<Input
								value={data.fieldFr}
								onChange={set("fieldFr")}
								placeholder="Field of study"
								className="h-9 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-medium text-gray-500 uppercase">
								Major (Filière)
							</label>
							<Input
								value={data.majorFr}
								onChange={set("majorFr")}
								placeholder="Optional major"
								className="h-9 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Specialty
								{data.specialtyFr ? (
									<CheckCircle2 className="w-3 h-3 text-green-500" />
								) : (
									<AlertCircle className="w-3 h-3 text-amber-400" />
								)}
							</label>
							<Input
								value={data.specialtyFr}
								onChange={set("specialtyFr")}
								placeholder="Specialty"
								className="h-9 text-sm"
							/>
						</div>
					</div>
				</div>

				{/* Side-by-side: Missing fields + Issuance */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{/* Section 2: Required manual */}

					{!isAuthCert && (
						<>
							<div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden flex flex-col">
								<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
									<AlertCircle className="w-4 h-4 text-red-400" />
									<h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
										Required — not in database
									</h3>
								</div>
								<div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
									<div className="space-y-1">
										<label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Place of Birth (French){" "}
											<span className="text-red-500 ml-0.5">*</span>
										</label>
										<Input
											placeholder="e.g. Laghouat"
											value={data.placeOfBirth}
											onChange={set("placeOfBirth")}
											className={`h-9 text-sm ${!data.placeOfBirth ? "border-red-300 focus:border-red-400" : ""}`}
										/>
										{!data.placeOfBirth && (
											<p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
												<AlertCircle className="w-3 h-3" /> Required
											</p>
										)}
									</div>
									<div className="space-y-1">
										<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
											Place of Birth (Arabic){" "}
											<span className="normal-case font-normal text-gray-400 ml-1">
												(optional)
											</span>
										</label>
										<Input
											placeholder="مثال: الأغواط"
											value={data.placeOfBirthAr}
											onChange={set("placeOfBirthAr")}
											dir="rtl"
											className="h-9 text-sm"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
											Last Name (Arabic){" "}
											<span className="normal-case font-normal text-gray-400 ml-1">
												(optional)
											</span>
										</label>
										<Input
											placeholder="مثال: قداري"
											value={data.lastNameAr}
											onChange={set("lastNameAr")}
											dir="rtl"
											className="h-9 text-sm"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
											First Name (Arabic){" "}
											<span className="normal-case font-normal text-gray-400 ml-1">
												(optional)
											</span>
										</label>
										<Input
											placeholder="مثال: أيوب"
											value={data.firstNameAr}
											onChange={set("firstNameAr")}
											dir="rtl"
											className="h-9 text-sm"
										/>
									</div>
								</div>
							</div>
							<div className="rounded-xl border border-gray-200 dark:border-zinc-700 flex flex-col">
								<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
									<Printer className="w-4 h-4 text-gray-400" />
									<h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
										Issuance details
									</h3>
								</div>
								<div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
									<div className="space-y-1 sm:col-span-2">
										<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Date of Issuance
										</label>
										<DatePicker
											value={data.issuanceDate || null}
											onChange={(val) =>
												setData((prev) => ({
													...prev,
													issuanceDate: val ?? "",
												}))
											}
											placeholder="Select issuance date"
											clearable={false}
										/>
									</div>
									<div className="space-y-1">
										<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Location (French)
										</label>
										<Input
											placeholder="Laghouat"
											value={data.issuanceLocationFr}
											onChange={set("issuanceLocationFr")}
											className="h-9 text-sm"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
											Location (Arabic)
										</label>
										<Input
											placeholder="الأغواط"
											value={data.issuanceLocationAr}
											onChange={set("issuanceLocationAr")}
											dir="rtl"
											className="h-9 text-sm"
										/>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			<div className="flex justify-between pt-3 border-t border-gray-100 dark:border-zinc-800 shrink-0">
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
					{t("common.back")}
				</Button>
				<Button
					onClick={onNext}
					disabled={!canProceed}
					className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6"
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
			: buildDiplomaHTML(data);

	const [zoom, setZoom] = useState(1.35);

	const { t, i18n } = useTranslation();
	const isRtl = i18n.language === "ar";

	return (
		<div className="flex flex-col flex-1 min-h-0 space-y-4">
			<div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
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
							width: "200mm",
							height: "350mm",
							transform: `scale(${zoom})`,
							transformOrigin: "top center",
							flexShrink: 0,
						}}
					>
						<iframe
							srcDoc={html}
							title="Diploma Preview"
							style={{
								width: "200mm",
								height: "350mm",
								border: "none",
								background: "#fff",
								boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
							}}
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
					{[
						["Name (FR)", `${data.lastNameFr} ${data.firstNameFr}`],
						[
							"Name (AR)",
							`${data.lastNameAr || data.lastNameFr} ${data.firstNameAr || data.firstNameFr}`,
						],
						["Born", `${fmtDateFr(data.dateOfBirth)}, ${data.placeOfBirth}`],
						[
							"Issued",
							`${fmtDateFr(data.issuanceDate)} – ${data.issuanceLocationFr}`,
						],
					].map(([label, value]) => (
						<div
							key={label}
							className="bg-gray-50 dark:bg-zinc-800 rounded-md px-3 py-2"
						>
							<div className="text-gray-400 uppercase tracking-wider mb-0.5">
								{label}
							</div>
							<div className="font-medium text-gray-800 dark:text-gray-200 truncate">
								{value}
							</div>
						</div>
					))}
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
		paperSize: "A4",
		addresseeTitle: "",
		addresseeWilaya: "",
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
		const html = isAuthCert ? buildAuthCertHTML(data) : buildDiplomaHTML(data);

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
				className="max-w-[90vw]! w-[90vw]! h-[83vh]! max-h-[90vh] overflow-hidden p-4 flex flex-col gap-2 bg-gray-50"
				dir={i18n.language === "ar" ? "rtl" : "ltr"}
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
