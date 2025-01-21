<template>
    <div class="documents-medicaux">
        <!-- En-tête avec les actions -->
        <div class="header-section mb-4">
            <div class="title-area">
                <h5 class="mb-0">
                    <i class="fas fa-file-medical me-2"></i>
                    Documents Médicaux
                </h5>
                <small class="text-muted">Gestion des documents et rapports médicaux</small>
            </div>
            <div class="actions-area">
                <button 
                    class="btn btn-primary"
                    @click="showUploadModal"
                    v-if="canEdit"
                >
                    <i class="fas fa-upload me-2"></i>
                    Ajouter un document
                </button>
            </div>
        </div>

        <!-- Filtres et recherche -->
        <div class="filters-section card mb-4">
            <div class="card-body">
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
                                placeholder="Rechercher un document..."
                            >
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" v-model="typeFilter">
                            <option value="">Tous les types</option>
                            <option value="radiographie">Radiographie</option>
                            <option value="analyse_sang">Analyse de sang</option>
                            <option value="ordonnance">Ordonnance</option>
                            <option value="compte_rendu">Compte rendu</option>
                        </select>
                    </div>
                    <div class="col-md-3">
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
                    <div class="col-md-2">
                        <button 
                            class="btn btn-outline-secondary w-100"
                            @click="resetFilters"
                        >
                            <i class="fas fa-undo me-1"></i>
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Grid des documents -->
        <div class="documents-grid">
            <div 
                v-for="doc in filteredDocuments" 
                :key="doc.document_id"
                class="document-card"
            >
                <div class="card">
                    <!-- Icône du document -->
                    <div class="document-icon">
                        <i :class="getDocumentIcon(doc.type_document)"></i>
                    </div>

                    <!-- Informations du document -->
                    <div class="card-body">
                        <h6 class="card-title">{{ doc.fichier_url }}</h6>
                        <p class="card-text small text-muted mb-1">
                            Type: {{ getDocumentTypeLabel(doc.type_document) }}
                        </p>
                        <p class="card-text small text-muted mb-0">
                            Ajouté le: {{ formatDate(doc.date_creation) }}
                        </p>
                    </div>

                    <!-- Actions du document -->
                    <div class="card-footer">
                        <div class="btn-group w-100">
                            <button 
                                class="btn btn-outline-primary"
                                @click="previewDocument(doc)"
                                title="Aperçu"
                            >
                                <i class="fas fa-eye"></i>
                            </button>
                            <button 
                                class="btn btn-outline-success"
                                @click="downloadDocument(doc)"
                                title="Télécharger"
                            >
                                <i class="fas fa-download"></i>
                            </button>
                            <button 
                                class="btn btn-outline-danger"
                                @click="confirmDelete(doc)"
                                title="Supprimer"
                                v-if="canEdit"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Message si aucun document -->
            <div v-if="filteredDocuments.length === 0" class="no-documents">
                <i class="fas fa-folder-open fa-3x mb-3"></i>
                <p>Aucun document trouvé</p>
            </div>
        </div>

        <!-- Modal d'upload -->
        <div class="modal fade" id="uploadModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-upload me-2"></i>
                            Ajouter un document
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleUpload">
                            <div class="mb-3">
                                <label class="form-label required">Type de document</label>
                                <select 
                                    class="form-select"
                                    v-model="uploadData.type_document"
                                    required
                                >
                                    <option value="radiographie">Radiographie</option>
                                    <option value="analyse_sang">Analyse de sang</option>
                                    <option value="ordonnance">Ordonnance</option>
                                    <option value="compte_rendu">Compte rendu</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label required">Document</label>
                                <input 
                                    type="file"
                                    class="form-control"
                                    @change="handleFileSelect"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                >
                                <small class="text-muted">
                                    Formats acceptés: PDF, JPG, PNG (Max: 10MB)
                                </small>
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
                                    :disabled="uploading"
                                >
                                    <span 
                                        class="spinner-border spinner-border-sm me-1" 
                                        v-if="uploading"
                                    ></span>
                                    Téléverser
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de prévisualisation -->
        <div class="modal fade" id="previewModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Aperçu du document</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="document-preview">
                            <!-- Contenu de la prévisualisation -->
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
    documents: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['refresh']);

// États
const searchQuery = ref('');
const typeFilter = ref('');
const dateFilter = ref('');
const uploading = ref(false);
const selectedFile = ref(null);

// Modals
let uploadModal = null;
let previewModal = null;

// Upload Data
const uploadData = ref({
    type_document: 'ordonnance',
    file: null
});

// Composables
const { user } = useAuth();

// Computed
const canEdit = computed(() => {
    return user.value?.role?.permissions?.some(p => 
        p.permission_name === 'Modifier_Suivi_Medical'
    );
});

const filteredDocuments = computed(() => {
    let filtered = [...props.documents];

    if (searchQuery.value) {
        const search = searchQuery.value.toLowerCase();
        filtered = filtered.filter(doc => 
            doc.fichier_url.toLowerCase().includes(search)
        );
    }

    if (typeFilter.value) {
        filtered = filtered.filter(doc => 
            doc.type_document === typeFilter.value
        );
    }

    if (dateFilter.value) {
        filtered = filtered.filter(doc => 
            doc.date_creation.startsWith(dateFilter.value)
        );
    }

    return filtered.sort((a, b) => 
        new Date(b.date_creation) - new Date(a.date_creation)
    );
});

