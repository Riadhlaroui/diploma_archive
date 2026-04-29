/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DatePicker } from "./ui/DatePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

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
	/* Auto-filled from DB */
	firstNameFr: string;
	lastNameFr: string;
	dateOfBirth: string;
	fieldFr: string;
	majorFr: string;
	specialtyFr: string;
	graduationYear: string;
	/* Manual / supplemental */
	placeOfBirth: string; // required – not in DB
	placeOfBirthAr: string; // Arabic transliteration – optional
	firstNameAr: string; // Arabic first name – for Arabic block
	lastNameAr: string; // Arabic last name  – for Arabic block
	issuanceDate: string;
	issuanceLocationFr: string;
	issuanceLocationAr: string;
}

interface PrintDiplomaDialogProps {
	open: boolean;
	onClose: () => void;
	student: Student;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Diploma HTML Generator ───────────────────────────────────────────────────

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
	const fieldAr = d.fieldFr; // shown as-is; user may have entered Arabic already
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

  body {
    width: 210mm;
    height: 297mm;
    background: #fff;
    font-family: 'Amiri', 'Times New Roman', serif;
    color: #1a1a1a;
    overflow: hidden;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    height: 297mm;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
  }

  /* ── Decorative border ── */
  .border-frame {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .border-outer {
    position: absolute;
    inset: 6mm;
    border: 3.5mm solid transparent;
    border-image: repeating-linear-gradient(
      45deg,
      #1a6b35 0px, #1a6b35 5px,
      #c8a850 5px, #c8a850 8px,
      #1a6b35 8px, #1a6b35 13px,
      #fff     13px, #fff  15px
    ) 14;
  }

  .border-inner {
    position: absolute;
    inset: 13mm;
    border: 1px solid #1a6b35;
    box-shadow: inset 0 0 0 2px #c8a850, inset 0 0 0 4px #1a6b35;
  }

  /* Corner ornaments */
  .corner {
    position: absolute;
    width: 22mm;
    height: 22mm;
  }
  .corner svg { width: 100%; height: 100%; }
  .corner-tl { top: 5mm;  left: 5mm; }
  .corner-tr { top: 5mm;  right: 5mm; transform: scaleX(-1); }
  .corner-bl { bottom: 5mm; left: 5mm;  transform: scaleY(-1); }
  .corner-br { bottom: 5mm; right: 5mm;  transform: scale(-1,-1); }

  /* ── Content ── */
  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 22mm 20mm 18mm;
    align-items: center;
  }

  /* Republic seal area */
  .republic-seal {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 3mm;
  }

  .seal-badge {
    width: 22mm;
    height: 22mm;
    border-radius: 50%;
    border: 2px solid #1a6b35;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0faf3 0%, #e0f3e6 100%);
    box-shadow: 0 0 0 1.5px #c8a850;
    margin-bottom: 2mm;
    padding: 2mm;
    text-align: center;
    line-height: 1.2;
  }

  .seal-badge span {
    font-size: 5pt;
    color: #1a6b35;
    font-weight: 700;
    display: block;
  }

  .ministry-title {
    font-size: 10.5pt;
    color: #1a1a1a;
    text-align: center;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 1mm;
  }

  /* Main title */
  .diploma-title {
    font-family: 'Scheherazade New', 'Amiri', serif;
    font-size: 26pt;
    font-weight: 700;
    color: #1a1a1a;
    text-align: center;
    margin: 2mm 0 5mm;
    letter-spacing: 2px;
  }

  /* Decree text */
  .decree-text {
    font-size: 8.5pt;
    text-align: center;
    color: #333;
    line-height: 2;
    max-width: 150mm;
    margin-bottom: 5mm;
    direction: rtl;
  }

  /* ── Arabic student block ── */
  .student-block-ar {
    width: 100%;
    max-width: 160mm;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 4mm 0;
    margin-bottom: 4mm;
    direction: rtl;
  }

