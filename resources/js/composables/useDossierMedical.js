// composables/useDossierMedical.js
import { ref } from 'vue';
import api from '@/services/api';
import { useApiResponse } from './useApiResponse';

export function useDossierMedical() {
    const dossierMedical = ref(null);
    const antecedents = ref([]);
    const consultations = ref([]);
    const examens = ref([]);
    const vaccinations = ref([]);
    const documents = ref([]);
    
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer le dossier médical complet
    const fetchDossierMedical = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/records/${patientId}`);
            dossierMedical.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération du dossier médical:", error);
            throw error;
        }
    };

    // Récupérer les antécédents
    const fetchAntecedents = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/antecedents/${patientId}`);
            antecedents.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des antécédents:", error);
            throw error;
        }
    };

    // Récupérer les examens
    const fetchExamens = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/examinations/${patientId}`);
            examens.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des examens:", error);
            throw error;
        }
    };

    // Récupérer les vaccinations
    const fetchVaccinations = async (patientId) => {
        try {
            const response = await api.get(`/v1/vaccinations?patient_id=${patientId}`);
            vaccinations.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des vaccinations:", error);
            throw error;
        }
    };

    // Récupérer les documents
    const fetchDocuments = async (patientId) => {
        try {
            const response = await api.get(`/v1/documents?patient_id=${patientId}`);
            documents.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des documents:", error);
            throw error;
        }
    };

    return {
        dossierMedical,
        antecedents,
        consultations,
        examens,
        vaccinations,
        documents,
        loading,
        message,
        fetchDossierMedical,
        fetchAntecedents,
        fetchExamens,
        fetchVaccinations,
        fetchDocuments
    };
}