// Méthodes
const showUploadModal = () => {
    uploadData.value = {
        type_document: 'ordonnance',
        file: null
    };
    uploadModal.show();
};

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showErrorMessage('Le fichier est trop volumineux (max: 10MB)');
            event.target.value = '';
            return;
        }
        uploadData.value.file = file;
    }
};

const handleUpload = async () => {
    try {
        uploading.value = true;

        const formData = new FormData();
        formData.append('type_document', uploadData.value.type_document);
        formData.append('file', uploadData.value.file);
        formData.append('carnet_id', props.carnetId);

        await api.post('/v1/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        uploadModal.hide();
        emit('refresh');
        showSuccessMessage('Document téléversé avec succès');

    } catch (error) {
        showErrorMessage("Erreur lors du téléversement du document");
        console.error('Erreur:', error);
    } finally {
        uploading.value = false;
    }
};

const previewDocument = async (doc) => {
    try {
        // Prévisualisation selon le type de document
        const response = await api.get(`/v1/documents/${doc.document_id}/preview`);
        const previewContainer = document.querySelector('.document-preview');
        
        if (doc.type_document.includes('image')) {
            previewContainer.innerHTML = `<img src="data:image/jpeg;base64,${response.data}" class="img-fluid">`;
        } else {
            // Utiliser un viewer PDF pour les documents PDF
            previewContainer.innerHTML = `<embed src="data:application/pdf;base64,${response.data}" type="application/pdf" width="100%" height="600px">`;
        }
        
        previewModal.show();
    } catch (error) {
        showErrorMessage("Erreur lors de la prévisualisation");
    }
};

const downloadDocument = async (doc) => {
    try {
        const response = await api.get(`/v1/documents/${doc.document_id}/download`, {
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fichier_url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        showErrorMessage("Erreur lors du téléchargement");
    }
};

const confirmDelete = async (doc) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
        try {
            await api.delete(`/v1/documents/${doc.document_id}`);
            emit('refresh');
            showSuccessMessage('Document supprimé avec succès');
        } catch (error) {
            showErrorMessage("Erreur lors de la suppression");
        }
    }
};

const resetFilters = () => {
    searchQuery.value = '';
    typeFilter.value = '';
    dateFilter.value = '';
};

// Helpers
const getDocumentIcon = (type) => {
    const icons = {
        'radiographie': 'fas fa-x-ray',
        'analyse_sang': 'fas fa-vial',
        'ordonnance': 'fas fa-prescription',
        'compte_rendu': 'fas fa-file-medical-alt'
    };
    return icons[type] || 'fas fa-file-medical';
};

const getDocumentTypeLabel = (type) => {
    const labels = {
        'radiographie': 'Radiographie',
        'analyse_sang': 'Analyse de sang',
        'ordonnance': 'Ordonnance',
        'compte_rendu': 'Compte rendu'
    };
    return labels[type] || type;
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
    uploadModal = new Modal(document.getElementById('uploadModal'));
    previewModal = new Modal(document.getElementById('previewModal'));
});
</script>


<style scoped>
.documents-medicaux {
   padding: 1rem;
}

.header-section {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 2rem;
}

.documents-grid {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
   gap: 1.5rem;
}

.document-card {
   transition: transform 0.2s ease;
}

.document-card:hover {
   transform: translateY(-5px);
}

.document-icon {
   text-align: center;
   padding: 2rem;
   font-size: 2.5rem;
   background: #f8f9fa;
   color: #0d6efd;
}

.card-footer {
   background: none;
   border-top: 1px solid rgba(0,0,0,0.125);
   padding: 1rem;
}

.document-preview {
   min-height: 600px;
   background: #f8f9fa;
   border-radius: 0.5rem;
   padding: 1rem;
   display: flex;
   align-items: center;
   justify-content: center;
}

.no-documents {
   grid-column: 1 / -1;
   text-align: center;
   padding: 3rem;
   color: #6c757d;
}

/* Types de documents */
.radiographie .document-icon { color: #dc3545; }
.analyse_sang .document-icon { color: #198754; }
.ordonnance .document-icon { color: #0dcaf0; }
.compte_rendu .document-icon { color: #6f42c1; }

/* Responsive */
@media (max-width: 768px) {
   .header-section {
       flex-direction: column;
       gap: 1rem;
       text-align: center;
   }

   .actions-area {
       width: 100%;
   }

   .actions-area .btn {
       width: 100%;
   }

   .documents-grid {
       grid-template-columns: 1fr;
   }
}

/* Animation pour les cartes */
@keyframes fadeInUp {
   from {
       opacity: 0;
       transform: translateY(20px);
   }
   to {
       opacity: 1;
       transform: translateY(0);
   }
}

.document-card {
   animation: fadeInUp 0.3s ease-out;
}

/* Style pour le drag & drop */
.upload-zone {
   border: 2px dashed #dee2e6;
   border-radius: 0.5rem;
   padding: 2rem;
   text-align: center;
   transition: all 0.2s;
}

.upload-zone.dragging {
   background: #e9ecef;
   border-color: #0d6efd;
}

.required::after {
   content: '*';
   color: red;
   margin-left: 4px;
}
</style>