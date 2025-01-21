import Home from "./components/Home.vue";
import Login from "./components/Auth/Login.vue";
import Register from "./components/Auth/Register.vue";
import CarteUrgenceView from "./components/CarteUrgence/CarteUrgenceView.vue";
import DossierMedical from "./components/DossierMedical/DossierMedical.vue"; 
import DossierMedicalList from "./components/DossierMedical/DossierMedicalList.vue"; 
import Dashboard from "./components/Dashboard/Dashboard.vue"; 

const navItems = [
    // Routes publiques
    {
        path: "/",
        label: "Accueil",
        name: "Home",
        component: Home,
        public: true
    },
    {
        path: "/dossier-medical",
        label: "Dossier Médical",
        name: "DossierMedical",
        component: DossierMedicalList,
        public: true
    },
    {
        path: "/carte-urgence",
        label: "Carte Urgence",
        name: "CarteUrgence",
        component: CarteUrgenceView,
        public: true
    },
    
    // Routes d'authentification
    {
        path: "/login",
        label: "Connexion",
        name: "Login",
        component: Login,
        auth: true,
        hideInNav: true
    },
    {
        path: "/register",
        label: "Inscription",
        name: "Register",
        component: Register,
        auth: true,
        hideInNav: true
    },
    {
        path: "/dashboard-userprofile",
        label: "UserProfile",
        name: "UserProfile",
        component: () => import('./components/Auth/UserProfile.vue'),
        auth: true,
        hideInNav: true
    },
  
    {
        path: "/dashboard",
        label: "Dashboard",
        name: "Dashboard",
        component: Dashboard,
        protected: true
    },
    {
        path: "/dossier-medical/:id",
        label: "Dossier Médical",
        name: "DossierMedical",
        component: DossierMedical,
        auth: true,
        hideInNav: true
    },
    {
        path: "/forgot-password",
        name: "ForgotPassword",
        component: () => import('./components/Auth/ChangePassword.vue'),
        auth: true,
        hideInNav: true
    },
    {
        path: "/reset-password",
        name: "ResetPassword",
        component: () => import('./components/Auth/ResetPassword.vue'),
        auth: true,
        hideInNav: true
    },
    {
        path: "/patients",
        name: "PatientList",
        component: () => import('./components/Patients/PatientsList.vue'),
        protected: true,
        hideInNav: true
    },
    {
        path: "/patients/new",
        name: "NewPatient",
        component: () => import('./components/Patients/PatientForm.vue'),
        protected: true,
        hideInNav: true
    },
    {
        path: "/patients/:id",
        name: "EditPatient",
        component: () => import('./components/Patients/PatientDetails.vue'),
        protected: true,
        hideInNav: true
    },

    // rdv 
    {
        path: "/appointments",
        name: "AppointmentList",
        component: () => import('./components/RendezVous/RendezVousList.vue'),
        protected: true,
        hideInNav: true
    },
    {
        path: "/appointments/new",
        name: "NewAppointment",
        component: () => import('./components/RendezVous/RendezVousForm.vue'),
        protected: true,
        hideInNav: true
    },
    {
        path: "/consultations",
        name: "ConsultationList",
        component: () => import('./components/Consultations/ConsultationList.vue'),
        protected: true,
        hideInNav: true
    },
    // {
    //     path: "/appointments/:id",
    //     name: "EditAppointment",
    //     component: () => import('./components/RendezVous/RendezVousDetails.vue'),
    //     protected: true,
    //     hideInNav: true
    // },
];

export default navItems;