<template>
    <div class="examens-list">
        <div class="card">
            <div class="card-header bg-info text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-microscope me-2"></i>
                        Examens Médicaux
                    </h5>
                    <div class="d-flex gap-2 align-items-center">
                        <div class="input-group input-group-sm">
                            <input 
                                type="text" 
                                class="form-control"
                                v-model="searchQuery"
                                placeholder="Rechercher un examen..."
                            >
                            <select v-model="filterType" class="form-select">
                                <option value="">Tous les types</option>
                                <option value="LMB">Laboratoire</option>
                                <option value="radio">Radiologie</option>
                                <option value="echo">Échographie</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        <button 
                            class="btn btn-light btn-sm"
                            @click="$emit('new-examen')"
                        >
                            <i class="fas fa-plus"></i> Nouvel examen
                        </button>
                    </div>
                </div>
            </div>

            <div class="card-body">
                <!-- Liste des examens -->
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Centre</th>
                                <th>Médecin</th>
                                <th>Résultats</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading" class="text-center">
                                <td colspan="6">
                                    <div class="spinner-border text-info" role="status">
                                        <span class="visually-hidden">Chargement...</span>
                                    </div>
                                </td>
                            </tr>
                            <tr v-else-if="filteredExamens.length === 0">
                                <td colspan="6" class="text-center py-4">
                                    <i class="fas fa-microscope fa-2x text-muted mb-2"></i>
                                    <p>Aucun examen trouvé</p>
                                </td>
                            </tr>
                            <tr v-for="examen in filteredExamens" :key="examen.examen_id">
                                <td>{{ formatDate(examen.date_examen) }}</td>
                                <td>
                                    <span :class="getTypeClass(examen.type_examen)">
                                        {{ getTypeLabel(examen.type_examen) }}
                                    </span>
                                </td>
                                <td>{{ examen.centre_examen }}</td>
                                <td>Dr. {{ examen.medecin?.nom }}</td>
                                <td>
                                    <span 
                                        :class="getStatusClass(examen.status)"
                                        class="badge"
                                    >
                                        {{ getStatusLabel(examen.status) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button 
                                            class="btn btn-outline-primary"
                                            @click="viewResults(examen)"
                                            title="Voir les résultats"
                                        >
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-info"
                                            @click="editExamen(examen)"
                                            title="Modifier"
                                        >
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            class="btn btn-outline-danger"
                                            @click="confirmDelete(examen)"
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
        </div>

        <!-- Modal de confirmation de suppression -->

        <div class="modal fade" id="deleteModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Confirmer la suppression
                        </h5>
                        <button 
                            type="button" 
                            class="btn-close btn-close-white" 
                            data-bs-dismiss="modal"
                        ></button>
                    </div>
                    <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir supprimer cet examen ?</p>
                        <div class="alert alert-warning">
                            <i class="fas fa-info-circle me-2"></i>
                            Cette action est irréversible. Tous les documents et résultats associés seront également supprimés.
                        </div>

                        <div class="examen-details" v-if="selectedExamen">
                            <h6 class="mb-3">Détails de l'examen :</h6>
                            <ul class="list-unstyled">
                                <li><strong>Date :</strong> {{ formatDate(selectedExamen.date_examen) }}</li>
                                <li><strong>Type :</strong> {{ getTypeLabel(selectedExamen.type_examen) }}</li>
                                <li><strong>Centre :</strong> {{ selectedExamen.centre_examen }}</li>
                            </ul>
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
                            type="button" 
                            class="btn btn-danger"
                            @click="deleteExamen"
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


import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Modal } from 'bootstrap';
import { useExamens } from '@/composables/Examen/useExamens';
import { useAuth } from '@/composables/useAuth';


// Props
const props = defineProps({
    patientId: {
        type: [Number, String],
        required: true
    }
});

// Emits
const emit = defineEmits(['new-examen', 'view-results', 'edit-examen']);

// États
const searchQuery = ref('');
const filterType = ref('');
const selectedExamen = ref(null);
const deleting = ref(false);
let deleteModal = null;

// Composables
const { examens, loading, fetchExamens, deleteExamen: deleteExamenMethod } = useExamens();
const { user } = useAuth();

// Computed
const filteredExamens = computed(() => {
    let filtered = [...examens.value];
    
    // Filtre par recherche
    if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        filtered = filtered.filter(examen => 
            examen.centre_examen?.toLowerCase().includes(search) ||
            examen.medecin?.nom.toLowerCase().includes(search)
        );
    }

    // Filtre par type
    if (filterType.value) {
        filtered = filtered.filter(examen => 
            examen.type_examen === filterType.value
        );
    }

    // Tri par date décroissante
    return filtered.sort((a, b) => 
        new Date(b.date_examen) - new Date(a.date_examen)
    );
});

const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});


// Méthodes
const viewResults = (examen) => {
    emit('view-results', examen);
};

const editExamen = (examen) => {
    emit('edit-examen', examen);
};

const confirmDelete = (examen) => {
    selectedExamen.value = examen;
    deleteModal.show();
};

const deleteExamen = async () => {
    try {
        deleting.value = true;
        await deleteExamenMethod(selectedExamen.value.examen_id, props.patientId);
        deleteModal.hide();
        showSuccessMessage('Examen supprimé avec succès');
        await fetchExamens(props.patientId);
    } catch (error) {
        showErrorMessage('Erreur lors de la suppression de l\'examen');
        console.error('Erreur de suppression:', error);
    } finally {
        deleting.value = false;
        selectedExamen.value = null;
    }
};

// Helpers
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

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
        'LMB': 'badge bg-primary',
        'radio': 'badge bg-warning',
        'echo': 'badge bg-info',
        'autre': 'badge bg-secondary'
    };
    return classes[type] || 'badge bg-secondary';
};

const getStatusClass = (status) => {
    const classes = {
        'en_attente': 'bg-warning',
        'en_cours': 'bg-info',
        'termine': 'bg-success',
        'annule': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
};

const getStatusLabel = (status) => {
    const labels = {
        'en_attente': 'En attente',
        'en_cours': 'En cours',
        'termine': 'Terminé',
        'annule': 'Annulé'
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
onMounted(async () => {
    deleteModal = new Modal(document.getElementById('deleteModal'));
    await fetchExamens(props.patientId);
});

onUnmounted(() => {
    if (deleteModal) {
        deleteModal.dispose();
    }
});

</script>


<style scoped>

.examens-list {
    min-height: 400px;
}

.table th {
    white-space: nowrap;
    background-color: #f8f9fa;
}

.badge {
    font-size: 0.875rem;
    padding: 0.5em 0.8em;
}

.btn-group .btn {
    padding: 0.25rem 0.5rem;
}

.btn-group .btn i {
    font-size: 0.875rem;
}

.input-group {
    width: auto;
    min-width: 300px;
}

.spinner-border {
    width: 1.5rem;
    height: 1.5rem;
}

.table-responsive {
    min-height: 200px;
}

@media (max-width: 768px) {
    .input-group {
        min-width: 100%;
        margin-bottom: 1rem;
    }

    .card-header .d-flex {
        flex-direction: column;
        gap: 1rem;
    }

    .btn-group {
        display: flex;
        width: 100%;
    }

    .btn-group .btn {
        flex: 1;
    }
}


.examen-details {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 1rem;
}

.examen-details ul li {
    margin-bottom: 0.5rem;
}

.modal-header .btn-close-white {
    filter: brightness(0) invert(1);
}

.alert {
    margin-bottom: 0;
}

.alert i {
    font-size: 1.1em;
}
</style> 
