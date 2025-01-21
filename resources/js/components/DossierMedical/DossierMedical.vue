<template>
    <div class="dossier-medical">
        <!-- En-tête avec informations du patient -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">
                        <i class="fas fa-folder-open me-2"></i>
                        Dossier Médical
                    </h4>
                    <div class="btn-group">
                        <button 
                            class="btn btn-light btn-sm"
                            @click="generateReport"
                        >
                            <i class="fas fa-file-pdf me-1"></i>
                            Générer Rapport
                        </button>
                        <button 
                            class="btn btn-light btn-sm"
                            @click="printDossier"
                        >
                            <i class="fas fa-print me-1"></i>
                            Imprimer
                        </button>
                    </div>
                </div>
            </div>

            <!-- Informations patient -->
            <div class="card-body" v-if="dossierMedical">
                <div class="row">
                    <div class="col-md-6">
                        <h5>Informations Patient</h5>
                        <div class="patient-info">
                            <p><strong>Nom:</strong> {{ dossierMedical.patient.nom }}</p>
                            <p><strong>Prénom:</strong> {{ dossierMedical.patient.prenom }}</p>
                            <p><strong>Date de naissance:</strong> {{ formatDate(dossierMedical.patient.date_naissance) }}</p>
                            <p><strong>Groupe sanguin:</strong> {{ dossierMedical.patient.groupe_sanguin }}</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="alert alert-info">
                            <h6>Informations importantes</h6>
                            <ul class="mb-0">
                                <li v-if="dossierMedical.patient.allergies">
                                    <strong>Allergies:</strong> {{ dossierMedical.patient.allergies }}
                                </li>
                                <li v-if="dossierMedical.patient.maladies_chroniques">
                                    <strong>Maladies chroniques:</strong> {{ dossierMedical.patient.maladies_chroniques }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation par onglets -->
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item" v-for="tab in tabs" :key="tab.id">
                <a 
                    class="nav-link"
                    :class="{ active: activeTab === tab.id }"
                    href="#"
                    @click.prevent="activeTab = tab.id"
                >
                    <i :class="tab.icon"></i>
                    {{ tab.label }}
                </a>
            </li>
        </ul>

        <!-- Contenu des onglets -->
        <div class="tab-content">
            <div v-show="activeTab === 'antecedents'">
                <AntecedentsMedicaux 
                    :antecedents="antecedents"
                    @refresh="fetchAntecedents"
                />
            </div>

            <div v-show="activeTab === 'examens'">
                <ExamensMedicaux 
                    :examens="examens"
                    @refresh="fetchExamens"
                />
            </div>

            <div v-show="activeTab === 'vaccinations'">
                <Vaccinations 
                    :vaccinations="vaccinations"
                    @refresh="fetchVaccinations"
                />
            </div>

            <div v-show="activeTab === 'documents'">
                <DocumentsMedicaux 
                    :documents="documents"
                    @refresh="fetchDocuments"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDossierMedical } from '@/composables/useDossierMedical';

// Composants
import AntecedentsMedicaux from './AntecedentsMedicaux.vue';
import ExamensMedicaux from './ExamensMedicaux.vue';
import Vaccinations from './Vaccinations.vue';
import DocumentsMedicaux from './DocumentsMedicaux.vue';

const route = useRoute();
const patientId = route.params.id;

// Composables
const { 
    dossierMedical,
    antecedents,
    examens,
    vaccinations,
    documents,
    loading,
    fetchDossierMedical,
    fetchAntecedents,
    fetchExamens,
    fetchVaccinations,
    fetchDocuments
} = useDossierMedical();

// États
const activeTab = ref('antecedents');

// Configuration des onglets
const tabs = [
    {
        id: 'antecedents',
        label: 'Antécédents',
        icon: 'fas fa-history'
    },
    {
        id: 'examens',
        label: 'Examens',
        icon: 'fas fa-microscope'
    },
    {
        id: 'vaccinations',
        label: 'Vaccinations',
        icon: 'fas fa-syringe'
    },
    {
        id: 'documents',
        label: 'Documents',
        icon: 'fas fa-file-medical'
    }
];

// Méthodes
const generateReport = async () => {
    try {
        const response = await api.get(`/v1/medical/records/${patientId}/report`, {
            responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dossier_medical_${patientId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erreur lors de la génération du rapport:', error);
    }
};

const printDossier = () => {
    window.print();
};

// Helpers
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// Initialisation
const initializeDossier = async () => {
    try {
        await Promise.all([
            fetchDossierMedical(patientId),
            fetchAntecedents(patientId),
            fetchExamens(patientId),
            fetchVaccinations(patientId),
            fetchDocuments(patientId)
        ]);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du dossier:', error);
    }
};

// Lifecycle Hooks
onMounted(() => {
    initializeDossier();
});
</script>

<style scoped>
.dossier-medical {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
}

.patient-info {
    display: grid;
    gap: 0.5rem;
}

.nav-tabs .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: #495057;
    transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
    color: #0d6efd;
    font-weight: 500;
}

.nav-tabs .nav-link i {
    font-size: 1.1rem;
}

@media print {
    .btn-group,
    .nav-tabs {
        display: none;
    }
}

@media (max-width: 768px) {
    .dossier-medical {
        padding: 1rem;
    }

    .nav-tabs {
        flex-wrap: nowrap;
        overflow-x: auto;
    }

    .nav-tabs .nav-link {
        white-space: nowrap;
    }
}
</style>