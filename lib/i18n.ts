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
				},
			},
		},
	});

export default i18n;
