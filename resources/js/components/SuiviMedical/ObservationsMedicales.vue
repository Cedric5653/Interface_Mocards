<!-- ObservationsMedicales.vue -->
<template>
    <div class="observations-medicales">
      <!-- Timeline des observations -->
      <div class="timeline">
        <div v-for="observation in sortedObservations" 
             :key="observation.id"
             class="timeline-item">
          <div class="timeline-marker" :class="getTypeClass(observation.type)">
            <i :class="getTypeIcon(observation.type)"></i>
          </div>
  
          <div class="timeline-content">
            <div class="observation-card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ observation.titre }}</h6>
                    <small class="text-muted">
                      {{ formatDate(observation.date_observation) }}
                    </small>
                  </div>
                  <span :class="getTypeBadge(observation.type)">
                    {{ getTypeLabel(observation.type) }}
                  </span>
                </div>
              </div>
  
              <div class="card-body">
                <p class="observation-text">{{ observation.description }}</p>
                
                <!-- Résultats si disponibles -->
                <div v-if="observation.resultats" class="resultats-section">
                  <h6 class="mb-2">Résultats</h6>
                  <div class="resultats-grid">
                    <div v-for="(resultat, key) in observation.resultats" 
                         :key="key"
                         class="resultat-item">
                      <span class="resultat-label">{{ key }}:</span>
                      <span class="resultat-value">{{ resultat }}</span>
                    </div>
                  </div>
                </div>
  
                <!-- Documents associés -->
                <div v-if="observation.documents?.length" class="documents-section">
                  <h6 class="mb-2">Documents associés</h6>
                  <div class="documents-list">
                    <div v-for="doc in observation.documents" 
                         :key="doc.id"
                         class="document-item">
                      <i :class="getDocumentIcon(doc.type)"></i>
                      <span>{{ doc.nom }}</span>
                      <button 
                        class="btn btn-link btn-sm"
                        @click="downloadDocument(doc)"
                      >
                        <i class="fas fa-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
  
                <!-- Médecin -->
                <div class="medecin-info mt-3">
                  <small class="text-muted">
                    <i class="fas fa-user-md me-1"></i>
                    Par: Dr. {{ observation.medecin?.nom }}
                  </small>
                </div>
              </div>
  
              <!-- Actions -->
              <div class="card-footer" v-if="canEdit">
                <div class="btn-group">
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="editObservation(observation)"
                  >
                    <i class="fas fa-edit me-1"></i>
                    Modifier
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(observation)"
                  >
                    <i class="fas fa-trash me-1"></i>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Message si aucune observation -->
        <div v-if="!observations.length" class="text-center py-5">
          <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
          <p class="text-muted">Aucune observation médicale enregistrée</p>
        </div>
      </div>
  
      <!-- Modal d'ajout/modification -->
      <div class="modal fade" id="observationModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editMode ? 'Modifier l\'observation' : 'Nouvelle observation' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label required">Titre</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="formData.titre"
                    required
                  >
                </div>
  
                <div class="mb-3">
                  <label class="form-label required">Type</label>
                  <select 
                    class="form-select"
                    v-model="formData.type"
                    required
                  >
                    <option value="examen">Examen</option>
                    <option value="consultation">Consultation</option>
                    <option value="suivi">Suivi</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
  
                <div class="mb-3">
                  <label class="form-label required">Description</label>
                  <textarea 
                    class="form-control"
                    v-model="formData.description"
                    rows="4"
                    required
                  ></textarea>
                </div>
  
                <!-- Upload documents -->
                <div class="mb-3">
                  <label class="form-label">Documents</label>
                  <input 
                    type="file"
                    class="form-control"
                    @change="handleFileUpload"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                  >
                  <small class="text-muted">
                    Formats acceptés: PDF, JPG, PNG (Max: 10MB par fichier)
                  </small>
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
                    <span 
                      class="spinner-border spinner-border-sm me-1" 
                      v-if="loading"
                    ></span>
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
  
  const props = defineProps({
    observations: {
      type: Array,
      required: true
    }
  });
  
  const emit = defineEmits(['refresh']);
  
  // États
  const editMode = ref(false);
  const loading = ref(false);
  const selectedObservation = ref(null);
  const observationModal = ref(null);
  const selectedFiles = ref([]);
  
  // Form Data
  const formData = ref({
    titre: '',
    type: 'consultation',
    description: '',
    resultats: {},
    documents: []
  });
  
  // Composables
  const { user } = useAuth();
  
  // Computed
  const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
      p.permission_name === 'Modifier_Suivi_Medical'
    );
  });
  
  const sortedObservations = computed(() => {
    return [...props.observations].sort((a, b) => 
      new Date(b.date_observation) - new Date(a.date_observation)
    );
  });
  
  // Méthodes
  const getTypeClass = (type) => ({
    'marker-examen': type === 'examen',
    'marker-consultation': type === 'consultation',
    'marker-suivi': type === 'suivi',
    'marker-autre': type === 'autre'
  });
  
  const getTypeIcon = (type) => {
    const icons = {
      'examen': 'fas fa-microscope',
      'consultation': 'fas fa-stethoscope',
      'suivi': 'fas fa-chart-line',
      'autre': 'fas fa-notes-medical'
    };
    return icons[type] || 'fas fa-notes-medical';
  };
  
  const getTypeBadge = (type) => {
    const badges = {
      'examen': 'badge bg-info',
      'consultation': 'badge bg-primary',
      'suivi': 'badge bg-success',
      'autre': 'badge bg-secondary'
    };
    return badges[type] || 'badge bg-secondary';
  };
  
  const getTypeLabel = (type) => {
    const labels = {
      'examen': 'Examen',
      'consultation': 'Consultation',
      'suivi': 'Suivi',
      'autre': 'Autre'
    };
    return labels[type] || 'Autre';
  };
  
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    selectedFiles.value = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (selectedFiles.value.length !== files.length) {
      // Certains fichiers ont été ignorés car trop volumineux
      showWarningMessage('Certains fichiers dépassent la limite de 10MB');
    }
  };
  

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDocumentIcon = (type) => {
  const icons = {
    'pdf': 'fas fa-file-pdf',
    'image': 'fas fa-file-image',
    'texte': 'fas fa-file-alt'
  };
  return icons[type] || 'fas fa-file';
};

