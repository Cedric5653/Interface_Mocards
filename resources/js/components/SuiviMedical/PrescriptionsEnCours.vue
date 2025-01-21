<!-- PrescriptionsEnCours.vue -->
<template>
    <div class="prescriptions-en-cours">
      <!-- Liste des prescriptions actives -->
      <div class="row g-4">
        <div v-for="prescription in activePrescriptions" 
             :key="prescription.id"
             class="col-md-6">
          <div class="card prescription-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">{{ prescription.medicament }}</h6>
              <span :class="getStatusBadge(prescription.status)">
                {{ getStatusLabel(prescription.status) }}
              </span>
            </div>
  
            <div class="card-body">
              <div class="prescription-details">
                <div class="detail-item">
                  <i class="fas fa-clock text-muted me-2"></i>
                  <span>{{ prescription.posologie }}</span>
                </div>
                <div class="detail-item">
                  <i class="fas fa-calendar text-muted me-2"></i>
                  <span>{{ formatDateRange(prescription.date_debut, prescription.date_fin) }}</span>
                </div>
                <div class="detail-item" v-if="prescription.notes">
                  <i class="fas fa-sticky-note text-muted me-2"></i>
                  <span>{{ prescription.notes }}</span>
                </div>
              </div>
  
              <!-- Barre de progression -->
              <div class="progress mt-3" style="height: 6px;">
                <div class="progress-bar" 
                     :class="getProgressClass(prescription)"
                     :style="{ width: calculateProgress(prescription) + '%' }"
                     :title="`${calculateProgress(prescription)}% complété`">
                </div>
              </div>
  
              <!-- Médecin prescripteur -->
              <div class="prescriber mt-3">
                <small class="text-muted">
                  <i class="fas fa-user-md me-1"></i>
                  Prescrit par: Dr. {{ prescription.medecin?.nom }}
                </small>
              </div>
            </div>
  
            <!-- Actions -->
            <div class="card-footer">
              <div class="btn-group w-100">
                <button 
                  class="btn btn-outline-primary"
                  @click="editPrescription(prescription)"
                  v-if="canEdit"
                >
                  <i class="fas fa-edit me-1"></i>
                  Modifier
                </button>
                <button 
                  class="btn btn-outline-danger"
                  @click="confirmDelete(prescription)"
                  v-if="canEdit"
                >
                  <i class="fas fa-trash me-1"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Message si aucune prescription -->
        <div v-if="activePrescriptions.length === 0" class="col-12">
          <div class="alert alert-info text-center">
            <i class="fas fa-info-circle me-2"></i>
            Aucune prescription en cours
          </div>
        </div>
      </div>
  
      <!-- Modal d'édition -->
      <div class="modal fade" id="prescriptionModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Modifier la prescription</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label required">Médicament</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="formData.medicament"
                    required
                  >
                </div>
  
                <div class="mb-3">
                  <label class="form-label required">Posologie</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="formData.posologie"
                    required
                  >
                </div>
  
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label required">Date début</label>
                    <input 
                      type="date" 
                      class="form-control"
                      v-model="formData.date_debut"
                      required
                    >
                  </div>
                  <div class="col-md-6">
                    <label class="form-label required">Date fin</label>
                    <input 
                      type="date" 
                      class="form-control"
                      v-model="formData.date_fin"
                      required
                    >
                  </div>
                </div>
  
                <div class="mb-3">
                  <label class="form-label">Notes</label>
                  <textarea 
                    class="form-control"
                    v-model="formData.notes"
                    rows="3"
                  ></textarea>
                </div>
  
                <div class="modal-footer">
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    Enregistrer
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
  import { differenceInDays } from 'date-fns';
  
  const props = defineProps({
    prescriptions: {
      type: Array,
      required: true
    }
  });
  
  const emit = defineEmits(['refresh']);
  
  // États
  const prescriptionModal = ref(null);
  const loading = ref(false);
  const selectedPrescription = ref(null);
  
  // Form Data
  const formData = ref({
    medicament: '',
    posologie: '',
    date_debut: '',
    date_fin: '',
    notes: ''
  });
  
  // Composables
  const { user } = useAuth();
  
  // Computed
  const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
      p.permission_name === 'Modifier_Suivi_Medical'
    );
  });
  
  const activePrescriptions = computed(() => {
    return props.prescriptions.filter(p => 
      new Date(p.date_fin) >= new Date()
    );
  });
  
  // Méthodes
  const editPrescription = (prescription) => {
    selectedPrescription.value = prescription;
    formData.value = { ...prescription };
    prescriptionModal.value.show();
  };
  
  const calculateProgress = (prescription) => {
    const today = new Date();
    const start = new Date(prescription.date_debut);
    const end = new Date(prescription.date_fin);
  
    if (today < start) return 0;
    if (today > end) return 100;
  
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(today, start);
    return Math.round((elapsedDays / totalDays) * 100);
  };
  
  const getProgressClass = (prescription) => {
    const progress = calculateProgress(prescription);
    if (progress === 100) return 'bg-success';
    if (progress > 75) return 'bg-warning';
    return 'bg-primary';
  };
  
  const getStatusBadge = (status) => {
    const classes = {
      'en_cours': 'badge bg-success',
      'termine': 'badge bg-secondary',
      'suspendu': 'badge bg-warning'
    };
    return classes[status] || 'badge bg-primary';
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'suspendu': 'Suspendu'
    };
    return labels[status] || status;
  };
  
  const formatDateRange = (debut, fin) => {
    return `Du ${formatDate(debut)} au ${formatDate(fin)}`;
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  onMounted(() => {
    prescriptionModal.value = new Modal(document.getElementById('prescriptionModal'));
  });
  </script>
  
  <style scoped>
  .prescription-card {
    transition: transform 0.2s;
  }
  
  .prescription-card:hover {
    transform: translateY(-3px);
  }
  
  .detail-item {
    margin-bottom: 0.5rem;
  }
  
  .progress {
    background-color: #e9ecef;
  }
  
  .prescriber {
    font-size: 0.875rem;
  }
  
  .required::after {
    content: '*';
    color: red;
    margin-left: 4px;
  }
  </style>