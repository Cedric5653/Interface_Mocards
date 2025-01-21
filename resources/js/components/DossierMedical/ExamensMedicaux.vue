<!-- ExamensMedicaux.vue -->
<template>
    <div class="examens-medicaux">
        <!-- En-tête -->
        <div class="header-actions mb-4">
            <div class="section-title">
                <h5 class="mb-0">Examens Médicaux</h5>
                <small class="text-muted">Résultats d'examens et analyses</small>
            </div>
            <button 
                class="btn btn-primary"
                @click="showAddModal"
                v-if="canEdit"
            >
                <i class="fas fa-flask me-2"></i>
                Nouvel Examen
            </button>
        </div>

        <!-- Filtres et recherche -->
        <div class="filters-section mb-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-search"></i>
                        </span>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="searchQuery"
                            placeholder="Rechercher un examen..."
                        >
                    </div>
                </div>
                <div class="col-md-4">
                    <select class="form-select" v-model="typeFilter">
                        <option value="">Tous les types</option>
                        <option value="LMB">Laboratoire</option>
                        <option value="radio">Radiologie</option>
                        <option value="echo">Échographie</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Liste des examens -->
        <div class="examens-grid">
            <div 
                v-for="examen in filteredExamens" 
                :key="examen.examen_id"
                class="examen-card"
            >
                <div class="card">
                    <div class="card-header">
                        <span :class="getTypeClass(examen.type_examen)">
                            {{ getTypeLabel(examen.type_examen) }}
                        </span>
                        <div class="date">
                            {{ formatDate(examen.date_examen) }}
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="examen-info">
                            <p class="mb-2">
                                <strong>Centre:</strong> {{ examen.centre_examen }}
                            </p>
                            <p class="mb-2">
                                <strong>Médecin:</strong> Dr. {{ examen.medecin?.nom }}
                            </p>
                            <p v-if="examen.resultat" class="mb-2">
                                <strong>Résultat:</strong> {{ examen.resultat }}
                            </p>
                        </div>

                        <!-- Documents associés -->
                        <div 
                            v-if="examen.document_id" 
                            class="documents-section mt-3"
                        >
                            <div class="document-item">
                                <i class="fas fa-file-medical me-2"></i>
                                <span>Rapport d'examen</span>
                                <button 
                                    class="btn btn-link btn-sm"
                                    @click="downloadDocument(examen.document_id)"
                                >
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer">
                        <button 
                            class="btn btn-outline-primary btn-sm"
                            @click="viewDetails(examen)"
                        >
                            <i class="fas fa-eye me-1"></i>
                            Voir détails
                        </button>
                        <div class="action-buttons" v-if="canEdit">
                            <button 
                                class="btn btn-outline-secondary btn-sm"
                                @click="editExamen(examen)"
                            >
                                <i class="fas fa-edit"></i>
                            </button>
                            <button 
                                class="btn btn-outline-danger btn-sm"
                                @click="confirmDelete(examen)"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Message si aucun examen -->
            <div v-if="filteredExamens.length === 0" class="no-data">
                <i class="fas fa-microscope fa-3x mb-3"></i>
                <p>Aucun examen trouvé</p>
            </div>
        </div>

                <!-- Modal d'ajout/modification -->
        <div class="modal fade" id="examenModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editMode ? 'Modifier l\'examen' : 'Nouvel examen' }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleSubmit">
                            <div class="row g-3">
                                <!-- Type d'examen -->
                                <div class="col-md-6">
                                    <label class="form-label required">Type d'examen</label>
                                    <select 
                                        class="form-select"
                                        v-model="formData.type_examen"
                                        required
                                    >
                                        <option value="LMB">Laboratoire</option>
                                        <option value="radio">Radiologie</option>
                                        <option value="echo">Échographie</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <!-- Date -->
                                <div class="col-md-6">
                                    <label class="form-label required">Date de l'examen</label>
                                    <input 
                                        type="date"
                                        class="form-control"
                                        v-model="formData.date_examen"
                                        required
                                    >
                                </div>

                                <!-- Centre -->
                                <div class="col-12">
                                    <label class="form-label required">Centre d'examen</label>
                                    <input 
                                        type="text"
                                        class="form-control"
                                        v-model="formData.centre_examen"
                                        required
                                    >
                                </div>

                                <!-- Résultats -->
                                <div class="col-12">
                                    <label class="form-label">Résultats</label>
                                    <textarea 
                                        class="form-control"
                                        v-model="formData.resultat"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <!-- Upload document -->
                                <div class="col-12">
                                    <label class="form-label">Document</label>
                                    <div class="input-group">
                                        <input 
                                            type="file"
                                            class="form-control"
                                            @change="handleFileChange"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        >
                                    </div>
                                    <small class="text-muted">
                                        Formats acceptés: PDF, JPG, PNG (Max: 10MB)
                                    </small>
                                </div>
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
                                    :disabled="saving"
                                >
                                    <span 
                                        class="spinner-border spinner-border-sm me-1" 
                                        v-if="saving"
                                    ></span>
                                    {{ editMode ? 'Modifier' : 'Ajouter' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de détails -->
        <div class="modal fade" id="detailsModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de l'examen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" v-if="selectedExamen">
                        <div class="examen-details">
                            <div class="info-section">
                                <h6>Informations générales</h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">Type:</span>
                                        <span>{{ getTypeLabel(selectedExamen.type_examen) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Date:</span>
                                        <span>{{ formatDate(selectedExamen.date_examen) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Centre:</span>
                                        <span>{{ selectedExamen.centre_examen }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Médecin:</span>
                                        <span>Dr. {{ selectedExamen.medecin?.nom }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="results-section mt-4">
                                <h6>Résultats</h6>
                                <div class="results-content">
                                    {{ selectedExamen.resultat || 'Aucun résultat enregistré' }}
                                </div>
                            </div>

                            <!-- Document -->
                            <div class="document-section mt-4" v-if="selectedExamen.document_id">
                                <h6>Document associé</h6>
                                <div class="document-preview">
                                    <!-- Prévisualisation du document si possible -->
                                </div>
                                <div class="document-actions">
                                    <button 
                                        class="btn btn-primary btn-sm"
                                        @click="downloadDocument(selectedExamen.document_id)"
                                    >
                                        <i class="fas fa-download me-1"></i>
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        </div>
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
    examens: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const searchQuery = ref('');
const typeFilter = ref('');
const editMode = ref(false);
const saving = ref(false);
const selectedExamen = ref(null);
const selectedFile = ref(null);

// Modals
let examenModal = null;
let detailsModal = null;

// Form Data
const formData = ref({
    type_examen: 'LMB',
    date_examen: '',
    centre_examen: '',
    resultat: '',
    document_id: null
});

// Composables
const { user } = useAuth();

// Computed
const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});

const filteredExamens = computed(() => {
    let filtered = [...props.examens];

    if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        filtered = filtered.filter(examen => 
            examen.centre_examen.toLowerCase().includes(search) ||
            examen.resultat?.toLowerCase().includes(search) ||
            examen.medecin?.nom.toLowerCase().includes(search)
        );
    }

    if (typeFilter.value) {
        filtered = filtered.filter(examen => 
            examen.type_examen === typeFilter.value
        );
    }

    return filtered.sort((a, b) => 
        new Date(b.date_examen) - new Date(a.date_examen)
    );
});

// Méthodes
const showAddModal = () => {
    editMode.value = false;
    resetForm();
    examenModal.show();
};

const editExamen = (examen) => {
    editMode.value = true;
    selectedExamen.value = examen;
    formData.value = { ...examen };
    examenModal.show();
};

const viewDetails = (examen) => {
    selectedExamen.value = examen;
    detailsModal.show();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showErrorMessage('Le fichier est trop volumineux (max: 10MB)');
            event.target.value = '';
            return;
        }
        selectedFile.value = file;
    }
};

const handleSubmit = async () => {
    try {
        saving.value = true;

        const formDataToSend = new FormData();
        Object.keys(formData.value).forEach(key => {
            formDataToSend.append(key, formData.value[key]);
        });

        if (selectedFile.value) {
            formDataToSend.append('document', selectedFile.value);
        }

        let response;
        if (editMode.value) {
            response = await api.put(
                `/v1/medical/examinations/${selectedExamen.value.examen_id}`, 
                formDataToSend
            );
        } else {
            response = await api.post('/v1/medical/examinations', formDataToSend);
        }

        examenModal.hide();
        emit('refresh');
        showSuccessMessage(
            editMode.value ? 'Examen modifié avec succès' : 'Examen ajouté avec succès'
        );
        resetForm();

    } catch (error) {
        showErrorMessage("Une erreur est survenue");
        console.error('Erreur:', error);
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (examen) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
        try {
            await api.delete(`/v1/medical/examinations/${examen.examen_id}`);
            emit('refresh');
            showSuccessMessage('Examen supprimé avec succès');
        } catch (error) {
            showErrorMessage("Erreur lors de la suppression");
            console.error('Erreur:', error);
        }
    }
};

const downloadDocument = async (documentId) => {
    try {
        const response = await api.get(`/v1/documents/${documentId}`, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `examen_${documentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showErrorMessage("Erreur lors du téléchargement");
        console.error('Erreur:', error);
    }
};

// Helpers
const resetForm = () => {
    formData.value = {
        type_examen: 'LMB',
        date_examen: '',
        centre_examen: '',
        resultat: '',
        document_id: null
    };
    selectedFile.value = null;
    selectedExamen.value = null;
};

// ... suite du script

const getTypeLabel = (type) => {
    const types = {
        'LMB': 'Laboratoire',
        'radio': 'Radiologie',
        'echo': 'Échographie',
        'autre': 'Autre'
    };
    return types[type] || type;
};

const getTypeClass = (type) => {
    const classes = {
        'LMB': 'type-lmb',
        'radio': 'type-radio',
        'echo': 'type-echo',
        'autre': 'type-autre'
    };
    return `type-badge ${classes[type] || 'type-autre'}`;
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
    examenModal = new Modal(document.getElementById('examenModal'));
    detailsModal = new Modal(document.getElementById('detailsModal'));
});

</script>

<style scoped>
.examens-medicaux {
    padding: 1rem;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.examens-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.examen-card {
    transition: transform 0.2s ease-in-out;
}

.examen-card:hover {
    transform: translateY(-5px);
}

.type-badge {
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.type-lmb {
    background-color: #e3f2fd;
    color: #1976d2;
}

.type-radio {
    background-color: #fce4ec;
    color: #c2185b;
}

.type-echo {
    background-color: #f3e5f5;
    color: #7b1fa2;
}

.type-autre {
    background-color: #f5f5f5;
    color: #616161;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.examen-info {
    font-size: 0.95rem;
}

.documents-section {
    border-top: 1px solid #e0e0e0;
    padding-top: 1rem;
}

.document-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f5f5f5;
    border-radius: 0.5rem;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #fafafa;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.no-data {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #9e9e9e;
}

.info-grid {
    display: grid;
    gap: 1rem;
}

.info-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
}

.label {
    font-weight: 600;
    color: #616161;
}

.results-content {
    background: #fafafa;
    padding: 1rem;
    border-radius: 0.5rem;
    white-space: pre-wrap;
}

.document-preview {
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .examens-grid {
        grid-template-columns: 1fr;
    }

    .header-actions {
        flex-direction: column;
        gap: 1rem;
    }

    .card-footer {
        flex-direction: column;
        gap: 1rem;
    }

    .action-buttons {
        width: 100%;
        justify-content: center;
    }
}
</style>