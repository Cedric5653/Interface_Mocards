<template>
    <div class="examen-results">
        <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-file-medical-alt me-2"></i>
                    Résultats d'Examen
                </h5>
                <div class="btn-group">
                    <button 
                        class="btn btn-light btn-sm"
                        @click="downloadResults"
                        v-if="examen.document_id"
                    >
                        <i class="fas fa-download me-1"></i> Télécharger
                    </button>
                    <button 
                        class="btn btn-light btn-sm"
                        @click="printResults"
                    >
                        <i class="fas fa-print me-1"></i> Imprimer
                    </button>
                    <button 
                        class="btn btn-light btn-sm"
                        @click="$emit('close')"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="card-body">
                <!-- Informations de l'examen -->
                <div class="info-header mb-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="info-section">
                                <h6 class="section-title">Informations Générales</h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">Date:</span>
                                        <span>{{ formatDate(examen.date_examen) }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Type:</span>
                                        <span :class="getTypeClass(examen.type_examen)">
                                            {{ getTypeLabel(examen.type_examen) }}
                                        </span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Centre:</span>
                                        <span>{{ examen.centre_examen }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Médecin:</span>
                                        <span>Dr. {{ examen.medecin?.nom }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="info-section">
                                <h6 class="section-title">Description</h6>
                                <p class="mb-0">{{ examen.description || 'Aucune description' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Résultats -->
                <div class="results-section">
                    <h6 class="section-title">Résultats de l'examen</h6>
                    
                    <!-- État de l'examen -->
                    <div class="status-badge mb-3">
                        <span :class="getStatusClass(examen.status)">
                            {{ getStatusLabel(examen.status) }}
                        </span>
                    </div>

                    <!-- Résultats détaillés -->
                    <div class="results-content" v-if="examen.status === 'termine'">
                        <div class="result-text">
                            {{ examen.resultat }}
                        </div>

                        <!-- Documents attachés -->
                        <div class="attached-documents mt-4" v-if="examen.documents?.length">
                            <h6 class="mb-3">Documents attachés</h6>
                            <div class="documents-grid">
                                <div 
                                    v-for="doc in examen.documents" 
                                    :key="doc.id"
                                    class="document-item"
                                >
                                    <div class="document-icon">
                                        <i :class="getDocumentIcon(doc.type)"></i>
                                    </div>
                                    <div class="document-info">
                                        <div class="document-name">{{ doc.nom }}</div>
                                        <small class="document-date">
                                            {{ formatDate(doc.created_at) }}
                                        </small>
                                    </div>
                                    <button 
                                        class="btn btn-link"
                                        @click="downloadDocument(doc)"
                                    >
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Message si en attente -->
                    <div v-else-if="examen.status === 'en_cours'" class="alert alert-info">
                        <i class="fas fa-spinner fa-spin me-2"></i>
                        Les résultats sont en cours de traitement.
                    </div>

                    <div v-else-if="examen.status === 'en_attente'" class="alert alert-warning">
                        <i class="fas fa-clock me-2"></i>
                        L'examen n'a pas encore été effectué.
                    </div>

                    <div v-else-if="examen.status === 'annule'" class="alert alert-danger">
                        <i class="fas fa-times-circle me-2"></i>
                        Cet examen a été annulé.
                    </div>
                </div>

                <!-- Observations supplémentaires -->
                <div class="additional-notes mt-4" v-if="examen.observations">
                    <h6 class="section-title">Observations supplémentaires</h6>
                    <div class="notes-content">
                        {{ examen.observations }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<script setup>
import { ref, computed } from 'vue';
import { useExamens } from '@/composables/useExamens';

const props = defineProps({
    examen: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

// États
const loading = ref(false);

// Composables
const { downloadExamenDocument } = useExamens();

// Méthodes
const downloadResults = async () => {
    try {
        loading.value = true;
        await downloadExamenDocument(props.examen.document_id);
    } catch (error) {
        showErrorMessage("Erreur lors du téléchargement des résultats");
        console.error('Erreur de téléchargement:', error);
    } finally {
        loading.value = false;
    }
};

const downloadDocument = async (document) => {
    try {
        loading.value = true;
        await downloadExamenDocument(document.id);
    } catch (error) {
        showErrorMessage("Erreur lors du téléchargement du document");
    } finally {
        loading.value = false;
    }
};

const printResults = () => {
    window.print();
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
    return `badge ${getTypeColorClass(type)}`;
};

const getTypeColorClass = (type) => {
    const classes = {
        'LMB': 'bg-primary',
        'radio': 'bg-warning',
        'echo': 'bg-info',
        'autre': 'bg-secondary'
    };
    return classes[type] || 'bg-secondary';
};

const getStatusClass = (status) => {
    const classes = {
        'en_attente': 'badge bg-warning',
        'en_cours': 'badge bg-info',
        'termine': 'badge bg-success',
        'annule': 'badge bg-danger'
    };
    return classes[status] || 'badge bg-secondary';
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

const getDocumentIcon = (type) => {
    const icons = {
        'pdf': 'fas fa-file-pdf',
        'image': 'fas fa-file-image',
        'text': 'fas fa-file-alt'
    };
    return icons[type] || 'fas fa-file';
};

const showErrorMessage = (message) => {
    // Implémenter votre système de notification
    console.error('Error:', message);
};
</script>

<style scoped>
.examen-results {
    max-width: 900px;
    margin: 0 auto;
}

.info-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
    height: 100%;
}

.section-title {
    color: #198754;
    border-bottom: 2px solid #198754;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
}

.info-grid {
    display: grid;
    gap: 0.8rem;
}

.info-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
}

.label {
    font-weight: 600;
    color: #495057;
}

.badge {
    display: inline-block;
    padding: 0.5em 0.8em;
    font-size: 0.875em;
    font-weight: 500;
}

.results-content {
    background-color: #fff;
    padding: 1.5rem;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
}

.documents-grid {
    display: grid;
    gap: 1rem;
}

.document-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
}

.document-item:hover {
    background-color: #e9ecef;
}

.document-icon {
    font-size: 1.5rem;
    color: #6c757d;
}

.document-info {
    flex: 1;
}

.document-name {
    font-weight: 500;
}

.document-date {
    color: #6c757d;
}

@media print {
    .btn-group {
        display: none;
    }

    .card {
        border: none;
        box-shadow: none;
    }

    .info-section,
    .results-content {
        break-inside: avoid;
    }
}

@media (max-width: 768px) {
    .info-item {
        grid-template-columns: 1fr;
    }

    .document-item {
        flex-direction: column;
        text-align: center;
    }
}
</style>