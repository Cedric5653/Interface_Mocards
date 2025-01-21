<template>
    <div class="traitements">
        <!-- En-tête avec filtre et recherche -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-pills me-2"></i>
                    Traitements en cours
                </h5>
                <button 
                    class="btn btn-light btn-sm"
                    @click="showAddModal"
                    v-if="canAddTreatment"
                >
                    <i class="fas fa-plus me-1"></i>
                    Nouveau traitement
                </button>
            </div>

            <div class="card-body">
                <!-- Filtres -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-search"></i>
                            </span>
                            <input 
                                type="text"
                                class="form-control"
                                v-model="searchQuery"
                                placeholder="Rechercher un traitement..."
                            >
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" v-model="filterStatus">
                            <option value="">Tous les statuts</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                            <option value="suspendu">Suspendu</option>
                        </select>
                    </div>
                </div>

                <!-- Liste des traitements -->
                <div class="treatments-grid">
                    <div 
                        v-for="traitement in filteredTraitements" 
                        :key="traitement.id"
                        class="treatment-card"
                        :class="getStatusClass(traitement.status)"
                    >
                        <div class="treatment-header">
                            <h6 class="mb-0">{{ traitement.medicament }}</h6>
                            <span :class="getStatusBadgeClass(traitement.status)">
                                {{ getStatusLabel(traitement.status) }}
                            </span>
                        </div>

                        <div class="treatment-body">
                            <div class="treatment-info">
                                <i class="fas fa-clock me-2"></i>
                                {{ traitement.posologie }}
                            </div>
                            <div class="treatment-info">
                                <i class="fas fa-calendar me-2"></i>
                                {{ formatDateRange(traitement.date_debut, traitement.date_fin) }}
                            </div>
                            <div class="treatment-info" v-if="traitement.notes">
                                <i class="fas fa-sticky-note me-2"></i>
                                {{ traitement.notes }}
                            </div>

                            <!-- Barre de progression -->
                            <div class="progress mt-3" style="height: 8px;">
                                <div 
                                    class="progress-bar"
                                    :class="getProgressBarClass(traitement)"
                                    :style="{ width: calculateProgress(traitement) + '%' }"
                                >
                                </div>
                            </div>
                        </div>

                        <div class="treatment-footer">
                            <div class="prescribed-by">
                                <small class="text-muted">
                                    <i class="fas fa-user-md me-1"></i>
                                    Dr. {{ traitement.medecin?.nom }}
                                </small>
                            </div>
                            <div class="treatment-actions">
                                <button 
                                    class="btn btn-sm btn-outline-primary"
                                    @click="editTreatment(traitement)"
                                    title="Modifier"
                                >
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button 
                                    class="btn btn-sm btn-outline-danger"
                                    @click="confirmDelete(traitement)"
                                    title="Supprimer"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Message si aucun traitement -->
                    <div v-if="filteredTraitements.length === 0" class="text-center py-5">
                        <i class="fas fa-prescription-bottle fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Aucun traitement trouvé</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal d'ajout/modification -->
        <div class="modal fade" id="treatmentModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editMode ? 'Modifier le traitement' : 'Nouveau traitement' }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveTreatment">
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

                            <div class="text-end">
                                <button 
                                    type="button" 
                                    class="btn btn-secondary me-2"
                                    data-bs-dismiss="modal"
                                >
                                    Annuler
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    {{ editMode ? 'Modifier' : 'Ajouter' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de confirmation de suppression -->
        <div class="modal fade" id="deleteModal">
            <!-- ... Modal de suppression ... -->
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { useAuth } from '@/composables/useAuth';
import { useCarnetNumerique } from '@/composables/useCarnetNumerique';

const props = defineProps({
    patientId: {
        type: String,
        required: true
    },
    traitements: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const searchQuery = ref('');
const filterStatus = ref('');
const editMode = ref(false);
const selectedTreatment = ref(null);
let treatmentModal = null;
let deleteModal = null;

// Données du formulaire
const formData = ref({
    medicament: '',
    posologie: '',
    date_debut: '',
    date_fin: '',
    notes: '',
    status: 'en_cours'
});

// Composables
const { user } = useAuth();
const { loading, createCarnetNumerique, updateCarnetNumerique } = useCarnetNumerique();

// Computed
const canAddTreatment = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});

const filteredTraitements = computed(() => {
    let filtered = [...props.traitements];

    if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        filtered = filtered.filter(t => 
            t.medicament.toLowerCase().includes(search) ||
            t.notes?.toLowerCase().includes(search)
        );
    }

    if (filterStatus.value) {
        filtered = filtered.filter(t => t.status === filterStatus.value);
    }

    return filtered.sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut));
});

