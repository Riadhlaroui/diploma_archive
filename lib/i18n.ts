"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: "en",
		interpolation: { escapeValue: false },
		resources: {
			en: {
				translation: {
					welcome: "Welcome back!",
					email: "Email",
					password: "Password",
					forgotPassword: "Forgot password?",
					"login.button": "Sign in",
					"login.success": "Login successful",
					"login.welcome": "Welcome!",
					"login.failed": "Login failed",
					"login.incorrect": "Incorrect credentials",
					noAccount: "Don't have an account?",
					signUp: "Sign up",
					language: "Language",

					dashboard: {
						title: "Dashboard",
						searchPlaceholder: "Search...",
						overview: "Overview",
						stats: {
							faculties: "Faculties",
							departments: "Departments",
							majors: "Majors",
							fields: "Fields",
							specialties: "Specialties",
						},
					},

					settings: {
						title: "Settings page",
					},

					profile: {
						myAccount: "My Account",
						profile: "Profile",
						settings: "Settings",
						team: "Staff Management",
						addUser: "Add user",
						addMember: "Add a new staff member",
						deleteMember: "Delete a staff member",
						logout: "Log out",
						logoutConfirm: "Confirm Log Out",
						logoutMessage: "Are you sure you want to log out?",
						cancel: "Cancel",
					},

					sidebar: {
						home: "Home",
						inbox: "Inbox",
						search: "Search",
						settings: "Settings",
						students: "Students",
						application: "Application",
						manageStudents: "Manage Students",
						connected: "Connected to server",
						disconnected: "Disconnected from server",
						checking: "Checking server status...",
						manageFaculties: "Manage Faculties", // New entry
						faculties: "Faculties",
					},

					addStaffDialog: {
						triggerButton: "Add Staff",
						title: "Add New Staff",
						firstName: "First Name",
						lastName: "Last Name",
						phoneNumber: "Phone Number",
						email: "Email",
						password: "Password",
						confirmPassword: "Confirm Password",
						roleLabel: "Role",
						selectRolePlaceholder: "Select a role",
						staffRole: "Staff",
						adminRole: "Admin",
						submitButton: "Submit",
						errors: {
							mismatchTitle: "Passwords do not match",
							mismatchDesc: "Please make sure both passwords are the same.",
							missingTitle: "Missing Required Fields",
							missingDesc: "Please fill in all required fields marked with *.",
							weakTitle: "Weak Password",
							weakDesc:
								"Password must be at least 8 characters long, include an uppercase letter and a number or special character.",
							userCreatedError: "Failed to create user. Please try again.",
							emailExistsTitle: "Email Already Exists",
							emailExistsDesc:
								"The email you entered is already registered. Please try another.",
						},
						cancelButton: "Cancel",
						userCreatedSuccess: "User successfully created!",
					},

					auditLogs: {
						title: "Audit Logs",
						action: "Action",
						userId: "User ID",
						targetType: "Target Type",
						targetId: "Target ID",
						timestamp: "Timestamp",
						copy: "Copy",
						loading: "Loading audit logs...",
						fetchError: "An error occurred while fetching audit logs.",
						noLogs: "No logs available.",
					},
					pagination: {
						previous: "Previous",
						next: "Next",
						pageOf: "Page {{page}} of {{totalPages}}",
					},
					actions: {
						create_user: "Create User",
						delete_user: "Delete User",
						update_user: "Update User",
					},

					staffList: {
						title: "Staff List",
						loading: "Loading",
						error: "Failed to load data.",
						copy: "copy",
						notFound: "No staff members found.",
						id: "Id",
						firstName: "First Name",
						lastName: "Last Name",
						email: "Email",
						role: "Role",
						phone: "Phone",
						created: "Created",
						actions: "Actions",
						previous: "Previous",
						next: "Next",
						page: "Page {{page}} of {{totalPages}}",
						confirmDelete: "Delete User?",
						confirmDeleteDesc:
							"Are you sure you want to delete the user {{firstName}} {{lastName}}, {{email}} with the role of {{role}}? This action is irreversible.",
						deleteSuccess: "User deleted successfully.",
						deleteError: "Failed to delete user.",
					},

					editUserDialog: {
						title: "Edit User",
						firstName: "First Name",
						lastName: "Last Name",
						phoneNumber: "Phone Number",
						email: "Email",
						description: "Update the selected user's information.",
						successMessage: "User updated successfully!",
						errorMessage: "Failed to update user. Please try again.",
					},

					deleteStaffDialog: {
						title: "Delete Staff Member",
						searchPlaceholder: "Search for a staff member",
						noStaffFound: "No staff found.",
						roleLabel: "Role",
						errors: {
							fetchFailed: "Failed to fetch staff list",
							deleteFailed: "Failed to delete staff members",
						},
						success: "{{count}} staff member(s) deleted successfully",
						warnings: {
							noSelection: "Please select at least one staff member",
						},
						deleting: "Deleting...",
						confirm: {
							title: "Confirm Deletion",
							description:
								"Are you sure you want to delete {{count}} staff member(s)? This action cannot be undone.",
						},
					},
					roles: {
						admin: "Admin",
						staff: "Staff",
					},
					common: {
						cancel: "Cancel",
						delete: "Delete",
						edit: "Edit",
						view: "View",
						back: "Back",
						na: "N/A",
						copy: "Copy {{field}}",
						confirm: "Confirm ({{count}})",
						dir: "ltr",
					},

					faculties: {
						title: "Faculties",
						addFaculty: "Add Faculty",
						editFaculty: "Edit Faculty",
						deleteFaculty: "Delete Faculty",
						confirmDelete: "Are you sure you want to delete this faculty?",
						name: "Name",
						code: "Code",
						departmentCount: "Number of Departments",
						actions: "Actions",
						submit: "Submit",
						cancel: "Cancel",
						successCreate: "Faculty created successfully!",
						successUpdate: "Faculty updated successfully!",
						successDelete: "Faculty deleted successfully!",
						error: "An error occurred. Please try again.",
						notFound: "No faculties found.",
						departmentsOf: "Departments of {{name}}",
					},

					addFaculty: {
						title: "Add a new faculty",
						name: "Name",
						cancel: "Cancel",
						submit: "Submit",
						nameRequired: "Faculty name is required.",
						success: "Faculty added successfully!",
						duplicateTitle: "A faculty with this name already exists.",
						duplicateSubtitle: "Please choose a different name.",
						errorTitle: "An error occurred.",
						errorSubtitle: "Please try again later.",
					},

					students: {
						title: "Students",
						matricule: "Matricule",
						firstName: "First Name",
						lastName: "Last Name",
						enrollmentYear: "Enrollment Year",
						dateOfBirth: "Date of Birth",
						specialtyId: "Specialty",
						year: "Year",
						field: "Field",
						major: "Major",
						specialty: "Specialty",
						createdAt: "Created At",
						actions: "Actions",
						notFound: "No students found",
						copyId: "Copy Matricule",
						numberOfDocuments: "Number of documents",
						inDepartment: "Students in {{department}}",
						exists: "A student with matricule already exists.",
						chooseDifferent: "Please choose a different matricule.",
						table: {
							id: "ID",
							name: "Name",
							email: "Email",
							createdAt: "Created At",
						},

						requiredField: "Please fill in the required field: {{field}}",
						noDocuments: "Please upload at least one document.",
						invalidDOB: "Invalid date of birth format.",
						futureDOB: "Date of birth cannot be in the future.",
						invalidEnrollmentYear:
							"Enrollment year must be between 1900 and {{year}}.",
						created: "Student created successfully.",
						creationError: "Error creating student.",
						profile: "Student Profile",
						info: "Student Info",
						documents: "Documents",
						name: "Name",
						uploadToGetStarted: "Upload documents to get started",
						confirmDeleteTitle: "Delete Student",
						confirmDeleteDescription:
							"Are you sure you want to delete {{name}}? This action cannot be undone.",
						deleteSuccess: "Student deleted successfully",
						deleteFailed: "Failed to delete student",
					},

					addStudent: {
						back: "Back",
						title: "Add New Student",
						description:
							"Please fill in the details below to create a new student record.",

						academicInfo: "Academic Information",
						faculty: "Faculty",
						selectFaculty: "Select faculty",
						department: "Department",
						selectDepartment: "Select department",
						field: "Field",
						selectField: "Select field",
						major: "Major",
						selectMajor: "Select major",
						specialty: "Specialty",
						selectSpecialty: "Select specialty",
						personalInfo: "Personal Information",
						matricule: "Matricule",
						enterMatricule: "Enter matricule",
						firstName: "First Name",
						enterFirstName: "Enter first name",
						lastName: "Last Name",
						enterLastName: "Enter last name",
						dateOfBirth: "Date of Birth",
						enrollmentYear: "Enrollment Year",
						enterEnrollmentYear: "Enter enrollment year",
						createStudent: "Create Student",
					},

					documents: {
						title: "Documents",
						count: "{{count}} file{{pluralSuffix}}",
						upload: "Upload Documents",
						emptyTitle: "No documents uploaded",
						emptyDescription: "Upload student documents to get started",
						remove: "Remove {{fileName}}",
					},

					uploadDocuments: {
						title: "Upload Documents",
						dragAndDrop: "Drag & drop files here",
						orClick: "or click to browse your computer",
						supportedFormats:
							"Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX",
						uploadedFiles: "Uploaded Files ({{count}})",
						documentType: "Document Type",
						loadingTypes: "Loading types...",
						selectDocumentType: "Select document type",
						remove: "Remove",
						typeRequired: "Please specify a type for all documents",
						typeExists: "This type already exists",
						typeAddError: "Failed to add document type. Please try again.",
						documentTypes: "Document Types",
						addNewDocumentType: "Add new document type",
						enterNewTypeName: "Enter new type name",
						add: "Add",
						adding: "Adding...",
						cancel: "Cancel",
					},

					filterPanel: {
						title: "Search & Filter Students",
						close: "Close filter panel",
						searchLabel: "Search by Name, ID, etc.",
						searchPlaceholder: "Enter search query...",
						options: "Filter Options:",
						matricule: "Matricule",
						enterMatricule: "Enter matricule",
						faculty: "Faculty",
						selectFaculty: "Select faculty",
						department: "Department",
						selectDepartment: "Select department",
						field: "Field",
						selectField: "Select field",
						major: "Major",
						selectMajor: "Select major",
						specialty: "Specialty",
						selectSpecialty: "Select specialty",
						reset: "Reset Filters",
						apply: "Apply Filters",
					},

					loading: "Loading...",

					confirm: {
						title: "Confirm Deletion",
						description:
							"Are you sure you want to delete {{name}}? This action cannot be undone.",
						major: {
							description:
								"Are you sure you want to delete this major? This action cannot be undone.",
						},
						department: {
							description:
								'Are you sure you want to delete the {{entity}} "{{name}}"?',
							entities: {
								department: "department",
							},
						},
						field: {
							description:
								'Are you sure you want to delete the {{entity}} "{{name}}"? This action cannot be undone.',
							entities: {
								field: "field",
							},
						},

						specialty: {
							description:
								'Are you sure you want to delete the {{entity}} "{{name}}"? This action cannot be undone.',
							entities: {
								specialty: "specialty",
							},
						},
					},

					breadcrumbs: {
						home: "Home",
						faculties: "Faculties",
					},

					departments: {
						titleWithFaculty: "Departments in: {{faculty}}",
						title: "Departments",
						name: "Name",
						code: "Code",
						createdAt: "Created at",
						actions: "Actions",
						fieldsCount: "Number of fields",
						noDepartments: "No departments found.",
						searchPlaceholder: "Search departments...",
						deleteSuccess: "Department '{{name}}' deleted successfully!",
						deleteFail: "Failed to delete department '{{name}}'.",
					},

					addDepartment: {
						title: "Add a new department",
						name: "Name",
						nameRequired: "Department name is required.",
						success: "Department added successfully!",
						duplicateTitle: "A department with this name already exists.",
						duplicateMessage: "Please choose a different name.",
					},

					error: {
						title: "An error occurred.",
						message: "Please try again later.",
					},

					actionsDep: {
						cancel: "Cancel",
						submit: "Submit",
					},

					navigation: {
						home: "Home",
					},

					fields: {
						title: "Fields",
						search_placeholder: "Search fields...",
						majors_count: "Majors Count",
						created_at: "Created At",
						actions: "Actions",
						not_found: "Fields not found",
						deleted_success: "Field '{{name}}' deleted successfully!",
						deleted_fail: "Failed to delete field '{{name}}'.",
						titleWithDepartment: "Fields in: {{department}}",
						code: "Code",
						name: "Name",
						MajorsCount: "Number of Majors",
						createdAt: "Created At",
					},

					AddFieldDialog: {
						title: "Add a new field",
						nameLabel: "Name",
						cancel: "Cancel",
						submit: "Submit",
						close: "Close dialog",
						errors: {
							nameRequired: "Field name is required.",
							nameTakenTitle: "A field with this name already exists.",
							nameTakenDesc: "Please choose a different name.",
							genericTitle: "An error occurred.",
							genericDesc: "Please try again later.",
						},
						success: {
							added: "Field added successfully!",
						},
					},

					majors: {
						title: "Majors",
						titleWithfield: "Majors in: {{field}}",
						table: {
							code: "Code",
							name: "Name",
							specialtiesCount: "Number of specialties",
							createdAt: "Created At",
							actions: "Actions",
						},
						notFound: "Majors not found",
					},

					addMajor: {
						title: "Add a new major",
						nameLabel: "Name",
						cancel: "Cancel",
						submit: "Submit",
						close: "Close dialog",
						success: "Major added successfully!",
						errors: {
							nameRequired: "Major name is required.",
							nameTaken: {
								title: "A major with this name already exists.",
								desc: "Please choose a different name.",
							},
							general: {
								title: "An error occurred.",
								desc: "Please try again later.",
							},
						},
					},

					specialties: {
						title: "Specialties",
						titleWithMajor: "Specialties in: {{major}}",
						code: "Code",
						name: "Name",
						createdAt: "Created At",
						actions: "Actions",
						notFound: "Specialties not found",
					},

					addSpecialty: {
						title: "Add New Specialty",
						nameLabel: "Name",
						cancel: "Cancel",
						submit: "Submit",
						close: "Close Window",
						success: "Specialty added successfully!",
						errors: {
							nameRequired: "Specialty name is required.",
							nameTaken: {
								title: "A specialty with this name already exists.",
								desc: "Please choose a different name.",
							},
							general: {
								title: "Something went wrong.",
								desc: "Please try again later.",
							},
						},
					},

					editFacultyDialog: {
						title: "Edit Faculty",
						description: "Update the faculty name.",
						facultyName: "Faculty Name",
						cancelButton: "Cancel",
						saveButton: "Save",
						successMessage: "Faculty updated successfully",
						errorMessage: "Failed to update faculty",
						errors: {
							nameExistsTitle: "Faculty name already exists",
							nameExistsDesc: "Please choose a different name.",
						},
					},

					editDepartmentDialog: {
						title: "Edit Department",
						description: "Update the Department name.",
						departmentName: "Department Name",
						cancelButton: "Cancel",
						saveButton: "Save",
						successMessage: "Department updated successfully",
						errorMessage: "Failed to update Department",
						errors: {
							nameExistsTitle: "Department name already exists",
							nameExistsDesc: "Please choose a different name.",
						},
					},

					editFieldDialog: {
						title: "Edit Field",
						description: "Update the field name.",
						fieldName: "Field Name",
						cancelButton: "Cancel",
						saveButton: "Save",
						successMessage: "Field updated successfully.",
						errorMessage: "Failed to update field.",
						errors: {
							nameExistsTitle: "Field name already exists",
							nameExistsDesc: "Please choose a different name.",
						},
					},

					editMajorDialog: {
						title: "Edit Major",
						description: "Update the major name.",
						majorName: "Major Name",
						cancelButton: "Cancel",
						saveButton: "Save",
						successMessage: "Major updated successfully.",
						errorMessage: "Failed to update major.",
						errors: {
							nameExistsTitle: "Major name already exists",
							nameExistsDesc: "Please choose a different name.",
						},
					},

					editSpecialtyDialog: {
						title: "Edit Specialty",
						description: "Update the Specialty name.",
						specialtyName: "Specialty Name",
						cancelButton: "Cancel",
						saveButton: "Save",
						successMessage: "Specialty updated successfully.",
						errorMessage: "Failed to update Specialty.",
						errors: {
							nameExistsTitle: "Specialty name already exists",
							nameExistsDesc: "Please choose a different name.",
						},
					},

					updateStudent: {
						title: "Update Student",
						notFound: "Student not found",
						academicInfo: "Academic Information",
						personalInfo: "Personal Information",
						studentDocuments: "Student Documents",
						uploadNewDocument: "Upload New Document",
						documentFile: "Document File",
						addDocumentToPending: "Add Document to Pending Changes",
						pendingDocumentsNote:
							'Pending Documents (will be uploaded when you click "Update Student Information")',
						existingDocuments: "Existing Documents",
						noDocuments: "No Documents",
						faculty: "Faculty",
						selectFaculty: "Select Faculty",
						department: "Department",
						selectDepartment: "Select Department",
						field: "Field",
						selectField: "Select Field",
						major: "Major",
						selectMajor: "Select Major",
						specialty: "Specialty",
						selectSpecialty: "Select Specialty",
						matricule: "Matricule",
						firstName: "First Name",
						lastName: "Last Name",
						dateOfBirth: "Date of Birth",
						enrollmentYear: "Enrollment Year",
						updateButton: "Update Student Information",
						savingChanges: "Saving changes...",
						selectDocumentType: "Select document type",
						unknownType: "Unknown type",
						noFilename: "No filename",
						deleteDocumentTitle: "Delete Document",
						deleteDocumentDescription:
							"Are you sure you want to delete this document? This action cannot be undone.",
						documentDeletedSuccess: "Document deleted successfully",
						documentDeleteFailed: "Failed to delete document",
						documentAddedPending: "Document added to pending changes",
						documentRemovedPending: "Document removed from pending changes",
						allChangesSaved: "All changes saved successfully",
						failedToSaveChanges: "Failed to save changes",
					},

					search: {
						facultyPlaceholder: "Search faculties...",
						departmentPlaceholder: "Search departments...",
						fieldPlaceholder: "Search fields...",
						majorPlaceholder: "Search majors...",
						specialtyPlaceholder: "Search specialties...",
						button: "Search",
					},
					terms: {
						faculty: "Faculty",
						department: "Department",
						field: "Field",
						major: "Major",
						specialty: "Specialty",
					},

					errors: {
						deleteSpecialty: "Failed to delete specialty '{{name}}'.",
						requiredRelation:
							"Cannot delete '{{name}}' because it's being used by students.",
						generic400: "Failed to delete specialty: {{message}}",
					},
				},
			},
			fr: {
				translation: {
					welcome: "Bon retour!",
					email: "E-mail",
					password: "Mot de passe",
					forgotPassword: "Mot de passe oublié?",
					"login.button": "Se connecter",
					"login.success": "Connexion réussie",
					"login.welcome": "Bienvenue!",
					"login.failed": "Échec de la connexion",
					"login.incorrect": "Identifiants incorrects",
					noAccount: "Vous n'avez pas de compte?",
					signUp: "S'inscrire",
					language: "Langue",

					dashboard: {
						title: "Tableau de bord",
						searchPlaceholder: "Rechercher...",
						overview: "Aperçu",
						stats: {
							faculties: "Facultés",
							departments: "Départements",
							majors: "Spécialisations",
							fields: "Domaines",
							specialties: "Spécialités",
						},
					},

					settings: {
						title: "Paramètres",
					},

					profile: {
						myAccount: "Mon compte",
						profile: "Profil",
						settings: "Paramètres",
						team: "Équipe",
						addUser: "Gestion du personne",
						addMember: "Ajouter un membre du personnel",
						deleteMember: "Supprimer un membre du personnel",
						logout: "Se déconnecter",
						logoutConfirm: "Confirmer la déconnexion",
						logoutMessage: "Êtes-vous sûr de vouloir vous déconnecter ?",
						cancel: "Annuler",
					},

					sidebar: {
						home: "Accueil",
						inbox: "Boîte de réception",
						search: "Recherche",
						settings: "Paramètres",
						students: "Étudiants",
						application: "Application",
						manageStudents: "Gérer les étudiants",
						connected: "Connecté au serveur",
						disconnected: "Déconnecté du serveur",
						checking: "Vérification de l'état du serveur...",
						manageFaculties: "Gérer les facultés", // New entry
						faculties: "Facultés",
					},

					addStaffDialog: {
						triggerButton: "Ajouter un membre",
						title: "Ajouter un nouveau membre",
						firstName: "Prénom",
						lastName: "Nom",
						phoneNumber: "Numéro de téléphone",
						email: "E-mail",
						password: "Mot de passe",
						confirmPassword: "Confirmer le mot de passe",
						roleLabel: "Rôle",
						selectRolePlaceholder: "Sélectionner un rôle",
						staffRole: "Personnel",
						adminRole: "Administrateur",
						submitButton: "Soumettre",
						errors: {
							mismatchTitle: "Les mots de passe ne correspondent pas",
							mismatchDesc:
								"Veuillez vous assurer que les deux mots de passe sont identiques.",
							missingTitle: "Champs requis manquants",
							missingDesc:
								"Veuillez remplir tous les champs obligatoires marqués d’un *.",
							weakTitle: "Mot de passe faible",
							weakDesc:
								"Le mot de passe doit comporter au moins 8 caractères, inclure une majuscule et un chiffre ou un caractère spécial.",
							userCreatedError:
								"Échec de la création de l'utilisateur. Veuillez réessayer.",
							emailExistsTitle: "Email déjà utilisé",
							emailExistsDesc:
								"L'adresse email saisie est déjà enregistrée. Veuillez en essayer une autre.",
						},
						cancelButton: "Annuler",
						userCreatedSuccess: "Utilisateur créé avec succès !",
					},

					auditLogs: {
						title: "Journaux d'audit",
						action: "Action",
						userId: "ID utilisateur",
						targetType: "Type de cible",
						targetId: "ID de la cible",
						timestamp: "Horodatage",
						copy: "Copier",
						loading: "Chargement des journaux d'audit...",
						fetchError:
							"Une erreur est survenue lors du chargement des journaux d'audit.",
						noLogs: "Aucun journal disponible.",
					},
					pagination: {
						previous: "Précédent",
						next: "Suivant",
						pageOf: "Page {{page}} sur {{totalPages}}",
					},

					actions: {
						create_user: "Créer un utilisateur",
						delete_user: "Supprimer un utilisateur",
						update_user: "Mettre à jour l'utilisateur",
					},

					staffList: {
						title: "Liste du personnel",
						loading: "Chargement",
						error: "Échec du chargement des données.",
						copy: "copier",
						notFound: "Aucun membre du personnel trouvé.",
						id: "Id",
						firstName: "Prénom",
						lastName: "Nom de famille",
						email: "Email",
						role: "Rôle",
						phone: "Téléphone",
						created: "Créé",
						actions: "Actions",
						previous: "Précédent",
						next: "Suivant",
						page: "Page {{page}} sur {{totalPages}}",
						confirmDelete: "Supprimer l'utilisateur ?",
						confirmDeleteDesc:
							"Êtes-vous sûr de vouloir supprimer l'utilisateur {{email}} ayant le rôle {{role}} ? Cette action est irréversible.",
						deleteSuccess: "Utilisateur supprimé avec succès.",
						deleteError: "Échec de la suppression de l'utilisateur.",
					},

					deleteStaffDialog: {
						title: "Supprimer un membre du personnel",
						searchPlaceholder: "Rechercher un membre du personnel",
						noStaffFound: "Aucun membre du personnel trouvé.",
						roleLabel: "Rôle",
						errors: {
							fetchFailed: "Échec de la récupération de la liste du personnel",
							deleteFailed: "Échec de la suppression des membres du personnel",
						},
						success: "{{count}} membre(s) du personnel supprimé(s) avec succès",
						warnings: {
							noSelection:
								"Veuillez sélectionner au moins un membre du personnel",
						},
						deleting: "Suppression en cours...",
						confirm: {
							title: "Confirmer la suppression",
							description:
								"Êtes-vous sûr de vouloir supprimer {{count}} membre(s) du personnel ? Cette action est irréversible.",
						},
					},
					roles: {
						admin: "Administrateur",
						staff: "Personnel",
					},
					common: {
						cancel: "Annuler",
						delete: "Supprimer",
						edit: "Modifier",
						view: "Voir",
						back: "Retour",
						na: "N/D",
						copy: "Copier {{field}}",
						confirm: "Confirmer ({{count}})",
						dir: "ltr",
					},

					editUserDialog: {
						title: "Modifier l'utilisateur",
						firstName: "Prénom",
						lastName: "Nom de famille",
						phoneNumber: "Numéro de téléphone",
						email: "E-mail",
						description:
							"Mettre à jour les informations de l'utilisateur sélectionné.",
						successMessage: "Utilisateur mis à jour avec succès !",
						errorMessage:
							"Échec de la mise à jour de l'utilisateur. Veuillez réessayer.",
					},

					faculties: {
						title: "Facultés",
						addFaculty: "Ajouter une faculté",
						editFaculty: "Modifier la faculté",
						deleteFaculty: "Supprimer la faculté",
						confirmDelete: "Êtes-vous sûr de vouloir supprimer cette faculté ?",
						name: "Nom",
						code: "Code",
						departmentCount: "Nombre de départements",
						actions: "Actions",
						submit: "Soumettre",
						cancel: "Annuler",
						successCreate: "Faculté créée avec succès !",
						successUpdate: "Faculté mise à jour avec succès !",
						successDelete: "Faculté supprimée avec succès !",
						error: "Une erreur s’est produite. Veuillez réessayer.",
						notFound: "Aucune faculté trouvée.",
					},

					addFaculty: {
						title: "Ajouter une nouvelle faculté",
						name: "Nom",
						cancel: "Annuler",
						submit: "Soumettre",
						nameRequired: "Le nom de la faculté est requis.",
						success: "Faculté ajoutée avec succès !",
						duplicateTitle: "Une faculté avec ce nom existe déjà.",
						duplicateSubtitle: "Veuillez choisir un nom différent.",
						errorTitle: "Une erreur s'est produite.",
						errorSubtitle: "Veuillez réessayer plus tard.",
					},

					students: {
						title: "Étudiants",
						matricule: "Matricule",
						firstName: "Prénom",
						lastName: "Nom",
						enrollmentYear: "Année d'inscription",
						dateOfBirth: "Date de naissance",
						specialtyId: "Spécialité",
						year: "Année",
						field: "Domaine",
						major: "Filière",
						specialty: "Spécialité",
						createdAt: "Créé le",
						actions: "Actions",
						notFound: "Aucun étudiant trouvé",
						copyId: "Copier le matricule",
						numberOfDocuments: "Nombre de documents",
						requiredField: "Veuillez remplir le champ requis : {{field}}",
						noDocuments: "Veuillez télécharger au moins un document.",
						invalidDOB: "Format de date de naissance invalide.",
						futureDOB: "La date de naissance ne peut pas être dans le futur.",
						invalidEnrollmentYear:
							"L'année d'inscription doit être comprise entre 1900 et {{year}}.",
						exists: "Un étudiant avec ce matricule existe déjà.",
						chooseDifferent: "Veuillez choisir un autre matricule.",
						created: "Étudiant créé avec succès.",
						creationError: "Erreur lors de la création de l'étudiant.",
						profile: "Profil de l'étudiant",
						info: "Informations de l'étudiant",
						documents: "Documents",
						name: "Nom",
						uploadToGetStarted: "Téléversez des documents pour commencer",
						confirmDeleteTitle: "Supprimer l'étudiant",
						confirmDeleteDescription:
							"Êtes-vous sûr de vouloir supprimer {{name}} ? Cette action est irréversible.",
						deleteSuccess: "Étudiant supprimé avec succès",
						deleteFailed: "Échec de la suppression de l'étudiant",
					},

					addStudent: {
						back: "Retour",
						title: "Ajouter un nouvel étudiant",
						description:
							"Veuillez remplir les informations ci-dessous pour créer une nouvelle fiche étudiant.",

						academicInfo: "Informations académiques",
						faculty: "Faculté",
						selectFaculty: "Sélectionnez une faculté",
						department: "Département",
						selectDepartment: "Sélectionnez un département",
						field: "Domaine",
						selectField: "Sélectionnez un domaine",
						major: "Filière",
						selectMajor: "Sélectionnez une filière",
						specialty: "Spécialité",
						selectSpecialty: "Sélectionnez une spécialité",
						personalInfo: "Informations personnelles",
						matricule: "Matricule",
						enterMatricule: "Entrez le matricule",
						firstName: "Prénom",
						enterFirstName: "Entrez le prénom",
						lastName: "Nom",
						enterLastName: "Entrez le nom",
						dateOfBirth: "Date de naissance",
						enrollmentYear: "Année d'inscription",
						enterEnrollmentYear: "Entrez l'année d'inscription",
						createStudent: "Créer un étudiant",
					},

					documents: {
						title: "Documents",
						count: "{{count}} fichier{{pluralSuffix}}",
						upload: "Téléverser des documents",
						emptyTitle: "Aucun document téléversé",
						emptyDescription:
							"Téléversez les documents de l'étudiant pour commencer",
						remove: "Supprimer {{fileName}}",
					},

					uploadDocuments: {
						title: "Téléverser des documents",
						dragAndDrop: "Glissez et déposez les fichiers ici",
						orClick: "ou cliquez pour parcourir votre ordinateur",
						supportedFormats:
							"Formats pris en charge : PDF, PNG, JPG, JPEG, DOC, DOCX",
						uploadedFiles: "Fichiers téléversés ({{count}})",
						documentType: "Type de document",
						loadingTypes: "Chargement des types...",
						selectDocumentType: "Sélectionnez un type de document",
						remove: "Supprimer",
						typeRequired: "Veuillez spécifier un type pour tous les documents",
						typeExists: "Ce type existe déjà",
						typeAddError:
							"Échec de l'ajout du type de document. Veuillez réessayer.",
						documentTypes: "Types de document",
						addNewDocumentType: "Ajouter un nouveau type de document",
						enterNewTypeName: "Entrez le nom du nouveau type",
						add: "Ajouter",
						adding: "Ajout...",
						cancel: "Annuler",
					},
					filterPanel: {
						title: "Rechercher et filtrer les étudiants",
						close: "Fermer le panneau de filtre",
						searchLabel: "Rechercher par nom, matricule, etc.",
						searchPlaceholder: "Entrez une requête de recherche...",
						options: "Options de filtrage :",
						matricule: "Matricule",
						enterMatricule: "Entrez le matricule",
						faculty: "Faculté",
						selectFaculty: "Sélectionner une faculté",
						department: "Département",
						selectDepartment: "Sélectionner un département",
						field: "Domaine",
						selectField: "Sélectionner un domaine",
						major: "Filière",
						selectMajor: "Sélectionner une filière",
						specialty: "Spécialité",
						selectSpecialty: "Sélectionner une spécialité",
						reset: "Réinitialiser les filtres",
						apply: "Appliquer les filtres",
					},

					loading: "Chargement...",

					departments: {
						titleWithFaculty: "Départements dans: {{faculty}}",
						title: "Départements",
						name: "Nom",
						code: "Code",
						createdAt: "Créé le",
						actions: "Actions",
						fieldsCount: "Nombre de filières",
						noDepartments: "Aucun département trouvé.",
						searchPlaceholder: "Rechercher des départements...",
						deleteSuccess: "Département '{{name}}' supprimé avec succès !",
						deleteFail: "Échec de la suppression du département '{{name}}'.",
					},

					addDepartment: {
						title: "Ajouter un nouveau département",
						name: "Nom",
						nameRequired: "Le nom du département est requis.",
						success: "Département ajouté avec succès !",
						duplicateTitle: "Un département avec ce nom existe déjà.",
						duplicateMessage: "Veuillez choisir un nom différent.",
					},

					error: {
						title: "Une erreur s'est produite.",
						message: "Veuillez réessayer plus tard.",
					},

					actionsDep: {
						cancel: "Annuler",
						submit: "Valider",
					},

					confirm: {
						title: "Confirmer la suppression",
						description:
							"Êtes-vous sûr de vouloir supprimer {{count}} membre(s) du personnel ? Cette action est irréversible.",
						major: {
							description:
								"Êtes-vous sûr de vouloir supprimer cette filière ? Cette action est irréversible.",
						},

						department: {
							description:
								"Êtes-vous sûr de vouloir supprimer le {{entity}} « {{name}} » ?",
							entities: {
								department: "département",
							},
						},
						field: {
							description:
								"Êtes-vous sûr de vouloir supprimer le {{entity}} « {{name}} » ? Cette action est irréversible.",
							entities: {
								field: "domaine",
							},
						},
						specialty: {
							description:
								"Êtes-vous sûr de vouloir supprimer la {{entity}} « {{name}} » ? Cette action est irréversible.",
							entities: {
								specialty: "spécialité",
							},
						},
					},

					navigation: {
						home: "Accueil",
					},

					fields: {
						title: "Domaine",
						search_placeholder: "Rechercher des Domaine...",
						majors_count: "Nombre de filiales",
						created_at: "Date de création",
						actions: "Actions",
						not_found: "Aucun Domaine trouvé",
						deleted_success:
							"Le domaine '{{name}}' a été supprimé avec succès !",
						deleted_fail: "Échec de la suppression du domaine '{{name}}'.",
						titleWithDepartment: "Les domaine dans: {{department}}",
						code: "Code",
						name: "Nom",
						MajorsCount: "Nombre de filiales",
						createdAt: "Créé le",
					},

					AddFieldDialog: {
						title: "Ajouter un nouveau champs",
						nameLabel: "Nom",
						cancel: "Annuler",
						submit: "Soumettre",
						close: "Fermer la boîte de dialogue",
						errors: {
							nameRequired: "Le nom du champs est requis.",
							nameTakenTitle: "Un champs avec ce nom existe déjà.",
							nameTakenDesc: "Veuillez choisir un nom différent.",
							genericTitle: "Une erreur s'est produite.",
							genericDesc: "Veuillez réessayer plus tard.",
						},
						success: {
							added: "Champs ajouté avec succès !",
						},
					},

					majors: {
						title: "Filières",
						titleWithfield: "Les filiales dans: {{field}}",
						table: {
							code: "Code",
							name: "Nom",
							specialtiesCount: "Nombre de spécialités",
							createdAt: "Créé le",
							actions: "Actions",
						},
						notFound: "Aucune filière trouvée",
					},

					addMajor: {
						title: "Ajouter un nouveau branche",
						nameLabel: "Nom",
						cancel: "Annuler",
						submit: "Envoyer",
						close: "Fermer la fenêtre",
						success: "Branche ajoutée avec succès !",
						errors: {
							nameRequired: "Le nom de la branche est requis.",
							nameTaken: {
								title: "Une branche avec ce nom existe déjà.",
								desc: "Veuillez choisir un nom différent.",
							},
							general: {
								title: "Une erreur s'est produite.",
								desc: "Veuillez réessayer plus tard.",
							},
						},
					},

					specialties: {
						title: "Spécialités",
						titleWithMajor: "Spécialités dans: {{major}}",
						code: "Code",
						name: "Nom",
						createdAt: "Créé le",
						actions: "Actions",
						notFound: "Aucune spécialité trouvée",
					},

					addSpecialty: {
						title: "Ajouter une nouvelle spécialité",
						nameLabel: "Nom",
						cancel: "Annuler",
						submit: "Envoyer",
						close: "Fermer la fenêtre",
						success: "Spécialité ajoutée avec succès !",
						errors: {
							nameRequired: "Le nom de la spécialité est requis.",
							nameTaken: {
								title: "Une spécialité avec ce nom existe déjà.",
								desc: "Veuillez choisir un nom différent.",
							},
							general: {
								title: "Une erreur s'est produite.",
								desc: "Veuillez réessayer plus tard.",
							},
						},
					},

					editFacultyDialog: {
						title: "Modifier la faculté",
						description: "Mettre à jour le nom de la faculté.",
						facultyName: "Nom de la faculté",
						cancelButton: "Annuler",
						saveButton: "Enregistrer",
						successMessage: "Faculté mise à jour avec succès",
						errorMessage: "Échec de la mise à jour de la faculté",
						errors: {
							nameExistsTitle: "Le nom de la faculté existe déjà",
							nameExistsDesc: "Veuillez choisir un autre nom.",
						},
					},

					editDepartmentDialog: {
						title: "Modifier le département",
						description: "Mettre à jour le nom du département.",
						departmentName: "Nom du département",
						cancelButton: "Annuler",
						saveButton: "Enregistrer",
						successMessage: "Département mis à jour avec succès",
						errorMessage: "Échec de la mise à jour du département",
						errors: {
							nameExistsTitle: "Le nom du département existe déjà",
							nameExistsDesc: "Veuillez choisir un autre nom.",
						},
					},

					editFieldDialog: {
						title: "Modifier le Domaine",
						description: "Mettre à jour le nom du domaine.",
						fieldName: "Nom du Domaine",
						cancelButton: "Annuler",
						saveButton: "Enregistrer",
						successMessage: "Domaine mis à jour avec succès.",
						errorMessage: "Échec de la mise à jour du domaine.",
						errors: {
							nameExistsTitle: "Le nom du domaine existe déjà",
							nameExistsDesc: "Veuillez choisir un autre nom.",
						},
					},

					editMajorDialog: {
						title: "Modifier la Filière",
						description: "Mettre à jour le nom de la filière.",
						majorName: "Nom de la Filière",
						cancelButton: "Annuler",
						saveButton: "Enregistrer",
						successMessage: "Filière mise à jour avec succès.",
						errorMessage: "Échec de la mise à jour de la filière.",
						errors: {
							nameExistsTitle: "Le nom de la filière existe déjà",
							nameExistsDesc: "Veuillez choisir un autre nom.",
						},
					},

					editSpecialtyDialog: {
						title: "Modifier la spécialité",
						description: "Mettre à jour le nom de la spécialité.",
						specialtyName: "Nom de la spécialité",
						cancelButton: "Annuler",
						saveButton: "Enregistrer",
						successMessage: "Spécialité mise à jour avec succès.",
						errorMessage: "Échec de la mise à jour de la spécialité.",
						errors: {
							nameExistsTitle: "Le nom de la spécialité existe déjà",
							nameExistsDesc: "Veuillez choisir un autre nom.",
						},
					},

					updateStudent: {
						title: "Modifier l'Étudiant",
						notFound: "Étudiant non trouvé",
						academicInfo: "Informations Académiques",
						personalInfo: "Informations Personnelles",
						studentDocuments: "Documents de l'Étudiant",
						uploadNewDocument: "Télécharger un Nouveau Document",
						documentFile: "Fichier du Document",
						addDocumentToPending:
							"Ajouter le Document aux Modifications en Attente",
						pendingDocumentsNote:
							'Documents en Attente (seront téléchargés lorsque vous cliquerez sur "Mettre à jour les informations de l\'étudiant")',
						existingDocuments: "Documents Existants",
						noDocuments: "Aucun Document",
						faculty: "Faculté",
						selectFaculty: "Sélectionnez une Faculté",
						department: "Département",
						selectDepartment: "Sélectionnez un Département",
						field: "Domaine",
						selectField: "Sélectionnez un Domaine",
						major: "Majeure",
						selectMajor: "Sélectionnez une Majeure",
						specialty: "Spécialité",
						selectSpecialty: "Sélectionnez une Spécialité",
						matricule: "Matricule",
						firstName: "Prénom",
						lastName: "Nom",
						dateOfBirth: "Date de Naissance",
						enrollmentYear: "Année d'Inscription",
						updateButton: "Mettre à Jour les Informations de l'Étudiant",
						savingChanges: "Enregistrement des modifications...",
						selectDocumentType: "Sélectionnez le type de document",
						unknownType: "Type inconnu",
						noFilename: "Aucun nom de fichier",
						deleteDocumentTitle: "Supprimer le Document",
						deleteDocumentDescription:
							"Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.",
						documentDeletedSuccess: "Document supprimé avec succès",
						documentDeleteFailed: "Échec de la suppression du document",
						documentAddedPending:
							"Document ajouté aux modifications en attente",
						documentRemovedPending:
							"Document retiré des modifications en attente",
						allChangesSaved:
							"Toutes les modifications ont été enregistrées avec succès",
						failedToSaveChanges: "Échec de l'enregistrement des modifications",
					},

					search: {
						facultyPlaceholder: "Rechercher des facultés...",
						departmentPlaceholder: "Rechercher des départements...",
						fieldPlaceholder: "Rechercher des domaines...",
						majorPlaceholder: "Rechercher des majeures...",
						specialtyPlaceholder: "Rechercher des spécialités...",
						button: "Rechercher",
					},
					terms: {
						faculty: "Faculté",
						department: "Département",
						field: "Domaine",
						major: "Majeure",
						specialty: "Spécialité",
					},

					errors: {
						deleteSpecialty:
							"Échec de la suppression de la spécialité '{{name}}'.",
						requiredRelation:
							"Impossible de supprimer '{{name}}' car elle est utilisée par des étudiants.",
						generic400:
							"Échec de la suppression de la spécialité : {{message}}",
					},
				},
			},
			ar: {
				translation: {
					welcome: "مرحبًا بعودتك!",
					email: "البريد الإلكتروني",
					password: "كلمة المرور",
					forgotPassword: "هل نسيت كلمة المرور؟",
					"login.button": "تسجيل الدخول",
					"login.success": "تم تسجيل الدخول بنجاح",
					"login.welcome": "أهلًا وسهلًا!",
					"login.failed": "فشل تسجيل الدخول",
					"login.incorrect": "بيانات الدخول غير صحيحة",
					noAccount: "ليس لديك حساب؟",
					signUp: "سجّل الآن",
					language: "اللغة",

					dashboard: {
						title: "لوحة التحكم",
						searchPlaceholder: "ابحث...",
						overview: "نظرة عامة",
						stats: {
							faculties: "الكليات",
							departments: "الأقسام",
							majors: "الفروع",
							fields: "الميادين",
							specialties: "الاختصاصات",
						},
					},

					settings: {
						title: "صفحة الإعدادات",
					},

					profile: {
						myAccount: "حسابي",
						profile: "الملف الشخصي",
						settings: "الإعدادات",
						team: "إدارة الموظفين",
						addUser: "إضافة مستخدم",
						addMember: "إضافة موظف جديد",
						deleteMember: "حذف موظف",
						logout: "تسجيل الخروج",
						logoutConfirm: "تأكيد تسجيل الخروج",
						logoutMessage: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
						cancel: "إلغاء",
					},

					sidebar: {
						home: "الرئيسية",
						inbox: "سجلات التدقيق",
						search: "بحث",
						settings: "الإعدادات",
						students: "الطلاب",
						application: "التطبيق",
						manageStudents: "إدارة الطلاب",
						connected: "متصل بالخادم",
						disconnected: "غير متصل بالخادم",
						checking: "جارٍ التحقق من حالة الخادم...",
						manageFaculties: "إدارة الكليات",
						faculties: "الكليات",
					},

					addStaffDialog: {
						triggerButton: "إضافة موظف",
						title: "إضافة موظف جديد",
						firstName: "الاسم",
						lastName: "اللقب",
						phoneNumber: "رقم الهاتف",
						email: "البريد الإلكتروني",
						password: "كلمة المرور",
						confirmPassword: "تأكيد كلمة المرور",
						roleLabel: "الدور",
						selectRolePlaceholder: "اختر الدور",
						staffRole: "موظف",
						adminRole: "مسؤول",
						submitButton: "إرسال",
						errors: {
							mismatchTitle: "كلمتا المرور غير متطابقتين",
							mismatchDesc: "يرجى التأكد من تطابق كلمتي المرور.",
							missingTitle: "حقول مطلوبة مفقودة",
							missingDesc: "يرجى ملء جميع الحقول الإلزامية المحددة بـ *.",
							weakTitle: "كلمة المرور ضعيفة",
							weakDesc:
								"يجب أن تكون كلمة المرور 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم أو رمز خاص.",
							userCreatedError: "فشل في إنشاء المستخدم. حاول مرة أخرى.",
							emailExistsTitle: "البريد الإلكتروني مستخدم",
							emailExistsDesc:
								"البريد الإلكتروني المدخل مستخدم بالفعل. جرب بريدًا آخر.",
						},
						cancelButton: "إلغاء",
						userCreatedSuccess: "تم إنشاء المستخدم بنجاح!",
					},

					auditLogs: {
						title: "سجلات التدقيق",
						action: "الإجراء",
						userId: "معرّف المستخدم",
						targetType: "نوع الهدف",
						targetId: "معرّف الهدف",
						timestamp: "الطابع الزمني",
						copy: "نسخ",
						loading: "جارٍ تحميل السجلات...",
						fetchError: "حدث خطأ أثناء جلب سجلات التدقيق.",
						noLogs: "لا توجد سجلات متاحة.",
					},

					pagination: {
						previous: "السابق",
						next: "التالي",
						pageOf: "الصفحة {{page}} من {{totalPages}}",
					},

					actions: {
						create_user: "إنشاء مستخدم",
						delete_user: "حذف مستخدم",
						update_user: "تحديث مستخدم",
					},

					staffList: {
						title: "قائمة الموظفين",
						loading: "جاري التحميل",
						error: "فشل في تحميل البيانات.",
						copy: "نسخ",
						notFound: "لم يتم العثور على أعضاء في طاقم العمل.",
						id: "المعرف",
						firstName: "الاسم",
						lastName: "اللقب",
						email: "البريد الإلكتروني",
						role: "الدور",
						phone: "رقم الهاتف",
						created: "تاريخ الإنشاء",
						actions: "الإجراءات",
						previous: "السابق",
						next: "التالي",
						page: "الصفحة {{page}} من {{totalPages}}",
						confirmDelete: "حذف المستخدم؟",
						confirmDeleteDesc:
							"هل أنت متأكد أنك تريد حذف المستخدم {{email}} الذي لديه دور {{role}}؟ هذا الإجراء لا يمكن التراجع عنه.",
						deleteSuccess: "تم حذف المستخدم بنجاح.",
						deleteError: "فشل في حذف المستخدم.",
					},

					deleteStaffDialog: {
						title: "حذف عضو من الموظفين",
						searchPlaceholder: "ابحث عن عضو من الموظفين",
						noStaffFound: "لا يوجد موظفون.",
						roleLabel: "الدور",
						errors: {
							fetchFailed: "فشل جلب قائمة الموظفين",
							deleteFailed: "فشل حذف أعضاء الموظفين",
						},
						success: "تم حذف {{count}} من أعضاء الموظفين بنجاح",
						warnings: {
							noSelection: "الرجاء تحديد عضو واحد على الأقل من الموظفين",
						},
						deleting: "جاري الحذف...",
						confirm: {
							title: "تأكيد الحذف",
							description:
								"هل أنت متأكد أنك تريد حذف {{count}} عضو من الموظفين؟ لا يمكن التراجع عن هذا الإجراء.",
						},
					},
					roles: {
						admin: "مدير",
						staff: "موظف",
					},
					common: {
						cancel: "إلغاء",
						delete: "حذف",
						edit: "تعديل",
						view: "عرض",
						back: "عودة",
						na: "غير متوفر",
						copy: "نسخ {{field}}",
						confirm: "تأكيد ({{count}})",
						dir: "rtl",
					},

					editUserDialog: {
						title: "تعديل المستخدم",
						firstName: "الاسم",
						lastName: "اللقب",
						phoneNumber: "رقم الهاتف",
						email: "البريد الإلكتروني",
						description: "تحديث معلومات المستخدم المحدد.",
						successMessage: "تم تحديث المستخدم بنجاح!",
						errorMessage: "فشل في تحديث المستخدم. حاول مرة أخرى.",
					},

					faculties: {
						title: "الكليات",
						addFaculty: "إضافة كلية",
						editFaculty: "تعديل الكلية",
						deleteFaculty: "حذف الكلية",
						confirmDelete: "هل أنت متأكد من أنك تريد حذف هذه الكلية؟",
						name: "الاسم",
						code: "المعرف",
						departmentCount: "عدد الأقسام",
						actions: "الإجراءات",
						submit: "إرسال",
						cancel: "إلغاء",
						successCreate: "تم إنشاء الكلية بنجاح!",
						successUpdate: "تم تحديث الكلية بنجاح!",
						successDelete: "تم حذف الكلية بنجاح!",
						error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
						notFound: "لم يتم العثور على كليات.",
					},

					addFaculty: {
						title: "إضافة كلية جديدة",
						name: "الاسم",
						cancel: "إلغاء",
						submit: "إرسال",
						nameRequired: "اسم الكلية مطلوب.",
						success: "تمت إضافة الكلية بنجاح!",
						duplicateTitle: "كلية بهذا الاسم موجودة بالفعل.",
						duplicateSubtitle: "يرجى اختيار اسم مختلف.",
						errorTitle: "حدث خطأ.",
						errorSubtitle: "يرجى المحاولة مرة أخرى لاحقًا.",
					},

					students: {
						title: "الطلاب",
						matricule: "الرقم الجامعي",
						firstName: "الاسم",
						lastName: "اللقب",
						enrollmentYear: "سنة التسجيل",
						dateOfBirth: "تاريخ الميلاد",
						specialtyId: "التخصص",
						field: "ميدان",
						major: "فرع",
						specialty: "الاختصاص",
						numberOfDocuments: "عدد الوثائق",
						year: "السنة",
						createdAt: "تاريخ الإضافة",
						actions: "إجراءات",
						notFound: "لم يتم العثور على طلاب",
						copyId: "نسخ الرقم الجامعي",
						requiredField: "يرجى ملء الحقل المطلوب: {{field}}",
						noDocuments: "يرجى تحميل وثيقة واحد على الأقل.",
						invalidDOB: "تنسيق تاريخ الميلاد غير صالح.",
						futureDOB: "لا يمكن أن يكون تاريخ الميلاد في المستقبل.",
						invalidEnrollmentYear:
							"يجب أن تكون سنة التسجيل بين 1900 و{{year}}.",
						exists: "يوجد طالب بهذا الرقم التسلسلي بالفعل.",
						chooseDifferent: "يرجى اختيار رقم تسلسلي مختلف.",
						created: "تم إنشاء الطالب بنجاح.",
						creationError: "حدث خطأ أثناء إنشاء الطالب.",
						profile: "ملف الطالب",
						info: "معلومات الطالب",
						documents: "الوثائق",
						name: "الاسم",
						uploadToGetStarted: "قم بتحميل المستندات للبدء",
						confirmDeleteTitle: "حذف الطالب",
						confirmDeleteDescription:
							"هل أنت متأكد أنك تريد حذف {{name}}؟ هذا الإجراء لا يمكن التراجع عنه.",
						deleteSuccess: "تم حذف الطالب بنجاح",
						deleteFailed: "فشل في حذف الطالب",
					},

					addStudent: {
						back: "رجوع",
						title: "إضافة طالب جديد",
						description: "يرجى ملء التفاصيل أدناه لإنشاء سجل طالب جديد.",

						academicInfo: "المعلومات الأكاديمية",
						faculty: "الكلية",
						selectFaculty: "اختر الكلية",
						department: "القسم",
						selectDepartment: "اختر القسم",
						field: "ميدان",
						selectField: "اختر ميدان",
						major: "فرع",
						selectMajor: "اختر فرع",
						specialty: "التخصص",
						selectSpecialty: "اختر التخصص",
						personalInfo: "المعلومات الشخصية",
						matricule: "الرقم التسلسلي",
						enterMatricule: "أدخل الرقم التسلسلي",
						firstName: "الاسم",
						enterFirstName: "أدخل الاسم",
						lastName: "اللقب",
						enterLastName: "أدخل اللقب",
						dateOfBirth: "تاريخ الميلاد",
						enrollmentYear: "سنة التسجيل",
						enterEnrollmentYear: "أدخل سنة التسجيل",
						createStudent: "إنشاء طالب",
					},

					documents: {
						title: "وثائق",
						count: "{{count}} ملف{{pluralSuffix}}",
						upload: "تحميل وثائق",
						emptyTitle: "لم يتم تحميل أي وثائق",
						emptyDescription: "قم بتحميل وثائق الطالب للبدء",
						remove: "إزالة {{fileName}}",
					},

					uploadDocuments: {
						title: "تحميل وثائق",
						dragAndDrop: "اسحب وأفلت الملفات  هنا",
						orClick: "أو انقر لتصفح جهازك",
						supportedFormats: "الصيغ المدعومة: PDF، PNG، JPG، JPEG، DOC، DOCX",
						uploadedFiles: "الملفات التي تم تحميلها ({{count}})",
						documentType: "نوع وثيقة",
						loadingTypes: "جارٍ تحميل الأنواع...",
						selectDocumentType: "اختر نوع المستند",
						remove: "إزالة",
						typeRequired: "يرجى تحديد نوع لكل وثيقة",
						typeExists: "هذا النوع موجود بالفعل",
						typeAddError: "فشل في إضافة نوع وثيقة. حاول مرة أخرى.",
						documentTypes: "أنواع وثائق",
						addNewDocumentType: "إضافة نوع وثيقة جديد",
						enterNewTypeName: "أدخل اسم النوع الجديد",
						add: "إضافة",
						adding: "جارٍ الإضافة...",
						cancel: "إلغاء",
					},

					filterPanel: {
						title: "البحث وتصفية الطلاب",
						close: "إغلاق لوحة التصفية",
						searchLabel: "البحث بالاسم، الرقم، إلخ",
						searchPlaceholder: "أدخل كلمة البحث...",
						options: "خيارات التصفية:",
						matricule: "رقم التسجيل",
						enterMatricule: "أدخل رقم التسجيل",
						faculty: "الكلية",
						selectFaculty: "اختر الكلية",
						department: "القسم",
						selectDepartment: "اختر القسم",
						field: "المجال",
						selectField: "اختر المجال",
						major: "التخصص",
						selectMajor: "اختر التخصص",
						specialty: "الاختصاص",
						selectSpecialty: "اختر الاختصاص",
						reset: "إعادة التصفية",
						apply: "تطبيق التصفية",
					},

					loading: "جارٍ التحميل...",

					departments: {
						titleWithFaculty: "الاقسام في: {{faculty}}",
						title: "الأقسام",
						name: "الاسم",
						code: "الرمز",
						createdAt: "تاريخ الإنشاء",
						actions: "الإجراءات",
						fieldsCount: "عدد الميادين",
						noDepartments: "لم يتم العثور على أقسام.",
						searchPlaceholder: "ابحث عن الأقسام...",
						deleteSuccess: "تم حذف القسم '{{name}}' بنجاح!",
						deleteFail: "فشل في حذف القسم '{{name}}'.",
						NumberofFields: "عدد الميادين",
					},

					addDepartment: {
						title: "إضافة قسم جديد",
						name: "الاسم",
						nameRequired: "اسم القسم مطلوب.",
						success: "تمت إضافة القسم بنجاح!",
						duplicateTitle: "يوجد قسم بهذا الاسم بالفعل.",
						duplicateMessage: "يرجى اختيار اسم مختلف.",
					},

					error: {
						title: "حدث خطأ.",
						message: "يرجى المحاولة لاحقًا.",
					},

					actionsDep: {
						cancel: "إلغاء",
						submit: "إرسال",
					},

					confirm: {
						title: "تأكيد الحذف",
						description:
							"هل أنت متأكد أنك تريد حذف الكلية: {{name}}؟ لا يمكن التراجع عن هذا الإجراء.",
						major: {
							description:
								"هل أنت متأكد أنك تريد حذف هذا فرع؟ لا يمكن التراجع عن هذا الإجراء.",
						},

						department: {
							description: 'هل أنت متأكد من حذف الـ {{entity}} "{{name}}"؟',
							entities: {
								department: "القسم",
							},
						},

						field: {
							description:
								'هل أنت متأكد من حذف الـ {{entity}} "{{name}}"؟ لا يمكن التراجع عن هذا الإجراء.',
							entities: {
								field: "ميدان",
							},
						},

						specialty: {
							description:
								"هل أنت متأكد من حذف الـ {{entity}} « {{name}} »؟ لا يمكن التراجع عن هذا الإجراء.",
							entities: {
								specialty: "التخصص",
							},
						},
					},

					navigation: {
						home: "الرئيسية",
					},

					fields: {
						title: "الميادين",
						search_placeholder: "ابحث في الميادين...",
						majors_count: "عدد التخصصات",
						created_at: "تاريخ الإنشاء",
						actions: "الإجراءات",
						not_found: "لم يتم العثور على ميادين",
						deleted_success: "تم حذف الميدان '{{name}}' بنجاح!",
						deleted_fail: "فشل في حذف الميدان '{{name}}'.",
						titleWithDepartment: "الميادين في: {{department}}",
						code: "الرمز",
						name: "الاسم",
						MajorsCount: "عدد الفروع",
						createdAt: "تاريخ الإنشاء",
					},

					AddFieldDialog: {
						title: "إضافة ميدان جديد",
						nameLabel: "الاسم",
						cancel: "إلغاء",
						submit: "إرسال",
						close: "إغلاق النافذة",
						errors: {
							nameRequired: "اسم ميدان مطلوب.",
							nameTakenTitle: "يوجد ميدان بهذا الاسم بالفعل.",
							nameTakenDesc: "يرجى اختيار اسم مختلف.",
							genericTitle: "حدث خطأ.",
							genericDesc: "يرجى المحاولة مرة أخرى لاحقًا.",
						},
						success: {
							added: "تم إضافة ميدان بنجاح!",
						},
					},

					majors: {
						title: "الفروع",
						titleWithfield: "الفروع في: {{field}}",
						table: {
							code: "الرمز",
							name: "الاسم",
							specialtiesCount: "عدد التخصصات",
							createdAt: "تاريخ الإنشاء",
							actions: "الإجراءات",
						},
						notFound: "لم يتم العثور على الفروع",
					},

					addMajor: {
						title: "إضافة فرع جديد",
						nameLabel: "الاسم",
						cancel: "إلغاء",
						submit: "إرسال",
						close: "إغلاق النافذة",
						success: "تمت إضافة الفرع بنجاح!",
						errors: {
							nameRequired: "اسم الفرع مطلوب.",
							nameTaken: {
								title: "يوجد فرع بنفس الاسم.",
								desc: "يرجى اختيار اسم مختلف.",
							},
							general: {
								title: "حدث خطأ ما.",
								desc: "يرجى المحاولة مرة أخرى لاحقًا.",
							},
						},
					},

					specialties: {
						title: "التخصصات",
						titleWithMajor: "التخصصات في: {{major}}",
						code: "الرمز",
						name: "الاسم",
						createdAt: "تاريخ الإنشاء",
						actions: "الإجراءات",
						notFound: "لم يتم العثور على تخصصات",
					},

					addSpecialty: {
						title: "إضافة تخصص جديد",
						nameLabel: "الاسم",
						cancel: "إلغاء",
						submit: "إرسال",
						close: "إغلاق النافذة",
						success: "تمت إضافة التخصص بنجاح!",
						errors: {
							nameRequired: "اسم التخصص مطلوب.",
							nameTaken: {
								title: "يوجد تخصص بنفس الاسم.",
								desc: "يرجى اختيار اسم مختلف.",
							},
							general: {
								title: "حدث خطأ ما.",
								desc: "يرجى المحاولة مرة أخرى لاحقًا.",
							},
						},
					},

					editFacultyDialog: {
						title: "تعديل الكلية",
						description: "قم بتحديث اسم الكلية.",
						facultyName: "اسم الكلية",
						cancelButton: "إلغاء",
						saveButton: "حفظ",
						successMessage: "تم تحديث الكلية بنجاح",
						errorMessage: "فشل في تحديث الكلية",
						errors: {
							nameExistsTitle: "اسم الكلية موجود بالفعل",
							nameExistsDesc: "يرجى اختيار اسم مختلف.",
						},
					},

					editDepartmentDialog: {
						title: "تعديل القسم",
						description: "تحديث اسم القسم.",
						departmentName: "اسم القسم",
						cancelButton: "إلغاء",
						saveButton: "حفظ",
						successMessage: "تم تحديث القسم بنجاح",
						errorMessage: "فشل في تحديث القسم",
						errors: {
							nameExistsTitle: "اسم القسم موجود بالفعل",
							nameExistsDesc: "يرجى اختيار اسم مختلف.",
						},
					},

					editFieldDialog: {
						title: "تعديل ميدان",
						description: "قم بتحديث اسم ميدان.",
						fieldName: "اسم ميدان",
						cancelButton: "إلغاء",
						saveButton: "حفظ",
						successMessage: "تم تحديث ميدان بنجاح.",
						errorMessage: "فشل في تحديث ميدان.",
						errors: {
							nameExistsTitle: "اسم ميدان موجود بالفعل",
							nameExistsDesc: "يرجى اختيار اسم مختلف.",
						},
					},

					editMajorDialog: {
						title: "تعديل فرع",
						description: "قم بتحديث اسم فرع.",
						majorName: "اسم فرع",
						cancelButton: "إلغاء",
						saveButton: "حفظ",
						successMessage: "تم تحديث فرع بنجاح.",
						errorMessage: "فشل في تحديث فرع.",
						errors: {
							nameExistsTitle: "اسم فرع موجود بالفعل",
							nameExistsDesc: "يرجى اختيار اسم مختلف.",
						},
					},

					editSpecialtyDialog: {
						title: "تعديل التخصص",
						description: "تحديث اسم التخصص.",
						specialtyName: "اسم التخصص",
						cancelButton: "إلغاء",
						saveButton: "حفظ",
						successMessage: "تم تحديث التخصص بنجاح.",
						errorMessage: "فشل في تحديث التخصص.",
						errors: {
							nameExistsTitle: "اسم التخصص موجود بالفعل",
							nameExistsDesc: "يرجى اختيار اسم مختلف.",
						},
					},

					updateStudent: {
						title: "تحديث الطالب",
						notFound: "الطالب غير موجود",
						academicInfo: "المعلومات الأكاديمية",
						personalInfo: "المعلومات الشخصية",
						studentDocuments: "وثائق الطالب",
						uploadNewDocument: "رفع وثيقة جديدة",
						documentFile: "ملف الوثيقة",
						addDocumentToPending: "إضافة الوثيقة إلى التغييرات المعلقة",
						pendingDocumentsNote:
							'وثائق معلقة (سيتم رفعها عند النقر على "تحديث معلومات الطالب")',
						existingDocuments: "الوثائق الموجودة",
						noDocuments: "لا توجد وثائق",
						faculty: "الكلية",
						selectFaculty: "اختر الكلية",
						department: "القسم",
						selectDepartment: "اختر القسم",
						field: "ميدان",
						selectField: "اختر ميدان",
						major: "فرع",
						selectMajor: "اختر  فرع",
						specialty: "التخصص",
						selectSpecialty: "اختر التخصص",
						matricule: "رقم التسجيل",
						firstName: "الاسم",
						lastName: "اللقب",
						dateOfBirth: "تاريخ الميلاد",
						enrollmentYear: "سنة التسجيل",
						updateButton: "تحديث معلومات الطالب",
						savingChanges: "جاري حفظ التغييرات...",
						selectDocumentType: "اختر نوع الوثيقة",
						unknownType: "نوع غير معروف",
						noFilename: "لا يوجد اسم ملف",
						deleteDocumentTitle: "حذف الوثيقة",
						deleteDocumentDescription:
							"هل أنت متأكد أنك تريد حذف هذه الوثيقة؟ لا يمكن التراجع عن هذا الإجراء.",
						documentDeletedSuccess: "تم حذف الوثيقة بنجاح",
						documentDeleteFailed: "فشل حذف الوثيقة",
						documentAddedPending: "تمت إضافة الوثيقة إلى التغييرات المعلقة",
						documentRemovedPending: "تمت إزالة الوثيقة من التغييرات المعلقة",
						allChangesSaved: "تم حفظ جميع التغييرات بنجاح",
						failedToSaveChanges: "فشل حفظ التغييرات",
					},

					search: {
						facultyPlaceholder: "ابحث في الكليات...",
						departmentPlaceholder: "ابحث في الأقسام...",
						fieldPlaceholder: "ابحث في الميادين...",
						majorPlaceholder: "ابحث في الفروع...",
						specialtyPlaceholder: "ابحث في التخصصات...",
						teamPlaceholder: "ابحث في قائمة الموظفين...",
						button: "بحث",
					},
					terms: {
						faculty: "كلية",
						department: "قسم",
						field: "ميدان",
						major: "فرع",
						specialty: "تخصص",
					},

					errors: {
						deleteSpecialty: "فشل حذف التخصص '{{name}}'.",
						requiredRelation:
							"لا يمكن حذف '{{name}}' لأنه قيد الاستخدام من قبل الطلاب.",
						generic400: "فشل حذف التخصص: {{message}}",
					},
				},
			},
		},
	});

export default i18n;
