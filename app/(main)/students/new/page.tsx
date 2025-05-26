/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectLabel,
	SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

import pb from "@/lib/pocketbase";
import { toast } from "sonner";
import { createStudent } from "@/app/src/services/studentService"; // adjust the path accordingly

import { Separator } from "@/components/ui/separator";
import DocumentUploadDialog from "@/components/DocumentUploadDialog";

const CreateStudentPage = () => {
	const { t } = useTranslation();

	const [openDialog, setOpenDialog] = useState(false);

	const [faculties, setFaculties] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [specialties, setSpecialties] = useState<any[]>([]);

	const [selectedFaculty, setSelectedFaculty] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);

	const [files, setFiles] = useState<File[]>([]);

	const [form, setForm] = useState({
		matricule: "",
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		enrollmentYear: "",
		specialtyId: "",
		field: "",
		major: "",
		file: null as File | null,
	});

	useEffect(() => {
		pb.collection("Archive_faculties")
			.getFullList()
			.then((data) => setFaculties(data));
	}, []);

	useEffect(() => {
		if (selectedFaculty) {
			pb.collection("Archive_departments")
				.getFullList({ filter: `facultyId="${selectedFaculty}"` })
				.then(setDepartments);
		} else {
			setDepartments([]);
		}
		setSelectedDepartment("");
		setSpecialties([]);
		setForm((prev) => ({ ...prev, specialtyId: "", field: "", major: "" }));
		setSelectedSpecialty(null);
	}, [selectedFaculty]);

	useEffect(() => {
		if (selectedDepartment) {
			pb.collection("Archive_specialties")
				.getFullList({ filter: `departmentId="${selectedDepartment}"` })
				.then(setSpecialties);
		} else {
			setSpecialties([]);
			setForm((prev) => ({ ...prev, specialtyId: "", field: "", major: "" }));
			setSelectedSpecialty(null);
		}
	}, [selectedDepartment]);

	const handleSpecialtyChange = (value: string) => {
		const spec = specialties.find((s) => s.id === value);
		if (spec) {
			setForm((prev) => ({
				...prev,
				specialtyId: spec.id,
				major: prev.major || spec.major || "",
			}));
			setSelectedSpecialty(spec);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleCreate = async () => {
		const requiredFields = [
			"matricule",
			"firstName",
			"lastName",
			"dateOfBirth",
			"enrollmentYear",
			"specialtyId",
			"field",
			"major",
		];

		const missingField = requiredFields.find(
			(key) => !form[key as keyof typeof form]
		);
		if (missingField) {
			toast.error(`Please fill in the required field: ${missingField}`);
			return;
		}

		const dob = new Date(form.dateOfBirth);
		if (isNaN(dob.getTime())) {
			toast.error("Invalid date of birth format.");
			return;
		}
		if (dob > new Date()) {
			toast.error("Date of birth cannot be in the future.");
			return;
		}

		const year = parseInt(form.enrollmentYear);
		const currentYear = new Date().getFullYear();
		if (
			!form.enrollmentYear ||
			isNaN(year) ||
			year < 1900 ||
			year > currentYear
		) {
			toast.error(`Enrollment year must be between 1900 and ${currentYear}.`);
			return;
		}

		console.log("Form data before submission:", form);
		console.log("Files to upload:", files);

		try {
			await createStudent(form, files);
			toast.success("Student created successfully.");

			setForm({
				matricule: "",
				firstName: "",
				lastName: "",
				dateOfBirth: "",
				enrollmentYear: "",
				specialtyId: "",
				field: "",
				major: "",
				file: null,
			});
			setSelectedFaculty("");
			setSelectedDepartment("");
			setSelectedSpecialty(null);
			setDepartments([]);
			setSpecialties([]);
			setFiles([]);
		} catch (error: any) {
			console.error("Create student error:", error);
			if (error.response?.status === 400) {
				toast.error(
					<div className="flex items-center gap-2">
						<div>
							<div className="font-semibold text-[15px]">
								A student with matricule already exists.
							</div>
							<div className="text-sm">Please choose a different name.</div>
						</div>
					</div>
				);
				return;
			}
			toast.error(error?.message || "Failed to create student.");
		}
	};

	return (
		<>
			<div className="min-h-screen flex items-start justify-start dark:bg-zinc-950 p-2">
				<div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[3px] p-6 relative">
					<h2 className="text-xl font-semibold mb-2">Add new Student</h2>
					<p className="text-sm text-gray-500 mb-4">
						Please fill in the details below to create a new student record.
					</p>
					<Separator className=" mb-2" />

					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleCreate();
						}}
						className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[3px] p-2 relative"
					>
						<div className="grid grid-cols-2 gap-4 mb-4">
							{/* Faculty */}
							<div>
								<label className="block text-sm mb-1">Faculty</label>
								<Select
									value={selectedFaculty}
									onValueChange={setSelectedFaculty}
								>
									<SelectTrigger className="w-full h-14 bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded focus:outline-none">
										<SelectValue placeholder={t("select")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Faculty</SelectLabel>
											{faculties.map((f) => (
												<SelectItem key={f.id} value={f.id}>
													{f.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{/* Department */}
							<div>
								<label className="block text-sm mb-1">Department</label>
								<Select
									value={selectedDepartment}
									onValueChange={setSelectedDepartment}
									disabled={!selectedFaculty}
								>
									<SelectTrigger className="w-full h-14 bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded focus:outline-none">
										<SelectValue placeholder={t("select")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Department</SelectLabel>
											{departments.map((d) => (
												<SelectItem key={d.id} value={d.id}>
													{d.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Specialty */}
						<div className="mb-4">
							<label className="block text-sm mb-1">Specialty</label>
							<Select
								value={form.specialtyId}
								onValueChange={handleSpecialtyChange}
								disabled={!selectedDepartment}
							>
								<SelectTrigger className="w-full h-14 bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded focus:outline-none">
									<SelectValue placeholder={t("select")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Specialty</SelectLabel>
										{specialties.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>

						{/* Matricule */}
						<div className="relative">
							<input
								type="text"
								name="matricule"
								value={form.matricule}
								className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
								placeholder=""
								onChange={handleChange}
							/>
							<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
								Matricule<span className="text-[#D81212]">*</span>
							</label>
						</div>

						{/* First and Last Name */}
						<div className="flex flex-col gap-[0.7rem] mt-2">
							<div className="flex gap-4">
								<div className="relative w-1/2">
									<input
										type="text"
										name="firstName"
										value={form.firstName}
										onChange={handleChange}
										className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
										placeholder=""
									/>
									<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
										{t("addStaffDialog.firstName")}
										<span className="text-[#D81212]">*</span>
									</label>
								</div>
								<div className="relative w-1/2">
									<input
										type="text"
										name="lastName"
										value={form.lastName}
										onChange={handleChange}
										className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
										placeholder=""
									/>
									<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
										{t("addStaffDialog.lastName")}
										<span className="text-[#D81212]">*</span>
									</label>
								</div>
							</div>
						</div>

						{/* Field and Major */}
						<div className="grid grid-cols-2 gap-4 mt-4">
							<div className="relative">
								<input
									type="text"
									name="field"
									value={form.field}
									onChange={handleChange}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
									Field<span className="text-[#D81212]">*</span>
								</label>
							</div>

							<div className="relative">
								<input
									type="text"
									name="major"
									value={form.major}
									onChange={handleChange}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
									Major<span className="text-[#D81212]">*</span>
								</label>
							</div>
						</div>

						{/* Date of Birth and Enrollment Year */}
						<div className="grid grid-cols-2 gap-4 mt-4">
							<div className="relative">
								<input
									type="date"
									name="dateOfBirth"
									value={form.dateOfBirth}
									onChange={handleChange}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none not-focus:text-[#697079]"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
									Date Of Birth<span className="text-[#D81212]">*</span>
								</label>
							</div>

							<div className="relative">
								<input
									type="number"
									name="enrollmentYear"
									value={form.enrollmentYear}
									onChange={handleChange}
									min="1900"
									max={new Date().getFullYear()}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
									placeholder=""
								/>
								<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
									Enrollment Year<span className="text-[#D81212]">*</span>
								</label>
							</div>
						</div>

						{/* File Upload Button */}
						<button
							type="button"
							onClick={() => setOpenDialog(true)}
							className="mt-4 w-full outline-none bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] h-[4rem] flex items-center justify-center font-semibold"
						>
							Upload Documents
						</button>

						<Separator className="mt-2.5" />

						<div className="flex justify-end mt-6">
							<Button type="submit">Create</Button>
						</div>
					</form>
				</div>
			</div>

			{/* Document Upload Dialog */}
			<DocumentUploadDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				onUpload={(files) => {
					console.log("Uploaded files:", files);
				}}
			/>
		</>
	);
};

export default CreateStudentPage;