// Méthodes
const showAddModal = () => {
    editMode.value = false;
    resetForm();
    treatmentModal.show();
};

const editTreatment = (treatment) => {
    editMode.value = true;
    selectedTreatment.value = treatment;
    formData.value = { ...treatment };
    treatmentModal.show();
};

const saveTreatment = async () => {
    try {
        const treatmentData = {
            type_enregistrement: 'traitement',
            description: `Traitement: ${formData.value.medicament} - ${formData.value.posologie}`,
            patient_id: props.patientId,
            ...formData.value
        };

        if (editMode.value) {
            await updateCarnetNumerique(selectedTreatment.value.id, treatmentData);
        } else {
            await createCarnetNumerique(treatmentData);
        }

        treatmentModal.hide();
        resetForm();
        emit('refresh');
        showSuccessMessage(editMode.value ? 'Traitement modifié' : 'Traitement ajouté');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showErrorMessage("Une erreur est survenue lors de la sauvegarde");
    }
};

const confirmDelete = (treatment) => {
    selectedTreatment.value = treatment;
    deleteModal.show();
};

const deleteTreatment = async () => {
    try {
        await deleteCarnetNumerique(selectedTreatment.value.id);
        deleteModal.hide();
        emit('refresh');
        showSuccessMessage('Traitement supprimé');
    } catch (error) {
        showErrorMessage("Erreur lors de la suppression");
    }
};

// Helpers
const resetForm = () => {
    formData.value = {
        medicament: '',
        posologie: '',
        date_debut: '',
        date_fin: '',
        notes: '',
        status: 'en_cours'
    };
};

const calculateProgress = (treatment) => {
    const start = new Date(treatment.date_debut);
    const end = new Date(treatment.date_fin);
    const today = new Date();

    if (today < start) return 0;
    if (today > end) return 100;

    const total = end - start;
    const current = today - start;
    return Math.round((current / total) * 100);
};

const formatDateRange = (start, end) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
    return `Du ${formatDate(start)} au ${formatDate(end)}`;
};

const getStatusClass = (status) => {
    return {
        'treatment-active': status === 'en_cours',
        'treatment-completed': status === 'termine',
        'treatment-suspended': status === 'suspendu'
    };
};

const getStatusBadgeClass = (status) => {
    const classes = {
        'en_cours': 'badge bg-success',
        'termine': 'badge bg-secondary',
        'suspendu': 'badge bg-warning'
    };
    return classes[status] || 'badge bg-secondary';
};

const getProgressBarClass = (treatment) => {
    const progress = calculateProgress(treatment);
    if (treatment.status === 'suspendu') return 'bg-warning';
    if (progress === 100) return 'bg-success';
    return 'bg-primary';
};

const getStatusLabel = (status) => {
    const labels = {
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'suspendu': 'Suspendu'
    };
    return labels[status] || status;
};

const showSuccessMessage = (message) => {
    // Implémenter votre système de notification
    console.log('Success:', message);
};

const showErrorMessage = (message) => {
    // Implémenter votre système de notification
    console.error('Error:', message);
};

// Lifecycle Hooks
onMounted(() => {
    treatmentModal = new Modal(document.getElementById('treatmentModal'));
    deleteModal = new Modal(document.getElementById('deleteModal'));
});
</script>

<style scoped>
.treatments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
}

.treatment-card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.3s ease;
}

.treatment-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.treatment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.treatment-body {
    margin-bottom: 1rem;
}

.treatment-info {
    margin-bottom: 0.5rem;
    color: #6c757d;
}

.treatment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
}

.treatment-actions {
    display: flex;
    gap: 0.5rem;
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

@media (max-width: 768px) {
    .treatments-grid {
        grid-template-columns: 1fr;
    }
}
</style>