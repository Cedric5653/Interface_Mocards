<template>
    <div class="vaccinations">
        <!-- En-tête -->
        <div class="header-section mb-4">
            <div class="title-area">
                <h5 class="mb-0">
                    <i class="fas fa-syringe me-2"></i>
                    Carnet de Vaccination
                </h5>
                <small class="text-muted">Suivi des vaccinations et rappels</small>
            </div>
            <div class="actions-area">
                <button 
                    class="btn btn-outline-warning me-2"
                    @click="showRappels"
                >
                    <i class="fas fa-bell me-1"></i>
                    Rappels
                    <span v-if="rappelsCount" class="badge bg-danger ms-2">
                        {{ rappelsCount }}
                    </span>
                </button>
                <button 
                    class="btn btn-primary"
                    @click="showAddModal"
                    v-if="canEdit"
                >
                    <i class="fas fa-plus me-2"></i>
                    Nouvelle vaccination
                </button>
            </div>
        </div>

        <!-- Tableau des vaccinations -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Vaccin</th>
                                <th>Date</th>
                                <th>Rappel prévu</th>
                                <th>Centre</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="vaccination in vaccinations" :key="vaccination.vaccination_id">
                                <td>{{ vaccination.type_vaccin }}</td>
                                <td>{{ formatDate(vaccination.date_vaccination) }}</td>
                                <td>
                                    <span 
                                        :class="getRappelClass(vaccination.rappel_prevu)"
                                    >
                                        {{ formatDate(vaccination.rappel_prevu) }}
                                    </span>
                                </td>
                                <td>{{ vaccination.centre_vaccination }}</td>
                                <td>
                                    <span 
                                        class="badge"
                                        :class="getStatusClass(vaccination)"
                                    >
                                        {{ getStatusLabel(vaccination) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-primary"
                                            @click="viewDetails(vaccination)"
                                            title="Voir détails"
                                        >
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-success"
                                            @click="editVaccination(vaccination)"
                                            title="Modifier"
                                            v-if="canEdit"
                                        >
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-danger"
                                            @click="confirmDelete(vaccination)"
                                            title="Supprimer"
                                            v-if="canEdit"
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
        </div>

        <!-- Modal d'ajout/modification -->
        <div class="modal fade" id="vaccinationModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editMode ? 'Modifier la vaccination' : 'Nouvelle vaccination' }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleSubmit">
                            <!-- Type de vaccin -->
                            <div class="mb-3">
                                <label class="form-label required">Type de vaccin</label>
                                <input 
                                    type="text"
                                    class="form-control"
                                    v-model="formData.type_vaccin"
                                    required
                                    list="vaccins-list"
                                >
                                <datalist id="vaccins-list">
                                    <option v-for="vaccin in vaccinsDisponibles" 
                                           :key="vaccin" 
                                           :value="vaccin"></option>
                                </datalist>
                            </div>

                            <!-- Date de vaccination -->
                            <div class="mb-3">
                                <label class="form-label required">Date de vaccination</label>
                                <input 
                                    type="date"
                                    class="form-control"
                                    v-model="formData.date_vaccination"
                                    required
                                >
                            </div>

                            <!-- Centre de vaccination -->
                            <div class="mb-3">
                                <label class="form-label required">Centre de vaccination</label>
                                <input 
                                    type="text"
                                    class="form-control"
                                    v-model="formData.centre_vaccination"
                                    required
                                >
                            </div>

                            <!-- Date de rappel -->
                            <div class="mb-3">
                                <label class="form-label">Date de rappel</label>
                                <input 
                                    type="date"
                                    class="form-control"
                                    v-model="formData.rappel_prevu"
                                >
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
                                    {{ editMode ? 'Modifier' : 'Ajouter' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de rappels -->
        <div class="modal fade" id="rappelsModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title">
                            <i class="fas fa-bell me-2"></i>
                            Rappels de vaccination
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="rappels-list">
                            <!-- Rappels à venir -->
                            <div class="rappels-section">
                                <h6 class="section-title text-danger">
                                    <i class="fas fa-exclamation-circle me-2"></i>
                                    Rappels urgents
                                </h6>
                                <div class="list-group mb-4">
                                    <div 
                                        v-for="rappel in rappelsUrgents" 
                                        :key="rappel.vaccination_id"
                                        class="list-group-item list-group-item-danger"
                                    >
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="mb-1">{{ rappel.type_vaccin }}</h6>
                                                <p class="mb-0 small">
                                                    Rappel prévu le: {{ formatDate(rappel.rappel_prevu) }}
                                                </p>
                                            </div>
                                            <button 
                                                class="btn btn-sm btn-outline-danger"
                                                @click="planifierRappel(rappel)"
                                            >
                                                Planifier
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Prochains rappels -->
                            <div class="rappels-section">
                                <h6 class="section-title text-warning">
                                    <i class="fas fa-clock me-2"></i>
                                    Prochains rappels
                                </h6>
                                <div class="list-group">
                                    <div 
                                        v-for="rappel in prochainsRappels" 
                                        :key="rappel.vaccination_id"
                                        class="list-group-item list-group-item-warning"
                                    >
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 class="mb-1">{{ rappel.type_vaccin }}</h6>
                                                <p class="mb-0 small">
                                                    Rappel prévu le: {{ formatDate(rappel.rappel_prevu) }}
                                                </p>
                                            </div>
                                            <span class="badge bg-warning">
                                                Dans {{ getDaysUntilRappel(rappel.rappel_prevu) }} jours
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Fermer
                        </button>
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
import { differenceInDays, parseISO, isAfter } from 'date-fns';

const props = defineProps({
    vaccinations: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const editMode = ref(false);
const saving = ref(false);
const selectedVaccination = ref(null);
let vaccinationModal = null;
let rappelsModal = null;

// Liste prédéfinie des vaccins
const vaccinsDisponibles = [
    'BCG',
    'DTP (Diphtérie, Tétanos, Poliomyélite)',
    'Coqueluche',
    'Haemophilus influenzae b',
    'Hépatite B',
    'Pneumocoque',
    'Méningocoque C',
    'ROR (Rougeole, Oreillons, Rubéole)',
    'HPV (Papillomavirus)',
    'Grippe saisonnière'
];

// Form Data
const formData = ref({
    type_vaccin: '',
    date_vaccination: '',
    centre_vaccination: '',
    rappel_prevu: ''
});

// Composables
const { user } = useAuth();

// Computed
const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});

const rappelsUrgents = computed(() => {
    return props.vaccinations.filter(v => {
        if (!v.rappel_prevu) return false;
        const today = new Date();
        const rappelDate = parseISO(v.rappel_prevu);
        return isAfter(today, rappelDate);
    });
});

const prochainsRappels = computed(() => {
    return props.vaccinations
        .filter(v => {
            if (!v.rappel_prevu) return false;
            const today = new Date();
            const rappelDate = parseISO(v.rappel_prevu);
            return !isAfter(today, rappelDate);
        })
        .sort((a, b) => parseISO(a.rappel_prevu) - parseISO(b.rappel_prevu));
});

const rappelsCount = computed(() => {
    return rappelsUrgents.value.length;
});

// Méthodes
const showAddModal = () => {
    editMode.value = false;
    resetForm();
    vaccinationModal.show();
};

const editVaccination = (vaccination) => {
    editMode.value = true;
    selectedVaccination.value = vaccination;
    formData.value = { ...vaccination };
    vaccinationModal.show();
};

const showRappels = () => {
    rappelsModal.show();
};

const handleSubmit = async () => {
    try {
        saving.value = true;
        
        if (editMode.value) {
            await api.put(
                `/v1/vaccinations/${selectedVaccination.value.vaccination_id}`, 
                formData.value
            );
        } else {
            await api.post('/v1/vaccinations', {
                ...formData.value,
                patient_id: props.patientId
            });
        }

        vaccinationModal.hide();
        emit('refresh');
        showSuccessMessage(
            editMode.value ? 'Vaccination modifiée' : 'Vaccination ajoutée'
        );
        resetForm();

    } catch (error) {
        showErrorMessage("Une erreur est survenue");
        console.error('Erreur:', error);
    } finally {
        saving.value = false;
    }
};

const confirmDelete = async (vaccination) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vaccination ?')) {
        try {
            await api.delete(`/v1/vaccinations/${vaccination.vaccination_id}`);
            emit('refresh');
            showSuccessMessage('Vaccination supprimée avec succès');
        } catch (error) {
            showErrorMessage("Erreur lors de la suppression");
        }
    }
};

// ... suite du script

// Helpers
const resetForm = () => {
    formData.value = {
        type_vaccin: '',
        date_vaccination: '',
        centre_vaccination: '',
        rappel_prevu: ''
    };
    selectedVaccination.value = null;
};

const formatDate = (date) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const getDaysUntilRappel = (rappelDate) => {
    return differenceInDays(parseISO(rappelDate), new Date());
};

const getRappelClass = (rappelDate) => {
    if (!rappelDate) return 'text-muted';
    
    const daysUntil = getDaysUntilRappel(rappelDate);
    if (daysUntil < 0) return 'text-danger fw-bold';
    if (daysUntil < 30) return 'text-warning';
    return 'text-success';
};

const getStatusClass = (vaccination) => {
    if (!vaccination.rappel_prevu) return 'bg-success';
    return getDaysUntilRappel(vaccination.rappel_prevu) < 0 ? 'bg-danger' : 'bg-success';
};

const getStatusLabel = (vaccination) => {
    if (!vaccination.rappel_prevu) return 'Complété';
    return getDaysUntilRappel(vaccination.rappel_prevu) < 0 ? 'Rappel requis' : 'À jour';
};

const planifierRappel = (rappel) => {
    editMode.value = true;
    formData.value = {
        type_vaccin: rappel.type_vaccin,
        date_vaccination: new Date().toISOString().split('T')[0],
        centre_vaccination: '',
        rappel_prevu: ''
    };
    rappelsModal.hide();
    vaccinationModal.show();
};

const viewDetails = (vaccination) => {
    selectedVaccination.value = vaccination;
    // Implémenter la logique d'affichage des détails si nécessaire
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
    vaccinationModal = new Modal(document.getElementById('vaccinationModal'));
    rappelsModal = new Modal(document.getElementById('rappelsModal'));
});
</script>

<style scoped>
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title-area {
    flex: 1;
}

.actions-area {
    display: flex;
    gap: 1rem;
}

.table {
    font-size: 0.95rem;
}

.table th {
    font-weight: 600;
    background-color: #f8f9fa;
}

.rappels-section {
    margin-bottom: 2rem;
}

.section-title {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #dee2e6;
}

.list-group-item {
    transition: background-color 0.2s;
}

.list-group-item:hover {
    background-color: #fff8e1;
}

.badge {
    font-size: 0.85rem;
    padding: 0.5em 0.8em;
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

@media (max-width: 768px) {
    .header-section {
        flex-direction: column;
        gap: 1rem;
    }

    .actions-area {
        width: 100%;
        flex-direction: column;
    }

    .actions-area button {
        width: 100%;
    }

    .btn-group {
        display: flex;
        width: 100%;
    }

    .btn-group .btn {
        flex: 1;
    }
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.list-group-item {
    animation: fadeIn 0.3s ease-out;
}
</style>