const editObservation = (observation) => {
  editMode.value = true;
  selectedObservation.value = observation;
  formData.value = {
    ...observation,
    resultats: observation.resultats || {}
  };
  observationModal.value.show();
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    // Création du FormData pour l'upload
    const formDataToSend = new FormData();
    Object.keys(formData.value).forEach(key => {
      if (key === 'resultats') {
        formDataToSend.append(key, JSON.stringify(formData.value[key]));
      } else {
        formDataToSend.append(key, formData.value[key]);
      }
    });

    // Ajout des fichiers
    selectedFiles.value.forEach(file => {
      formDataToSend.append('documents[]', file);
    });

    if (editMode.value) {
      await api.put(
        `/v1/medical/observations/${selectedObservation.value.id}`, 
        formDataToSend
      );
    } else {
      await api.post('/v1/medical/observations', formDataToSend);
    }

    observationModal.value.hide();
    emit('refresh');
    showSuccessMessage(
      editMode.value ? 'Observation modifiée' : 'Observation ajoutée'
    );
    resetForm();

  } catch (error) {
    console.error('Erreur:', error);
    showErrorMessage("Une erreur est survenue");
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async (observation) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette observation ?')) {
    try {
      await api.delete(`/v1/medical/observations/${observation.id}`);
      emit('refresh');
      showSuccessMessage('Observation supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      showErrorMessage("Erreur lors de la suppression");
    }
  }
};

const downloadDocument = async (doc) => {
  try {
    const response = await api.get(`/v1/documents/${doc.id}/download`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.nom;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Erreur:', error);
    showErrorMessage("Erreur lors du téléchargement");
  }
};

const resetForm = () => {
  formData.value = {
    titre: '',
    type: 'consultation',
    description: '',
    resultats: {},
    documents: []
  };
  selectedFiles.value = [];
  editMode.value = false;
  selectedObservation.value = null;
};

const showSuccessMessage = (message) => {
  // Implémenter votre système de notification
  console.log('Success:', message);
};

const showErrorMessage = (message) => {
  // Implémenter votre système de notification
  console.error('Error:', message);
};

const showWarningMessage = (message) => {
  // Implémenter votre système de notification
  console.warn('Warning:', message);
};

// Lifecycle
onMounted(() => {
  observationModal.value = new Modal(document.getElementById('observationModal'));
});
</script>

<style scoped>
.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
  padding-left: 50px;
}

.timeline-marker {
  position: absolute;
  left: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-marker.marker-examen { background: #0dcaf0; }
.timeline-marker.marker-consultation { background: #0d6efd; }
.timeline-marker.marker-suivi { background: #198754; }
.timeline-marker.marker-autre { background: #6c757d; }

.timeline-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.observation-text {
  white-space: pre-wrap;
}

.resultats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.resultat-item {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.resultat-label {
  font-weight: 500;
  color: #6c757d;
}

.documents-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.required::after {
  content: '*';
  color: red;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .timeline-item {
    padding-left: 30px;
  }

  .timeline-marker {
    width: 24px;
    height: 24px;
    font-size: 0.875rem;
  }

  .resultats-grid {
    grid-template-columns: 1fr;
  }
}
</style>