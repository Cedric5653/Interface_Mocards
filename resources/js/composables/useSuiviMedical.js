// composables/useSuiviMedical.js
import { ref } from 'vue';
import api from '@/services/api';
import { useApiResponse } from './useApiResponse';

export function useSuiviMedical() {
    const suivi = ref(null);
    const prescriptions = ref([]);
    const observations = ref([]);
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer le suivi médical d'un patient
    const fetchSuiviMedical = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/suivis/${patientId}`);
            suivi.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur récupération suivi:", error);
            throw error;
        }
    };

    // Créer un nouveau suivi
    const createSuivi = async (data) => {
        try {
            const response = await api.post('/v1/medical/suivis', {
                patient_id: data.patient_id,
                medecin_id: data.medecin_id,
                diagnostic: data.diagnostic,
                prescription: data.prescription,
                posologie: data.posologie,
                observations: data.observations,
                date_consultation: data.date_consultation
            });
            suivi.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur création suivi:", error);
            throw error;
        }
    };

    // Mettre à jour un suivi
    const updateSuivi = async (suiviId, data) => {
        try {
            const response = await api.put(`/v1/medical/suivis/${suiviId}`, data);
            suivi.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur mise à jour suivi:", error);
            throw error;
        }
    };

    // Récupérer les prescriptions en cours
    const getPrescriptionsEnCours = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/suivis/${patientId}/prescriptions`);
            prescriptions.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur récupération prescriptions:", error);
            throw error;
        }
    };

    // Récupérer les observations médicales
    const getObservationsMedicales = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/suivis/${patientId}/observations`);
            observations.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur récupération observations:", error);
            throw error;
        }
    };

    return {
        suivi,
        prescriptions,
        observations,
        loading,
        message,
        fetchSuiviMedical,
        createSuivi,
        updateSuivi,
        getPrescriptionsEnCours,
        getObservationsMedicales
    };
}