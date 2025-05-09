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
            team: "Team",
            addUser: "Add user",
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
            addUser: "Ajouter un utilisateur",
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
        },
      },
    },
  });

export default i18n;
