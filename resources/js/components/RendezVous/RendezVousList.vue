<template>
    <div class="rendez-vous-list">
        <!-- En-tête avec filtres -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-calendar-check me-2"></i>
                        Rendez-vous
                    </h5>
                    <div class="d-flex gap-3">
                        <!-- Filtres -->
                        <div class="input-group">
                            <input 
                                type="date"
                                class="form-control"
                                v-model="filters.date"
                            >
                            <select v-model="filters.statut" class="form-select">
                                <option value="">Tous les statuts</option>
                                <option value="programmé">Programmé</option>
                                <option value="confirmé">Confirmé</option>
                                <option value="annulé">Annulé</option>
                                <option value="terminé">Terminé</option>
                            </select>
                            <button 
                                class="btn btn-light"
                                @click="resetFilters"
                            >
                                <i class="fas fa-undo"></i>
                            </button>
                        </div>
                        <!-- Bouton Nouveau -->
                        <button 
                            class="btn btn-light"
                            @click="$emit('new-rdv')"
                        >
                            <i class="fas fa-plus me-2"></i>
                            Nouveau RDV
                        </button>
                    </div>
                </div>
            </div>

            <div class="card-body p-0">
                <!-- Loading state -->
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                </div>

                <!-- Liste des rendez-vous -->
                <div v-else class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Patient</th>
                                <th>Médecin</th>
                                <th>Motif</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredRendezVous.length === 0">
                                <td colspan="6" class="text-center py-4">
                                    <i class="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                                    <p class="mb-0">Aucun rendez-vous trouvé</p>
                                </td>
                            </tr>
                            <tr 
                                v-for="rdv in filteredRendezVous" 
                                :key="rdv.rdv_id"
                                :class="{ 'table-warning': isToday(rdv.date_rdv) }"
                            >
                                <td>
                                    <div class="date-info">
                                        <strong>{{ formatDate(rdv.date_rdv) }}</strong>
                                        <small>{{ formatTime(rdv.date_rdv) }}</small>
                                    </div>
                                </td>
                                <td>{{ rdv.patient.nom }} {{ rdv.patient.prenom }}</td>
                                <td>Dr. {{ rdv.medecin.nom }}</td>
                                <td>{{ rdv.motif }}</td>
                                <td>
                                    <span :class="getStatusClass(rdv.statut)">
                                        {{ rdv.statut }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-primary"
                                            @click="updateStatus(rdv, 'confirmé')"
                                            v-if="rdv.statut === 'programmé'"
                                            title="Confirmer"
                                        >
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-warning"
                                            @click="$emit('edit-rdv', rdv)"
                                            title="Modifier"
                                        >
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-danger"
                                            @click="confirmCancel(rdv)"
                                            v-if="rdv.statut !== 'annulé'"
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

        <!-- Modal de confirmation d'annulation -->
        <div class="modal fade" id="cancelModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmer l'annulation</h5>
                        <button 
                            type="button" 
                            class="btn-close" 
                            data-bs-dismiss="modal"
                        ></button>
                    </div>
                    <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir annuler ce rendez-vous ?</p>
                        <div class="alert alert-warning" v-if="selectedRdv">
                            <strong>Date :</strong> {{ formatDate(selectedRdv.date_rdv) }}<br>
                            <strong>Patient :</strong> {{ selectedRdv.patient.nom }} {{ selectedRdv.patient.prenom }}<br>
                            <strong>Médecin :</strong> Dr. {{ selectedRdv.medecin.nom }}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button 
                            type="button" 
                            class="btn btn-secondary" 
                            data-bs-dismiss="modal"
                        >
                            Non
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-danger"
                            @click="cancelRendezVous"
                            :disabled="cancelling"
                        >
                            <span 
                                class="spinner-border spinner-border-sm me-1" 
                                v-if="cancelling"
                            ></span>
                            Oui, annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Modal } from 'bootstrap';
