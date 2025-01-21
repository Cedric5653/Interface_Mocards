<!-- PatientDetails.vue -->
<template>
    <div class="patient-details">
      <!-- Entête avec informations principales -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <div class="patient-avatar me-3">
              {{ getInitials(patient?.nom, patient?.prenom) }}
            </div>
            <div>
              <h3 class="mb-0">{{ patient?.nom }} {{ patient?.prenom }}</h3>
              <small>{{ getAge(patient?.date_naissance) }} ans</small>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-light btn-sm" @click="goBack">
              <i class="fas fa-arrow-left"></i> Retour
            </button>
            <button class="btn btn-light btn-sm" @click="editPatient">
              <i class="fas fa-edit"></i> Modifier
            </button>
          </div>
        </div>
  
        <!-- Informations principales -->
        <div class="card-body">
          <div class="row g-4">
            <div class="col-md-6">
              <h5 class="card-title">
                <i class="fas fa-info-circle"></i> Informations personnelles
              </h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Naissance:</span>
                  <span>{{ formatDate(patient?.date_naissance) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Groupe sanguin:</span>
                  <span class="badge bg-info">{{ patient?.groupe_sanguin || 'Non spécifié' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Téléphone:</span>
                  <span>{{ patient?.telephone || 'Non spécifié' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span>{{ patient?.email || 'Non spécifié' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Adresse:</span>
                  <span>{{ patient?.adresse || 'Non spécifié' }}</span>
                </div>
              </div>
            </div>
  
            <div class="col-md-6">
              <h5 class="card-title">
                <i class="fas fa-medical-notes"></i> Informations médicales
              </h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Allergies:</span>
                  <span>{{ patient?.allergies || 'Aucune allergie connue' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Maladies chroniques:</span>
                  <span>{{ patient?.maladies_chroniques || 'Aucune maladie chronique' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Donneur d'organes:</span>
                  <span>
                    <i :class="patient?.donneur_organes ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Navigation des sections -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item" v-for="tab in tabs" :key="tab.id">
          <a 
            class="nav-link"
            :class="{ active: activeTab === tab.id }"
            href="#"
            @click.prevent="activeTab = tab.id"
          >
            <i :class="tab.icon"></i> {{ tab.name }}
          </a>
        </li>
      </ul>
  
      <!-- Contenu des sections -->
      <div class="tab-content">
        <!-- Consultations -->
        <div v-if="activeTab === 'consultations'" class="consultations-list">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Historique des consultations</h4>
            <button class="btn btn-primary" @click="showNewConsultation">
              <i class="fas fa-plus"></i> Nouvelle consultation
            </button>
          </div>
          <ConsultationsList 
            :consultations="consultations"
            @refresh="fetchConsultations"
          />
        </div>
  
        <!-- Examens -->
        <div v-if="activeTab === 'examens'" class="examens-list">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Examens et résultats</h4>
            <button class="btn btn-primary" @click="showNewExamen">
              <i class="fas fa-plus"></i> Nouvel examen
            </button>
          </div>
          <ExamensList 
            :examens="examens"
            @refresh="fetchExamens"
          />
        </div>
  
        <!-- Documents -->
        <div v-if="activeTab === 'documents'" class="documents-list">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Documents médicaux</h4>
            <button class="btn btn-primary" @click="showUploadDocument">
              <i class="fas fa-upload"></i> Ajouter un document
            </button>
          </div>
          <DocumentsList 
            :documents="documents"
            @refresh="fetchDocuments"
          />
        </div>
  
        <!-- Vaccinations -->
        <div v-if="activeTab === 'vaccinations'" class="vaccinations-list">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Historique des vaccinations</h4>
            <button class="btn btn-primary" @click="showNewVaccination">
              <i class="fas fa-syringe"></i> Nouvelle vaccination
            </button>
          </div>
          <VaccinationsList 
            :vaccinations="vaccinations"
            @refresh="fetchVaccinations"
          />
        </div>
      </div>
  
      <!-- Modals -->
      <ConsultationModal 
        ref="consultationModal"
        :patient-id="patientId"
        @saved="fetchConsultations"
      />
      <ExamenModal 
        ref="examenModal"
        :patient-id="patientId"
        @saved="fetchExamens"
      />
      <DocumentModal 
        ref="documentModal"
        :patient-id="patientId"
        @saved="fetchDocuments"
      />
      <VaccinationModal 
        ref="vaccinationModal"
        :patient-id="patientId"
        @saved="fetchVaccinations"
      />
    </div>


      <!-- Section des onglets -->
      <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
              <a 
                  class="nav-link"
                  :class="{ active: activeTab === 'consultations' }"
                  @click.prevent="activeTab = 'consultations'"
                  href="#"
              >
                  <i class="fas fa-stethoscope"></i> Consultations
              </a>
          </li>
          <!-- Autres onglets... -->
      </ul>

      <!-- Contenu des onglets -->
      <div class="tab-content">
          <!-- Onglet Consultations -->
          <div v-if="activeTab === 'consultations'" class="tab-pane active">
              <!-- Liste des consultations -->
              <ConsultationsList
                  v-if="!selectedConsultation && !showForm"
                  :patient-id="patientId"
                  @consultation-selected="showConsultationDetails"
                  @new-consultation="showConsultationForm"
              />

              <!-- Détails d'une consultation -->
              <ConsultationDetails
                  v-if="selectedConsultation && !showForm"
                  :consultation="selectedConsultation"
                  @edit="editConsultation"
                  @close="closeConsultationDetails"
              />

              <!-- Formulaire de consultation -->
              <ConsultationForm
                  v-if="showForm"
                  :patient-id="patientId"
                  :consultation="editingConsultation"
                  :edit-mode="!!editingConsultation"
                  @saved="handleConsultationSaved"
                  @cancel="closeConsultationForm"
              />
          </div>

          <!-- Autres onglets... -->
      </div>
  </div>
  </template>
  
  <script setup>

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePatients } from '@/composables/Patients/usePatients';
import ConsultationsList from '@/components/Consultations/ConsultationsList.vue';
import ExamensList from '@/components/Examen/ExamensList.vue';
import DocumentsList from '@/components/Docx/DocumentsList.vue';
import VaccinationsList from '@/components/Vaccinations/VaccinationsList.vue';
import ConsultationModal from '@/components/modals/ConsultationModal.vue';
import ExamenModal from '@/components/modals/ExamenModal.vue';
import DocumentModal from '@/components/modals/DocumentModal.vue';
import VaccinationModal from '@/components/modals/VaccinationModal.vue';

    // Route et Navigation
    const route = useRoute();
    const router = useRouter();
    const patientId = route.params.id;

    // États
    const activeTab = ref('consultations');
    const patient = ref(null);
    const consultations = ref([]);
    const examens = ref([]);
    const documents = ref([]);
    const vaccinations = ref([]);

    // Références aux modals
    const consultationModal = ref(null);
    const examenModal = ref(null);
    const documentModal = ref(null);
    const vaccinationModal = ref(null);

    // Composables
    const { getPatientDetails } = usePatients();

    // Configuration des onglets
    const tabs = [
    { id: 'consultations', name: 'Consultations', icon: 'fas fa-stethoscope' },
    { id: 'examens', name: 'Examens', icon: 'fas fa-microscope' },
    { id: 'documents', name: 'Documents', icon: 'fas fa-file-medical' },
    { id: 'vaccinations', name: 'Vaccinations', icon: 'fas fa-syringe' }
    ];

    // Méthodes
    const fetchPatientData = async () => {
    try {
        const response = await getPatientDetails(patientId);
        patient.value = response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données du patient:', error);
        showErrorMessage('Erreur lors du chargement des données du patient');
    }
    };

    const fetchConsultations = async () => {
    try {
        const response = await api.get(`/v1/medical/consultations/${patientId}`);
        consultations.value = response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des consultations:', error);
    }
    };

    const fetchExamens = async () => {
    try {
        const response = await api.get(`/v1/medical/examinations/${patientId}`);
        examens.value = response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des examens:', error);
    }
    };

    const fetchDocuments = async () => {
    try {
        const response = await api.get(`/v1/documents?patient_id=${patientId}`);
        documents.value = response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
    }
    };

    const fetchVaccinations = async () => {
    try {
        const response = await api.get(`/v1/vaccinations?patient_id=${patientId}`);
        vaccinations.value = response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des vaccinations:', error);
    }
    };

    // Gestionnaires de modals
    const showNewConsultation = () => {
    consultationModal.value.show();
    };

    const showNewExamen = () => {
    examenModal.value.show();
    };

    const showUploadDocument = () => {
    documentModal.value.show();
    };

    const showNewVaccination = () => {
    vaccinationModal.value.show();
    };

    const editPatient = () => {
    router.push(`/patients/${patientId}/edit`);
    };

    const goBack = () => {
    router.back();
    };

    // Helpers
    const getInitials = (nom, prenom) => {
    return `${nom?.charAt(0) || ''}${prenom?.charAt(0) || ''}`.toUpperCase();
    };

    const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
    };

    const getAge = (dateNaissance) => {
    if (!dateNaissance) return '';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
    };

    // Messages
    const showErrorMessage = (message) => {
    // Implémentez votre système de notification ici
    console.error(message);
    };

    // Lifecycle hooks
    onMounted(async () => {
    await fetchPatientData();
    await Promise.all([
        fetchConsultations(),
        fetchExamens(),
        fetchDocuments(),
        fetchVaccinations()
    ]);
    });

    // Watch
    watch(activeTab, (newTab) => {
    // Rafraîchir les données lors du changement d'onglet
    switch (newTab) {
        case 'consultations':
        fetchConsultations();
        break;
        case 'examens':
        fetchExamens();
        break;
        case 'documents':
        fetchDocuments();
        break;
        case 'vaccinations':
        fetchVaccinations();
        break;
    }
    });

    //consultation

    import ConsultationsList from '../Consultations/ConsultationsList.vue';
    import ConsultationDetails from '../Consultations/ConsultationDetails.vue';
    import ConsultationForm from '../Consultations/ConsultationForm.vue';
    
// États
const activeTab = ref('consultations');
const selectedConsultation = ref(null);
const showForm = ref(false);
const editingConsultation = ref(null);

// Props
const props = defineProps({
  patientId: {
      type: [Number, String],
      required: true
  }
});

// Méthodes pour gérer les consultations
const showConsultationDetails = (consultation) => {
  selectedConsultation.value = consultation;
  showForm.value = false;
};

const showConsultationForm = () => {
  showForm.value = true;
  selectedConsultation.value = null;
  editingConsultation.value = null;
};

const editConsultation = (consultation) => {
  editingConsultation.value = consultation;
  showForm.value = true;
  selectedConsultation.value = null;
};

const closeConsultationDetails = () => {
  selectedConsultation.value = null;
};

const closeConsultationForm = () => {
  showForm.value = false;
  editingConsultation.value = null;
};

const handleConsultationSaved = () => {
  showForm.value = false;
  editingConsultation.value = null;
  // Rafraîchir la liste des consultations si nécessaire
};
  </script>
  
  <style scoped>
  .patient-details {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
  }
  
  .patient-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    color: white;
  }
  
  .info-grid {
    display: grid;
    gap: 15px;
    margin-top: 15px;
  }
  
  .info-item {
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
  }
  
  .info-item .label {
    font-weight: 600;
    color: #6c757d;
  }
  
  .nav-tabs .nav-link {
    color: #495057;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .nav-tabs .nav-link.active {
    color: #0d6efd;
    font-weight: 600;
  }
  
  .nav-tabs .nav-link i {
    font-size: 16px;
  }
  
  .tab-content {
    background: white;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-top: none;
    border-radius: 0 0 4px 4px;
  }
  
  .card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
  
  @media (max-width: 768px) {
    .info-item {
      grid-template-columns: 1fr;
    }
    
    .info-item .label {
      margin-bottom: 4px;
    }
  }
  </style>















<!-- PatientDetails.vue -->
<template>
  
</template>

<script setup>
import { ref } from 'vue';

</script>