  .student-row {
    display: flex;
    align-items: baseline;
    gap: 4mm;
    margin: 2mm 0;
    font-size: 11pt;
    line-height: 1.8;
  }

  .row-label {
    font-weight: 700;
    color: #1a1a1a;
    white-space: nowrap;
    min-width: 38mm;
  }

  .row-value {
    font-size: 12pt;
    font-weight: 700;
    color: #000;
    border-bottom: 1px dotted #888;
    flex: 1;
    padding-bottom: 0.5mm;
  }

  .diploma-type-ar {
    text-align: center;
    font-size: 14pt;
    font-weight: 700;
    margin: 3mm 0;
    color: #1a1a1a;
  }

  .field-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
    max-width: 160mm;
    direction: rtl;
    font-size: 10.5pt;
    gap: 3mm;
    margin-bottom: 6mm;
  }

  .field-item {
    display: flex;
    align-items: baseline;
    gap: 2mm;
  }

  .field-label {
    font-weight: 700;
    white-space: nowrap;
  }

  .field-value {
    border-bottom: 1px dotted #888;
    min-width: 50mm;
    padding-bottom: 0.5mm;
    font-size: 11pt;
    font-weight: 700;
  }

  /* ── French section ── */
  .french-section {
    width: 100%;
    max-width: 160mm;
    direction: ltr;
    text-align: left;
    border-top: 1px solid #ccc;
    padding-top: 4mm;
    margin-bottom: 5mm;
  }

  .fr-line {
    display: flex;
    align-items: baseline;
    gap: 3mm;
    margin: 1.5mm 0;
    font-size: 9.5pt;
  }

  .fr-label {
    font-weight: 700;
    white-space: nowrap;
    min-width: 30mm;
    font-style: italic;
  }

  .fr-value {
    font-size: 10pt;
    font-weight: 700;
    border-bottom: 1px dotted #888;
    flex: 1;
    padding-bottom: 0.5mm;
    font-style: normal;
    text-transform: uppercase;
  }

  .fr-diploma-line {
    font-size: 9.5pt;
    margin: 2mm 0 1mm;
  }

  /* ── Signatures ── */
  .signatures-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    max-width: 160mm;
    margin-top: auto;
    gap: 8mm;
    direction: rtl;
  }

  .sig-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 45mm;
  }

  .sig-title {
    font-size: 7.5pt;
    text-align: center;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.5;
    margin-bottom: 12mm;
  }

  .sig-line {
    width: 40mm;
    border-top: 1px solid #666;
  }

  .location-date {
    font-size: 9pt;
    text-align: center;
    color: #333;
    margin-bottom: 4mm;
    direction: rtl;
    width: 100%;
    max-width: 160mm;
  }

  @media print {
    body, .page {
      width: 210mm;
      height: 297mm;
    }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Border Frame -->
  <div class="border-frame">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <!-- Corner ornaments -->
    ${["corner-tl", "corner-tr", "corner-bl", "corner-br"]
			.map(
				(cls) => `
    <div class="corner ${cls}">
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L60 0 L60 8 L8 8 L8 60 L0 60 Z" fill="#1a6b35"/>
        <path d="M8 8 L52 8 L52 15 L15 15 L15 52 L8 52 Z" fill="#c8a850"/>
        <path d="M15 15 L45 15 L45 22 L22 22 L22 45 L15 45 Z" fill="#1a6b35"/>
        <!-- Diamond -->
        <circle cx="30" cy="30" r="8" fill="none" stroke="#1a6b35" stroke-width="2"/>
        <rect x="25" y="25" width="10" height="10" transform="rotate(45 30 30)" fill="#c8a850"/>
        <rect x="27.5" y="27.5" width="5" height="5" transform="rotate(45 30 30)" fill="#1a6b35"/>
      </svg>
    </div>`,
			)
			.join("")}
  </div>

  <!-- Content -->
  <div class="content">

    <!-- Republic seal -->
    <div class="republic-seal">
      <div class="seal-badge">
        <span>الجمهورية الجزائرية</span>
        <span>الديمقراطية الشعبية</span>
      </div>
      <div class="ministry-title">وزارة التعليم العالي والبحث العلمي</div>
    </div>

    <!-- Diploma title -->
    <div class="diploma-title">شهادة الليسانس</div>

    <!-- Decree text -->
    <div class="decree-text">
      إن وزير التعليم العالي والبحث العلمي، بمقتضى المرسوم التنفيذي المتضمن إنشاء شهادة الليسانس
      <br/>
      وبمقتضى محضر لجنة المداولات
    </div>

    <!-- Arabic student block -->
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

    <!-- Diploma type AR -->
    <div class="diploma-type-ar">شهادة الليسانس</div>

    <!-- Field / specialty row -->
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

    <!-- French section -->
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

    <!-- Location & date -->
    <div class="location-date">
      بـ ${d.issuanceLocationAr} في ${issueAr} &nbsp;|&nbsp;
      <span dir="ltr">à ${d.issuanceLocationFr} le ${issueFr}</span>
    </div>

    <!-- Signatures -->
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

  </div><!-- /content -->
</div><!-- /page -->
</body>
</html>`;
}

// ─── Review Step ──────────────────────────────────────────────────────────────

// ─── Review Step ──────────────────────────────────────────────────────────────

interface ReviewStepProps {
	data: DiplomaData;
	setData: React.Dispatch<React.SetStateAction<DiplomaData>>;
	onNext: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, setData, onNext }) => {
	const set =
		(key: keyof DiplomaData) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setData((prev) => ({ ...prev, [key]: e.target.value }));

	const canProceed = !!data.placeOfBirth;

	return (
		<div className="space-y-5 pb-2">
			{/* ── Section 1: Auto-filled ── */}
			<div className="rounded-xl border border-gray-200 dark:border-zinc-700">
				<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
					<CheckCircle2 className="w-4 h-4 text-green-500" />
					<h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
						Auto-filled from database
					</h3>
				</div>

				<div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
					{/* First Name */}
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

					{/* Last Name */}
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

					{/* Date of Birth */}
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

					{/* Graduation Year */}
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

					{/* Field */}
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

					{/* Specialty */}
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

			{/* ── Side-by-Side Wrapper for Section 2 & 3 ── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				{/* ── Section 2: Arabic names + place of birth ── */}
				<div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden flex flex-col">
					<div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
						<AlertCircle className="w-4 h-4 text-red-400" />
						<h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-widest">
							Required — not in database
						</h3>
					</div>

					<div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
						{/* Place of Birth FR */}
						<div className="space-y-1">
							<label className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Place of Birth (French)
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

						{/* Place of Birth AR */}
						<div className="space-y-1">
							<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
								Place of Birth (Arabic)
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

						{/* Last Name AR */}
						<div className="space-y-1">
							<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
								Last Name (Arabic)
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

						{/* First Name AR */}
						<div className="space-y-1">
							<label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
								First Name (Arabic)
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

				{/* ── Section 3: Issuance ── */}
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
									setData((prev) => ({ ...prev, issuanceDate: val ?? "" }))
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
			</div>

			{/* ── Footer ── */}
			<div className="flex justify-end pt-1">
				<Button
					onClick={onNext}
					disabled={!canProceed}
					className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6"
				>
					Preview Document
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
};

// ─── Preview Step ─────────────────────────────────────────────────────────────

interface PreviewStepProps {
	data: DiplomaData;
	onBack: () => void;
	onPrint: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ data, onBack, onPrint }) => {
	const html = buildDiplomaHTML(data);
	const [zoom, setZoom] = useState(1.35);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
					<Eye className="w-4 h-4" />
					This is how the diploma will look when printed.
				</p>
				{/* Zoom controls */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
						className="px-2 py-1 rounded border text-sm hover:bg-gray-100 dark:hover:bg-zinc-700"
					>
						−
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

			{/* Scaled preview iframe */}
			<div
				className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900 flex justify-center py-4"
				style={{ height: "75vh" }}
			>
				<div
					style={{
						width: "200mm",
						height: "350mm", // matches your custom size
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

			{/* Summary of key fields */}
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

			<div className="flex justify-between items-center pt-2">
				<Button
					variant="outline"
					onClick={onBack}
					className="flex items-center gap-2"
				>
					<ChevronLeft className="w-4 h-4" />
					Back to Review
				</Button>
				<Button
					onClick={onPrint}
					className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white"
				>
					<Printer className="w-4 h-4" />
					Print Diploma
				</Button>
			</div>
		</div>
	);
};

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export const PrintDiplomaDialog: React.FC<PrintDiplomaDialogProps> = ({
	open,
	onClose,
	student,
}) => {
	const { t } = useTranslation();
	const today = new Date().toISOString().split("T")[0];

	const [step, setStep] = useState<"review" | "preview">("review");
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
		firstNameAr: "",
		lastNameAr: "",
		issuanceDate: today,
		issuanceLocationFr: "Laghouat",
		issuanceLocationAr: "الأغواط",
	});

	const handleClose = () => {
		setStep("review");
		onClose();
	};

	const handlePrint = () => {
		const html = buildDiplomaHTML(data);
		const win = window.open("", "_blank", "width=900,height=700");
		if (!win) {
			alert("Please allow pop-ups to print the diploma.");
			return;
		}
		win.document.open();
		win.document.write(html);
		win.document.close();
		win.focus();
		setTimeout(() => {
			win.print();
			win.close();
		}, 800);
	};

	const STEPS = [
		{
			key: "review",
			label: t("diploma.stepReview", { defaultValue: "Review & Fill" }),
		},
		{
			key: "preview",
			label: t("diploma.stepPreview", { defaultValue: "Preview & Print" }),
		},
	];

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-[90vw]! w-[90vw]! h-[83vh]! max-h-[90vh] overflow-y-auto p-4 flex flex-col gap-2">
				<DialogHeader className="pb-0 mb-0">
					<DialogTitle className="flex items-center gap-2 text-lg">
						<Printer className="w-5 h-5 text-green-700" />
						{t("diploma.generateTitle", {
							defaultValue: "Generate Licence Diploma",
						})}
					</DialogTitle>
				</DialogHeader>

				{/* Step indicator */}
				<div className="flex items-center gap-2 py-1 border-b border-gray-100 dark:border-zinc-800 mb-2 mt-2">
					{STEPS.map((s, i) => (
						<React.Fragment key={s.key}>
							<button
								onClick={() => i === 0 && setStep("review")}
								className={`flex items-center gap-2 text-sm font-medium transition-colors ${
									step === s.key
										? "text-green-700 dark:text-green-400"
										: "text-gray-400 dark:text-gray-500"
								}`}
							>
								<span
									className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
										step === s.key
											? "bg-green-700 text-white"
											: step === "preview" && i === 0
												? "bg-green-100 text-green-700 dark:bg-green-900/30"
												: "bg-gray-200 text-gray-500 dark:bg-zinc-700"
									}`}
								>
									{step === "preview" && i === 0 ? (
										<CheckCircle2 className="w-3.5 h-3.5" />
									) : (
										i + 1
									)}
								</span>
								{s.label}
							</button>
							{i < STEPS.length - 1 && (
								<ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
							)}
						</React.Fragment>
					))}
				</div>

				{step === "review" && (
					<ReviewStep
						data={data}
						setData={setData}
						onNext={() => setStep("preview")}
					/>
				)}
				{step === "preview" && (
					<PreviewStep
						data={data}
						onBack={() => setStep("review")}
						onPrint={handlePrint}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default PrintDiplomaDialog;
