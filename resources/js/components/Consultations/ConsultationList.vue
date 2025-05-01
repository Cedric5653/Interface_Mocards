
<template>
    <div class="consultations-list">
      <!-- En-tête avec filtres -->
      <div class="card mb-4">
        <div class="card-header bg-light">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-3 align-items-center">
              <div class="input-group input-group-sm" style="width: 200px;">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="Rechercher..."
                >
              </div>
              <select class="form-select form-select-sm" v-model="filterType">
                <option value="">Tous les types</option>
                <option value="routine">Routine</option>
                <option value="urgence">Urgence</option>
                <option value="suivi">Suivi</option>
                <option value="specialiste">Spécialiste</option>
              </select>
            </div>
            <!-- <button 
              class="btn btn-primary btn-sm"
              @click="$emit('new-consultation')"
            >
              <i class="fas fa-plus"></i> Nouvelle consultation
            </button> -->
            <router-link 
              :to="{ name: 'NewConsultation'}" 
              class="btn btn-primary btn-sm" 
              title="Nouvelle consultation"
            >
              <i class="fas fa-plus"></i> Nouvelle consultation
            </router-link>

          </div>
        </div>
  
        <!-- Liste des consultations -->
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Médecin</th>
                  <th>Diagnostic</th>
                  <th>Prescriptions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading" class="text-center">
                  <td colspan="6">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Chargement...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="filteredConsultations.length === 0">
                  <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                      <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                      <p>Aucune consultation trouvée</p>
                    </div>
                  </td>
                </tr>
                <tr 
                  v-for="consultation in filteredConsultations" 
                  :key="consultation.consultation_id"
                >
                  <td>{{ formatDate(consultation.date_consultation) }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="getConsultationTypeClass(consultation.type_consultation)"
                    >
                      {{ consultation.type_consultation }}
                    </span>
                  </td>
                  <td>Dr. {{ consultation.medecin.nom }}</td>
                  <td>{{ truncateText(consultation.diagnostic, 50) }}</td>
                  <td>{{ truncateText(consultation.prescriptions, 50) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="viewDetails(consultation)"
                        title="Voir les détails"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(consultation)"
                        title="Supprimer"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style="display:flex;float:left;">
          <router-link to="/dashboard" class="btn btn-outline-primary text-decoration-none">
                <i class="fas fa-arrow-left me-2"></i>
                Retour
          </router-link>
        </div>
      </div>
  
      <!-- Modal de confirmation de suppression -->
      <div class="modal fade" id="deleteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmer la suppression</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              Êtes-vous sûr de vouloir supprimer cette consultation ?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Annuler
              </button>
              <button 
                type="button" 
                class="btn btn-danger"
                @click="deleteConsultation"
                :disabled="deleting"
              >
                <span 
                  class="spinner-border spinner-border-sm me-1" 
                  v-if="deleting"
                ></span>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>


<script setup>

import { ref, computed, onMounted } from 'vue';
import { useConsultations } from '@/composables/useConsultations';

const props = defineProps({
    patientId: {
        type: [Number, String],
        required: true
    }
});

const emit = defineEmits(['new-consultation', 'consultation-selected']);

// États
const searchQuery = ref('');
const filterType = ref('');
const deleting = ref(false);
let deleteModal = null;
let selectedConsultation = null;

// Composables
const { 
    consultations,
    loading,
    fetchConsultations,
    deleteConsultation: removeConsultation 
} = useConsultations();

// Computed
const filteredConsultations = computed(() => {
    let filtered = [...consultations.value];
    
    if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        filtered = filtered.filter(c => 
            c.diagnostic?.toLowerCase().includes(search) ||
            c.prescriptions?.toLowerCase().includes(search) ||
            c.medecin.nom.toLowerCase().includes(search)
        );
    }

    if (filterType.value) {
        filtered = filtered.filter(c => c.type_consultation === filterType.value);
    }

    return filtered.sort((a, b) => 
        new Date(b.date_consultation) - new Date(a.date_consultation)
    );
});

// Méthodes
const confirmDelete = (consultation) => {
    selectedConsultation = consultation;
    deleteModal.show();
};

const deleteConsultation = async () => {
    try {
        deleting.value = true;
        await removeConsultation(selectedConsultation.consultation_id, props.patientId);
        deleteModal.hide();
        showSuccessMessage('Consultation supprimée avec succès');
    } catch (error) {
        showErrorMessage('Erreur lors de la suppression de la consultation');
    } finally {
        deleting.value = false;
    }
};

const viewDetails = (consultation) => {
    emit('consultation-selected', consultation);
};

// Helpers
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const truncateText = (text, length) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

const getConsultationTypeClass = (type) => {
    const classes = {
        routine: 'bg-success',
        urgence: 'bg-danger',
        suivi: 'bg-info',
        specialiste: 'bg-warning'
    };
    return classes[type] || 'bg-secondary';
};

const showSuccessMessage = (message) => {
    // Implémentez votre système de notification
    console.log(message);
};

const showErrorMessage = (message) => {
    // Implémentez votre système de notification
    console.error(message); 
};

// Lifecycle hooks
onMounted(async () => {
    deleteModal = new Modal(document.getElementById('deleteModal'));
    await fetchConsultations(props.patientId);
});
</script>