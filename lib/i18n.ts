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

					students: {
						title: "Students",
						matricule: "Matricule",
						firstName: "First Name",
						lastName: "Last Name",
						enrollmentYear: "Enrollment Year",
						dateOfBirth: "Date of Birth",
						specialtyId: "Specialty",
						year: "Year",
						createdAt: "Created At",
						actions: "Actions",
						notFound: "No students found",
						copyId: "Copy Matricule",
						inDepartment: "Students in {{department}}",
						noStudentsFound: "No students found.",
						table: {
							id: "ID",
							name: "Name",
							email: "Email",
							createdAt: "Created At",
						},
					},
					loading: "Loading...",

					confirm: {
						title: "Confirm Deletion",
						description:
							"Are you sure you want to delete {{name}}? This action cannot be undone.",
					},

					breadcrumbs: {
						home: "Home",
						faculties: "Faculties",
					},

					departments: {
						title: "Departments",
						code: "Code",
						name: "Name",
						specialtiesCount: "Number of Specialties",
						createdAt: "Created At",
						updatedAt: "Updated At",
						actions: "Actions",
						notFound: "No departments found",
						unknown: "Unknown Department",
					},
					navigation: {
						home: "Home",
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

					students: {
						title: "Étudiants",
						matricule: "Matricule",
						firstName: "Prénom",
						lastName: "Nom",
						enrollmentYear: "Année d'inscription",
						dateOfBirth: "Date de naissance",
						specialtyId: "Spécialité",
						year: "Année",
						createdAt: "Créé le",
						actions: "Actions",
						notFound: "Aucun étudiant trouvé",
						copyId: "Copier le matricule",
					},
					loading: "Chargement...",

					confirm: {
						title: "Confirmer la suppression",
						description:
							"Êtes-vous sûr de vouloir supprimer {{count}} membre(s) du personnel ? Cette action est irréversible.",
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
						inbox: "الوارد",
						search: "بحث",
						settings: "الإعدادات",
						students: "الطلاب",
						application: "التطبيق",
						manageStudents: "إدارة الطلاب",
						connected: "متصل بالخادم",
						disconnected: "غير متصل بالخادم",
						checking: "جارٍ التحقق من حالة الخادم...",
						manageFaculties: "إدارة الكليات", // New entry
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
						code: "الرمز",
						departmentCount: "عدد الإدارات",
						actions: "الإجراءات",
						submit: "إرسال",
						cancel: "إلغاء",
						successCreate: "تم إنشاء الكلية بنجاح!",
						successUpdate: "تم تحديث الكلية بنجاح!",
						successDelete: "تم حذف الكلية بنجاح!",
						error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
						notFound: "لم يتم العثور على كليات.",
					},

					students: {
						title: "الطلاب",
						matricule: "الرقم الجامعي",
						firstName: "الاسم",
						lastName: "اللقب",
						enrollmentYear: "سنة التسجيل",
						dateOfBirth: "تاريخ الميلاد",
						specialtyId: "التخصص",
						year: "السنة",
						createdAt: "تاريخ الإضافة",
						actions: "إجراءات",
						notFound: "لم يتم العثور على طلاب",
						copyId: "نسخ الرقم الجامعي",
					},
					loading: "جارٍ التحميل...",

					confirm: {
						title: "تأكيد الحذف",
						description:
							"هل أنت متأكد أنك تريد حذف الكلية {{name}}؟ لا يمكن التراجع عن هذا الإجراء.",
					},
				},
			},
		},
	});

export default i18n;
