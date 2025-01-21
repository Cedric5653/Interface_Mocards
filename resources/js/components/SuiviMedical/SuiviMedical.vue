<!-- SuiviMedical.vue -->
<template>
    <div class="suivi-medical">
      <!-- En-tête -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 class="mb-0">
            <i class="fas fa-stethoscope me-2"></i>
            Suivi Médical
          </h4>
          <button 
            v-if="canEdit"
            class="btn btn-light"
            @click="showAddModal"
          >
            <i class="fas fa-plus me-2"></i>
            Nouvelle consultation
          </button>
        </div>
  
        <!-- Information patient -->
        <div class="card-body" v-if="suivi">
          <div class="row">
            <div class="col-md-6">
              <div class="patient-info">
                <div class="info-item">
                  <span class="label">Patient:</span>
                  <span>{{ suivi.patient.nom }} {{ suivi.patient.prenom }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Âge:</span>
                  <span>{{ calculateAge(suivi.patient.date_naissance) }} ans</span>
                </div>
                <div class="info-item">
                  <span class="label">Dernière visite:</span>
                  <span>{{ formatDate(suivi.last_consultation) }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="vitals-info">
                <h6>Constantes vitales</h6>
                <div class="vitals-grid">
                  <div class="vital-item">
                    <span class="vital-label">Tension</span>
                    <span class="vital-value">{{ suivi.vitals?.tension || 'N/A' }}</span>
                  </div>
                  <div class="vital-item">
                    <span class="vital-label">Poids</span>
                    <span class="vital-value">{{ suivi.vitals?.poids || 'N/A' }} kg</span>
                  </div>
                  <div class="vital-item">
                    <span class="vital-label">Température</span>
                    <span class="vital-value">{{ suivi.vitals?.temperature || 'N/A' }}°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a 
            class="nav-link"
            :class="{ active: activeTab === 'prescriptions' }"
            href="#"
            @click.prevent="activeTab = 'prescriptions'"
          >
            <i class="fas fa-prescription me-2"></i>
            Prescriptions en cours
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link"
            :class="{ active: activeTab === 'observations' }"
            href="#"
            @click.prevent="activeTab = 'observations'"
          >
            <i class="fas fa-notes-medical me-2"></i>
            Observations médicales
          </a>
        </li>
      </ul>
  
      <!-- Contenu dynamique -->
      <PrescriptionsEnCours 
        v-if="activeTab === 'prescriptions'"
        :prescriptions="prescriptions"
        @refresh="refreshPrescriptions"
      />
      
      <ObservationsMedicales 
        v-if="activeTab === 'observations'"
        :observations="observations"
        @refresh="refreshObservations"
      />
  
      <!-- Modal d'ajout/modification de consultation -->
      <div class="modal fade" id="consultationModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editMode ? 'Modifier la consultation' : 'Nouvelle consultation' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="handleSubmit">
                <!-- Formulaire -->
                <div class="row g-3">
                  <div class="col-md-12">
                    <label class="form-label required">Diagnostic</label>
                    <textarea
                      class="form-control"
                      v-model="formData.diagnostic"
                      rows="3"
                      required
                    ></textarea>
                  </div>
  
                  <div class="col-md-12">
                    <label class="form-label">Prescription</label>
                    <textarea
                      class="form-control"
                      v-model="formData.prescription"
                      rows="3"
                    ></textarea>
                  </div>
  
                  <div class="col-md-12">
                    <label class="form-label">Posologie</label>
                    <textarea
                      class="form-control"
                      v-model="formData.posologie"
                      rows="2"
                    ></textarea>
                  </div>
  
                  <div class="col-md-12">
                    <label class="form-label">Observations</label>
                    <textarea
                      class="form-control"
                      v-model="formData.observations"
                      rows="3"
                    ></textarea>
                  </div>
  
                  <!-- Constantes vitales -->
                  <div class="col-md-4">
                    <label class="form-label">Tension</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.tension"
                    >
                  </div>
  
                  <div class="col-md-4">
                    <label class="form-label">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      class="form-control"
                      v-model="formData.poids"
                    >
                  </div>
  
                  <div class="col-md-4">
                    <label class="form-label">Température (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      class="form-control"
                      v-model="formData.temperature"
                    >
                  </div>
                </div>
  
                <div class="text-end mt-4">
                  <button
                    type="button"
                    class="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    {{ editMode ? 'Modifier' : 'Ajouter' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap';
  import { useAuth } from '@/composables/useAuth';
  import { useSuiviMedical } from '@/composables/useSuiviMedical';
  import PrescriptionsEnCours from './PrescriptionsEnCours.vue';
  import ObservationsMedicales from './ObservationsMedicales.vue';
  
  const props = defineProps({
    patientId: {
      type: String,
      required: true
    }
  });
  
  // États
  const activeTab = ref('prescriptions');
  const editMode = ref(false);
  const consultationModal = ref(null);
  
  // Form Data
  const formData = ref({
    diagnostic: '',
    prescription: '',
    posologie: '',
    observations: '',
    tension: '',
    poids: '',
    temperature: ''
  });
  
  // Composables
  const { user } = useAuth();
  const { 
    suivi,
    prescriptions, 
    observations,
    loading,
    fetchSuiviMedical,
    createSuivi,
    updateSuivi,
    getPrescriptionsEnCours,
    getObservationsMedicales
  } = useSuiviMedical();
  
  // Computed
  const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
      p.permission_name === 'Modifier_Suivi_Medical'
    );
  });
  
  // Méthodes
  const showAddModal = () => {
    editMode.value = false;
    resetForm();
    consultationModal.value.show();
  };
  
  const handleSubmit = async () => {
    try {
      const data = {
        ...formData.value,
        patient_id: props.patientId,
        medecin_id: user.value.user_id,
        date_consultation: new Date().toISOString().split('T')[0]
      };
  
      if (editMode.value) {
        await updateSuivi(suivi.value.suivi_id, data);
      } else {
        await createSuivi(data);
      }
  
      consultationModal.value.hide();
      await refreshData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };
  
  const resetForm = () => {
    formData.value = {
      diagnostic: '',
      prescription: '',
      posologie: '',
      observations: '',
      tension: '',
      poids: '',
      temperature: ''
    };
  };
  
  const refreshData = async () => {
    await Promise.all([
      fetchSuiviMedical(props.patientId),
      getPrescriptionsEnCours(props.patientId),
      getObservationsMedicales(props.patientId)
    ]);
  };
  
  const refreshPrescriptions = () => {
    getPrescriptionsEnCours(props.patientId);
  };
  
  const refreshObservations = () => {
    getObservationsMedicales(props.patientId);
  };
  
  // Helpers
  const calculateAge = (dateNaissance) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Lifecycle
  onMounted(async () => {
    consultationModal.value = new Modal(document.getElementById('consultationModal'));
    await refreshData();
  });
  </script>
  
  <style scoped>
  .vitals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .vital-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
  }
  
  .vital-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
  }
  
  .vital-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0d6efd;
  }
  
  .info-item {
    margin-bottom: 0.5rem;
  }
  
  .info-item .label {
    font-weight: 600;
    margin-right: 0.5rem;
  }
  
  .required::after {
    content: '*';
    color: red;
    margin-left: 4px;
  }
  </style>