import { useRendezVous } from '@/composables/useRendezVous';
import { format, isToday as isTodayFn } from 'date-fns';
import { fr } from 'date-fns/locale';

// Props & Emits
const emit = defineEmits(['new-rdv', 'edit-rdv', 'rdv-status-changed']);

// États
const filters = ref({
    date: '',
    statut: ''
});
const selectedRdv = ref(null);
const cancelling = ref(false);
let cancelModal = null;

// Composables
const { rendezVous, loading, fetchRendezVous, cancelRendezVous: cancelRdv } = useRendezVous();

// Computed
const filteredRendezVous = computed(() => {
    let filtered = [...rendezVous.value];

    if (filters.value.date) {
        const filterDate = new Date(filters.value.date).toDateString();
        filtered = filtered.filter(rdv => 
            new Date(rdv.date_rdv).toDateString() === filterDate
        );
    }

    if (filters.value.statut) {
        filtered = filtered.filter(rdv => 
            rdv.statut === filters.value.statut
        );
    }

    // Tri par date/heure
    return filtered.sort((a, b) => 
        new Date(a.date_rdv) - new Date(b.date_rdv)
    );
});

// Méthodes
const resetFilters = () => {
    filters.value = {
        date: '',
        statut: ''
    };
};

const updateStatus = async (rdv, newStatus) => {
    try {
        await updateRendezVous(rdv.rdv_id, { ...rdv, statut: newStatus });
        emit('rdv-status-changed', { rdv, newStatus });
        showSuccessMessage(`Statut du rendez-vous mis à jour : ${newStatus}`);
    } catch (error) {
        showErrorMessage("Erreur lors de la mise à jour du statut");
    }
};

const confirmCancel = (rdv) => {
    selectedRdv.value = rdv;
    cancelModal.show();
};

const cancelRendezVous = async () => {
    try {
        cancelling.value = true;
        await cancelRdv(selectedRdv.value.rdv_id);
        cancelModal.hide();
        showSuccessMessage('Rendez-vous annulé avec succès');
        emit('rdv-status-changed', { 
            rdv: selectedRdv.value, 
            newStatus: 'annulé' 
        });
    } catch (error) {
        showErrorMessage("Erreur lors de l'annulation du rendez-vous");
    } finally {
        cancelling.value = false;
        selectedRdv.value = null;
    }
};

// Helpers
const formatDate = (date) => {
    return format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr });
};

const formatTime = (date) => {
    return format(new Date(date), 'HH:mm');
};

const isToday = (date) => {
    return isTodayFn(new Date(date));
};

const getStatusClass = (status) => {
    const classes = {
        'programmé': 'badge bg-primary',
        'confirmé': 'badge bg-success',
        'annulé': 'badge bg-danger',
        'terminé': 'badge bg-secondary'
    };
    return classes[status] || 'badge bg-secondary';
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
onMounted(async () => {
    cancelModal = new Modal(document.getElementById('cancelModal'));
    await fetchRendezVous();
});

onUnmounted(() => {
    if (cancelModal) {
        cancelModal.dispose();
    }
});
</script>

<style scoped>
.rendez-vous-list {
    min-height: 400px;
}

.date-info {
    display: flex;
    flex-direction: column;
}

.date-info small {
    color: #6c757d;
}

.badge {
    font-size: 0.875rem;
    padding: 0.5em 0.8em;
}

.table th {
    white-space: nowrap;
}

.table td {
    vertical-align: middle;
}

.btn-group .btn {
    padding: 0.25rem 0.5rem;
}

.table-warning {
    --bs-table-bg: rgba(255, 193, 7, 0.1);
}

@media (max-width: 768px) {
    .card-header .d-flex {
        flex-direction: column;
        gap: 1rem;
    }

    .input-group {
        width: 100%;
    }

    .btn-group {
        justify-content: center;
        width: 100%;
    }
}
</style>