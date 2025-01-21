<template>
    <div class="antecedents-medicaux">
        <!-- En-tête avec bouton d'ajout -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="section-title">
                <h5 class="mb-0">Antécédents Médicaux</h5>
                <small class="text-muted">Historique médical complet du patient</small>
            </div>
            <button 
                class="btn btn-primary"
                @click="showAddModal"
                v-if="canEdit"
            >
                <i class="fas fa-plus me-2"></i>
                Ajouter un antécédent
            </button>
        </div>

        <!-- Filtres -->
        <div class="filters-section mb-4">
            <div class="row g-3">
                <div class="col-md-4">
                    <select 
                        class="form-select"
                        v-model="selectedType"
                    >
                        <option value="">Tous les types</option>
                        <option value="medical">Médical</option>
                        <option value="chirurgical">Chirurgical</option>
                        <option value="familial">Familial</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="fas fa-calendar"></i>
                        </span>
                        <input 
                            type="date"
                            class="form-control"
                            v-model="dateFilter"
                        >
                    </div>
                </div>
            </div>
        </div>

        <!-- Liste des antécédents -->
        <div class="antecedents-list">
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
            </div>

            <div 
                v-else-if="filteredAntecedents.length === 0" 
                class="text-center py-5"
            >
                <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <p>Aucun antécédent trouvé</p>
            </div>

            <div v-else class="antecedents-grid">
                <div 
                    v-for="antecedent in filteredAntecedents"
                    :key="antecedent.antecedent_id"
                    class="antecedent-card"
                    :class="getTypeClass(antecedent.type_antecedent)"
                >
                    <div class="card-header">
                        <span class="type-badge" :class="getTypeClass(antecedent.type_antecedent)">
                            {{ getTypeLabel(antecedent.type_antecedent) }}
                        </span>
                        <div class="card-actions">
                            <button 
                                class="btn btn-link btn-sm"
                                @click="editAntecedent(antecedent)"
                                v-if="canEdit"
                            >
                                <i class="fas fa-edit"></i>
                            </button>
                            <button 
                                class="btn btn-link btn-sm text-danger"
                                @click="confirmDelete(antecedent)"
                                v-if="canEdit"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="date-info mb-2">
                            <i class="fas fa-calendar-alt me-2"></i>
                            {{ formatDate(antecedent.date_evenement) }}
                        </div>
                        <p class="description">{{ antecedent.description }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal d'ajout/modification -->
        <div class="modal fade" id="antecedentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editMode ? 'Modifier l\'antécédent' : 'Ajouter un antécédent' }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleSubmit">
                            <div class="mb-3">
                                <label class="form-label required">Type d'antécédent</label>
                                <select 
                                    class="form-select"
                                    v-model="formData.type_antecedent"
                                    required
                                >
                                    <option value="medical">Médical</option>
                                    <option value="chirurgical">Chirurgical</option>
                                    <option value="familial">Familial</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label required">Date</label>
                                <input 
                                    type="date"
                                    class="form-control"
                                    v-model="formData.date_evenement"
                                    required
                                >
                            </div>

                            <div class="mb-3">
                                <label class="form-label required">Description</label>
                                <textarea 
                                    class="form-control"
                                    v-model="formData.description"
                                    rows="3"
                                    required
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
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Modal } from 'bootstrap';
import { useAuth } from '@/composables/useAuth';

const props = defineProps({
    antecedents: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const selectedType = ref('');
const dateFilter = ref('');
const editMode = ref(false);
const saving = ref(false);
const antecedentModal = ref(null);
const selectedAntecedent = ref(null);

// Form Data
const formData = ref({
    type_antecedent: 'medical',
    date_evenement: '',
    description: ''
});

// Composables
const { user } = useAuth();

// Computed
const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});

const filteredAntecedents = computed(() => {
    let filtered = [...props.antecedents];

    if (selectedType.value) {
        filtered = filtered.filter(a => a.type_antecedent === selectedType.value);
    }

    if (dateFilter.value) {
        filtered = filtered.filter(a => a.date_evenement >= dateFilter.value);
    }

    return filtered.sort((a, b) => new Date(b.date_evenement) - new Date(a.date_evenement));
});

// Méthodes
const showAddModal = () => {
    editMode.value = false;
    resetForm();
    antecedentModal.value.show();
};

const editAntecedent = (antecedent) => {
    editMode.value = true;
    selectedAntecedent.value = antecedent;
    formData.value = { ...antecedent };
    antecedentModal.value.show();
};

const handleSubmit = async () => {
    try {
        saving.value = true;
        const data = {
            ...formData.value,
            patient_id: props.patientId
        };

        if (editMode.value) {
            await api.put(`/v1/medical/antecedents/${selectedAntecedent.value.antecedent_id}`, data);
        } else {
            await api.post('/v1/medical/antecedents', data);
        }

        antecedentModal.value.hide();
        emit('refresh');
        showSuccessMessage(editMode.value ? 'Antécédent modifié' : 'Antécédent ajouté');
        resetForm();

    } catch (error) {
        showErrorMessage("Une erreur est survenue");
        console.error('Erreur:', error);
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (antecedent) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet antécédent ?')) {
        try {
            await api.delete(`/v1/medical/antecedents/${antecedent.antecedent_id}`);
            emit('refresh');
            showSuccessMessage('Antécédent supprimé');
        } catch (error) {
            showErrorMessage("Erreur lors de la suppression");
            console.error('Erreur:', error);
        }
    }
};

const resetForm = () => {
    formData.value = {
        type_antecedent: 'medical',
        date_evenement: '',
        description: ''
    };
    selectedAntecedent.value = null;
};

// Helpers
const getTypeLabel = (type) => {
    const labels = {
        'medical': 'Médical',
        'chirurgical': 'Chirurgical',
        'familial': 'Familial'
    };
    return labels[type] || type;
};

const getTypeClass = (type) => {
    const classes = {
        'medical': 'type-medical',
        'chirurgical': 'type-chirurgical',
        'familial': 'type-familial'
    };
    return classes[type];
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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
    antecedentModal.value = new Modal(document.getElementById('antecedentModal'));
});
</script>

<style scoped>
.antecedents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.antecedent-card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.antecedent-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.type-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
}

.type-medical {
    background: #e3f2fd;
    color: #0d6efd;
}

.type-chirurgical {
    background: #fff3cd;
    color: #ffc107;
}

.type-familial {
    background: #d1e7dd;
    color: #198754;
}

.card-actions {
    opacity: 0;
    transition: opacity 0.2s;
}

.antecedent-card:hover .card-actions {
    opacity: 1;
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

@media (max-width: 768px) {
    .antecedents-grid {
        grid-template-columns: 1fr;
    }

    .card-actions {
        opacity: 1;
    }
}
</style>