<template>
    <div class="prescriptions">
        <!-- En-tête avec filtres -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-prescription me-2"></i>
                    Prescriptions Médicales
                </h5>
                <button 
                    class="btn btn-light btn-sm"
                    @click="showAddModal"
                    v-if="canAddPrescription"
                >
                    <i class="fas fa-plus me-1"></i>
                    Nouvelle prescription
                </button>
            </div>

            <div class="card-body">
                <!-- Filtres -->
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="input-group">
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
                    <div class="col-md-4">
                        <select class="form-select" v-model="statusFilter">
                            <option value="">Tous les statuts</option>
                            <option value="active">Active</option>
                            <option value="completed">Terminée</option>
                            <option value="cancelled">Annulée</option>
                        </select>
                    </div>
                </div>

                <!-- Liste des prescriptions -->
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Médicaments</th>
                                <th>Posologie</th>
                                <th>Médecin</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="6" class="text-center py-4">
                                    <div class="spinner-border text-primary"></div>
                                </td>
                            </tr>
                            <tr v-else-if="filteredPrescriptions.length === 0">
                                <td colspan="6" class="text-center py-4">
                                    <i class="fas fa-prescription-bottle fa-3x text-muted mb-3"></i>
                                    <p class="text-muted">Aucune prescription trouvée</p>
                                </td>
                            </tr>
                            <tr 
                                v-for="prescription in filteredPrescriptions" 
                                :key="prescription.id"
                            >
                                <td>{{ formatDate(prescription.date_prescription) }}</td>
                                <td>
                                    <div v-for="med in prescription.medicaments" :key="med.id">
                                        {{ med.nom }}
                                    </div>
                                </td>
                                <td>
                                    <div v-for="med in prescription.medicaments" :key="med.id">
                                        {{ med.posologie }}
                                    </div>
                                </td>
                                <td>Dr. {{ prescription.medecin?.nom }}</td>
                                <td>
                                    <span :class="getStatusBadgeClass(prescription.status)">
                                        {{ getStatusLabel(prescription.status) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-primary"
                                            @click="viewPrescription(prescription)"
                                            title="Voir"
                                        >
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-success"
                                            @click="downloadPrescription(prescription)"
                                            title="Télécharger"
                                        >
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button 
                                            v-if="canEditPrescription(prescription)"
                                            class="btn btn-outline-danger"
                                            @click="cancelPrescription(prescription)"
                                            title="Annuler"
                                        >
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal d'ajout de prescription -->
        <div class="modal fade" id="prescriptionModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {{ editMode ? 'Modifier la prescription' : 'Nouvelle prescription' }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="savePrescription">
                            <!-- Liste des médicaments -->
                            <div v-for="(med, index) in formData.medicaments" :key="index" class="card mb-3">
                                <div class="card-body">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label required">Médicament</label>
                                            <input 
                                                type="text"
                                                class="form-control"
                                                v-model="med.nom"
                                                required
                                            >
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label required">Posologie</label>
                                            <input 
                                                type="text"
                                                class="form-control"
                                                v-model="med.posologie"
                                                required
                                            >
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label required">Durée</label>
                                            <input 
                                                type="text"
                                                class="form-control"
                                                v-model="med.duree"
                                                required
                                            >
                                        </div>
                                        <div class="col-md-1 d-flex align-items-end">
                                            <button 
                                                type="button"
                                                class="btn btn-outline-danger"
                                                @click="removeMedicament(index)"
                                            >
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="button"
                                class="btn btn-outline-primary mb-3"
                                @click="addMedicament"
                            >
                                <i class="fas fa-plus me-1"></i>
                                Ajouter un médicament
                            </button>

                            <!-- Instructions -->
                            <div class="mb-3">
                                <label class="form-label">Instructions</label>
                                <textarea 
                                    class="form-control"
                                    v-model="formData.instructions"
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
                                <button 
                                    type="submit"
                                    class="btn btn-primary"
                                    :disabled="saving"
                                >
                                    {{ editMode ? 'Modifier' : 'Créer' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de visualisation -->
        <div class="modal fade" id="viewModal">
            <!-- Contenu du modal de visualisation -->
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
    prescriptions: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const searchQuery = ref('');
const dateFilter = ref('');
const statusFilter = ref('');
const editMode = ref(false);
const saving = ref(false);
const selectedPrescription = ref(null);

// Modals
let prescriptionModal = null;
let viewModal = null;

// Form Data
const formData = ref({
    medicaments: [{ nom: '', posologie: '', duree: '' }],
    instructions: '',
    status: 'active'
});

// Composables
const { user } = useAuth();
const { loading, createCarnetNumerique, updateCarnetNumerique } = useCarnetNumerique();

// Computed
const canAddPrescription = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});

const filteredPrescriptions = computed(() => {
    let filtered = [...props.prescriptions];

    // Filtre de recherche
    if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        filtered = filtered.filter(p => 
            p.medicaments.some(m => m.nom.toLowerCase().includes(search)) ||
            p.instructions?.toLowerCase().includes(search) ||
            p.medecin?.nom.toLowerCase().includes(search)
        );
    }

    // Filtre de date
    if (dateFilter.value) {
        filtered = filtered.filter(p => 
            p.date_prescription.startsWith(dateFilter.value)
        );
    }

    // Filtre de statut
    if (statusFilter.value) {
        filtered = filtered.filter(p => p.status === statusFilter.value);
    }

    // Tri par date décroissante
    return filtered.sort((a, b) => 
        new Date(b.date_prescription) - new Date(a.date_prescription)
    );
});

// Méthodes
const showAddModal = () => {
    editMode.value = false;
    resetForm();
    prescriptionModal.show();
};

const addMedicament = () => {
    formData.value.medicaments.push({ nom: '', posologie: '', duree: '' });
};

const removeMedicament = (index) => {
    if (formData.value.medicaments.length > 1) {
        formData.value.medicaments.splice(index, 1);
    }
};

const savePrescription = async () => {
    try {
        saving.value = true;

        const prescriptionData = {
            type_enregistrement: 'prescription',
            description: formData.value.medicaments.map(m => 
                `${m.nom} - ${m.posologie}`
            ).join(', '),
            patient_id: props.patientId,
            ...formData.value
        };

        if (editMode.value) {
            await updateCarnetNumerique(selectedPrescription.value.id, prescriptionData);
        } else {
            await createCarnetNumerique(prescriptionData);
        }

        prescriptionModal.hide();
        resetForm();
        emit('refresh');
        showSuccessMessage(editMode.value ? 'Prescription modifiée' : 'Prescription créée');

    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showErrorMessage("Une erreur est survenue lors de la sauvegarde");
    } finally {
        saving.value = false;
    }
};

const viewPrescription = (prescription) => {
    selectedPrescription.value = prescription;
    viewModal.show();
};

const downloadPrescription = async (prescription) => {
    try {
        const response = await api.get(`/v1/medical/prescriptions/${prescription.id}/download`);
        // Logique de téléchargement du PDF
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `prescription_${prescription.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showErrorMessage("Erreur lors du téléchargement de la prescription");
    }
};

const cancelPrescription = async (prescription) => {
    try {
        await updateCarnetNumerique(prescription.id, { 
            ...prescription,
            status: 'cancelled'
        });
        emit('refresh');
        showSuccessMessage('Prescription annulée');
    } catch (error) {
        showErrorMessage("Erreur lors de l'annulation de la prescription");
    }
};

const canEditPrescription = (prescription) => {
    return prescription.status === 'active' && 
           (user.value?.role_id === 1 || prescription.medecin_id === user.value?.user_id);
};

// Helpers
const resetForm = () => {
    formData.value = {
        medicaments: [{ nom: '', posologie: '', duree: '' }],
        instructions: '',
        status: 'active'
    };
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

const getStatusBadgeClass = (status) => {
    const classes = {
        'active': 'badge bg-success',
        'completed': 'badge bg-secondary',
        'cancelled': 'badge bg-danger'
    };
    return classes[status] || 'badge bg-secondary';
};

const getStatusLabel = (status) => {
    const labels = {
        'active': 'Active',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
    };
    return labels[status] || status;
};

const showSuccessMessage = (message) => {
    // Implémentez votre système de notification
    console.log('Success:', message);
};

const showErrorMessage = (message) => {
    // Implémentez votre système de notification
    console.error('Error:', message);
};

// Lifecycle Hooks
onMounted(() => {
    prescriptionModal = new Modal(document.getElementById('prescriptionModal'));
    viewModal = new Modal(document.getElementById('viewModal'));
});
</script>

<style scoped>
/* Style spécifique */
.table th {
    background-color: #f8f9fa;
    white-space: nowrap;
}

.table td {
    vertical-align: middle;
}

.btn-group .btn {
    padding: 0.25rem 0.5rem;
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.badge {
    font-size: 0.875rem;
    padding: 0.5em 0.8em;
}

@media (max-width: 768px) {
    .btn-group {
        display: flex;
        flex-direction: column;
    }

    .btn-group .btn {
        margin-bottom: 0.25rem;
    }
}
</style>