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
import { X } from "lucide-react";

const CreateStudentPage = () => {
	const { t } = useTranslation();

	const [isOpen, setIsOpen] = useState(false);
	const [faculties, setFaculties] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [specialties, setSpecialties] = useState<any[]>([]);

	const [selectedFaculty, setSelectedFaculty] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [selectedSpecialty, setSelectedSpecialty] = useState<any>(null);

	const [form, setForm] = useState({
		matricule: "",
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		enrollmentYear: "",
		specialtyId: "",
		field: "",
		major: "",
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

	const handleCreate = () => {
		// Validate dateOfBirth
		if (!form.dateOfBirth) {
			toast.error("Date of Birth is required");
			return;
		}

		const dob = new Date(form.dateOfBirth);
		if (isNaN(dob.getTime())) {
			toast.error("Date of Birth is invalid");
			return;
		}

		const today = new Date();
		if (dob > today) {
			toast.error("Date of Birth cannot be in the future");
			return;
		}

		// Validate enrollmentYear
		const year = parseInt(form.enrollmentYear);
		if (!year || year < 1900 || year > today.getFullYear()) {
			toast.error("Enrollment Year must be a valid year");
			return;
		}

		console.log("Form submitted:", form);
	};
	return (
		<>
			<Button onClick={() => setIsOpen(true)}>Add Student</Button>

			{isOpen && (
				<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
					<div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3px] shadow-lg p-6 relative">
						{/* Close Button */}
						<button
							className="absolute top-4 right-4 text-gray-500 hover:text-red-500 hover:cursor-pointer"
							onClick={() => setIsOpen(false)}
						>
							<X className="w-5 h-5" />
						</button>

						<h2 className="text-xl font-semibold mb-4">Add Student</h2>

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
								{/* First Name */}
								<div className="relative w-1/2">
									<input
										type="text"
										name="firstName"
										value={form.firstName}
										className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
										placeholder=""
										onChange={handleChange}
									/>
									<label className="absolute top-2 left-3 text-[#697079] font-semibold text-sm">
										{t("addStaffDialog.firstName")}
										<span className="text-[#D81212]">*</span>
									</label>
								</div>

								{/* Last Name */}
								<div className="relative w-1/2">
									<input
										type="text"
										name="lastName"
										value={form.lastName}
										className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
										placeholder=""
										onChange={handleChange}
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

						<div className="grid grid-cols-2 gap-4 mt-4">
							<div className="relative">
								<input
									type="date"
									name="dateOfBirth"
									value={form.dateOfBirth}
									onChange={handleChange}
									className="peer w-full h-[4rem] bg-[#E3E8ED] dark:bg-transparent dark:border-2 dark:text-white text-black border rounded-[3px] px-3 pt-6 pb-2 focus:outline-none"
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

						<div className="flex justify-end mt-6">
							<Button onClick={handleCreate}>Create</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default CreateStudentPage;
