<!-- HistoriqueMedical.vue -->
<template>
    <div class="historique-medical">
        <!-- Filtres et recherche -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-calendar"></i>
                            </span>
                            <input 
                                type="date"
                                class="form-control"
                                v-model="filtres.dateDebut"
                                @change="applyFilters"
                            >
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" v-model="filtres.type" @change="applyFilters">
                            <option value="">Tous les types</option>
                            <option value="consultation">Consultations</option>
                            <option value="traitement">Traitements</option>
                            <option value="bilan">Bilans</option>
                            <option value="prescription">Prescriptions</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button 
                            class="btn btn-outline-secondary w-100"
                            @click="resetFilters"
                        >
                            <i class="fas fa-undo me-2"></i>
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Timeline des événements -->
        <div class="timeline">
            <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
            </div>

            <template v-else>
                <div 
                    v-for="event in filteredHistorique" 
                    :key="event.carnet_id"
                    class="timeline-item"
                >
                    <div class="timeline-badge" :class="getEventClass(event.type_enregistrement)">
                        <i :class="getEventIcon(event.type_enregistrement)"></i>
                    </div>
                    <div class="timeline-content card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">
                                {{ getTypeLabel(event.type_enregistrement) }}
                            </h6>
                            <small class="text-muted">
                                {{ formatDate(event.date_enregistrement) }}
                            </small>
                        </div>
                        <div class="card-body">
                            <p class="card-text">{{ event.description }}</p>
                            
                            <div class="event-details">
                                <span v-if="event.medecin" class="text-muted">
                                    <i class="fas fa-user-md me-1"></i>
                                    Dr. {{ event.medecin.nom }}
                                </span>
                                <span v-if="event.hôpital" class="text-muted ms-3">
                                    <i class="fas fa-hospital me-1"></i>
                                    {{ event.hôpital }}
                                </span>
                            </div>

                            <!-- Documents associés -->
                            <div v-if="event.documents?.length" class="documents-list mt-3">
                                <div 
                                    v-for="doc in event.documents" 
                                    :key="doc.document_id"
                                    class="document-item"
                                >
                                    <i :class="getDocumentIcon(doc.type_document)"></i>
                                    <span>{{ doc.fichier_url }}</span>
                                    <button 
                                        class="btn btn-sm btn-link"
                                        @click="downloadDocument(doc)"
                                    >
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Message si aucun événement -->
                <div v-if="filteredHistorique.length === 0" class="text-center py-5">
                    <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aucun événement trouvé pour cette période</p>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCarnetNumerique } from '@/composables/useCarnetNumerique';

// Props
const props = defineProps({
    historique: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const filtres = ref({
    dateDebut: '',
    type: ''
});

// Computed
const filteredHistorique = computed(() => {
    let filtered = [...props.historique];
    
    if (filtres.value.dateDebut) {
        filtered = filtered.filter(event => 
            new Date(event.date_enregistrement) >= new Date(filtres.value.dateDebut)
        );
    }
    
    if (filtres.value.type) {
        filtered = filtered.filter(event => 
            event.type_enregistrement === filtres.value.type
        );
    }
    
    return filtered.sort((a, b) => 
        new Date(b.date_enregistrement) - new Date(a.date_enregistrement)
    );
});

// Méthodes
const applyFilters = () => {
    emit('refresh');
};

const resetFilters = () => {
    filtres.value = {
        dateDebut: '',
        type: ''
    };
    emit('refresh');
};

const getEventClass = (type) => {
    const classes = {
        'consultation': 'bg-primary',
        'traitement': 'bg-success',
        'bilan': 'bg-info',
        'prescription': 'bg-warning'
    };
    return classes[type] || 'bg-secondary';
};

const getEventIcon = (type) => {
    const icons = {
        'consultation': 'fas fa-stethoscope',
        'traitement': 'fas fa-pills',
        'bilan': 'fas fa-file-medical-alt',
        'prescription': 'fas fa-prescription'
    };
    return icons[type] || 'fas fa-calendar';
};

const getTypeLabel = (type) => {
    const labels = {
        'consultation': 'Consultation',
        'traitement': 'Traitement',
        'bilan': 'Bilan médical',
        'prescription': 'Prescription'
    };
    return labels[type] || type;
};

const getDocumentIcon = (type) => {
    const icons = {
        'radiographie': 'fas fa-x-ray',
        'analyse_sang': 'fas fa-vial',
        'ordonnance': 'fas fa-file-prescription',
        'compte_rendu': 'fas fa-file-medical'
    };
    return icons[type] || 'fas fa-file';
};

const downloadDocument = async (doc) => {
    try {
        // Implémenter le téléchargement du document
        console.log('Téléchargement du document:', doc.document_id);
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.timeline {
    position: relative;
    padding: 20px 0;
}

.timeline-item {
    position: relative;
    margin-bottom: 30px;
    padding-left: 40px;
}

.timeline-badge {
    position: absolute;
    left: 0;
    top: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    text-align: center;
    line-height: 30px;
    color: white;
}

.timeline-content {
    position: relative;
    margin-left: 15px;
}

.timeline-content::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 15px;
    width: 15px;
    height: 2px;
    background: #dee2e6;
}

.documents-list {
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
}

.document-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .timeline-item {
        padding-left: 30px;
    }

    .timeline-badge {
        width: 24px;
        height: 24px;
        line-height: 24px;
        font-size: 0.8rem;
    }
}
</style>