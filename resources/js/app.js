
import '../css/app.css'
import "./bootstrap";
import { createApp } from "vue";

import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

import DataTable from "datatables.net-vue3";
import DataTablesCore from 'datatables.net-bs5';
import languageFr from "datatables.net-plugins/i18n/fr-FR.mjs";
import 'datatables.net-select';
import 'datatables.net-responsive';
import router from "./routes";
import App from "./components/App.vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import ProgressBar from "./components/ProgressBar.vue";

import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import Login from "./components/Auth/Login.vue"
import Register from "./components/Auth/Register.vue"
import CarteUrgenceView from "./components/CarteUrgence/CarteUrgenceView.vue";
import CarteUrgenceForm from "./components/CarteUrgence/CarteUrgenceForm.vue";
import DossierMedical from "./components/DossierMedical/DossierMedical.vue"


// Configuration des options pour DataTable
DataTable.use(DataTablesCore);
const dataTableOptions = {
    responsive: true,
    language: languageFr
};

// Création de l'application Vue
const app = createApp(App);

// Enregistrement des composants
app.component("DataTable", DataTable);
app.component("header-cp", Header);
app.component("footer-cp", Footer);
app.component("progress-bar-cp", ProgressBar);
app.component("CU-CarteUrgenceList-cp", CarteUrgenceView);
app.component("CU-CarteUrgenceForm-cp", CarteUrgenceForm);
app.component("Auth-Login-cp", Login);
app.component("Auth-Register-cp", Register);
app.component("DossierMedical", DossierMedical);



const options = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};


app.use(BootstrapVue3);


app.use(Toast,options);

// Définition des variables globales
app.config.globalProperties.dataTableOptions = dataTableOptions;

// Montage de l'application Vue
app.use(router).mount("#app");