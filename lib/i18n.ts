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
							"This action cannot be undone. Are you sure you want to delete this user?",
						deleteSuccess: "User deleted successfully.",
						deleteError: "Failed to delete user.",
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
						checking: "Vérification du statut du serveur...",
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
						loading: "Chargement en cours...",
						error: "Échec du chargement des données.",
						copy: "Copier",
						notFound: "Aucun membre du personnel trouvé.",
						id: "ID",
						firstName: "Prénom",
						lastName: "Nom de famille",
						email: "E-mail",
						role: "Rôle",
						phone: "Téléphone",
						created: "Date de création",
						actions: "Actions",
						previous: "Précédent",
						next: "Suivant",
						page: "Page {{page}} sur {{totalPages}}",
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
						loading: "جارٍ التحميل",
						error: "فشل في تحميل البيانات.",
						copy: "نسخ",
						notFound: "لم يتم العثور على موظفين.",
						id: "المعرف",
						firstName: "الاسم",
						lastName: "اللقب",
						email: "البريد الإلكتروني",
						role: "الدور",
						phone: "الهاتف",
						created: "تاريخ الإنشاء",
						actions: "الإجراءات",
						previous: "السابق",
						next: "التالي",
						page: "الصفحة {{page}} من {{totalPages}}",
					},
				},
			},
		},
	});

export default i18n;
