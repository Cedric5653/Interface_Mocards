// composables/useConsultations.js
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse';

export function useConsultations() {
    const consultations = ref([]);
    const currentConsultation = ref(null);
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer les consultations d'un patient
    const fetchConsultations = async (patientId) => {
        try {
            setApiResponse({
                success: null,
                code: null,
                body: {
                    error_message: null,
                    errors: null,
                    response_data: null,
                },
            });
            const response = await api.get(`/v1/medical/consultations/${patientId}`);
            consultations.value = response.data.data;
            setApiResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des consultations:", error);
            setApiResponse(error.response.data);
            throw error;
        }
    };

    // Créer une nouvelle consultation
    const createConsultation = async (consultationData) => {
        try {
            const response = await api.post('/v1/medical/consultations', consultationData);
            await fetchConsultations(consultationData.patient_id);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de la consultation:", error);
            throw error;
        }
    };

    // Mettre à jour une consultation
    const updateConsultation = async (consultationId, consultationData) => {
        try {
            const response = await api.put(`/v1/medical/consultations/${consultationId}`, consultationData);
            await fetchConsultations(consultationData.patient_id);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la consultation:", error);
            throw error;
        }
    };

    // Récupérer les détails d'une consultation
    const getConsultationDetails = async (consultationId) => {
        try {
            const response = await api.get(`/v1/medical/consultations/${consultationId}`);
            currentConsultation.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des détails de la consultation:", error);
            throw error;
        }
    };

    // Supprimer une consultation
    const deleteConsultation = async (consultationId, patientId) => {
        try {
            const response = await api.delete(`/v1/medical/consultations/${consultationId}`);
            await fetchConsultations(patientId);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la suppression de la consultation:", error);
            throw error;
        }
    };

    return {
        consultations,
        currentConsultation,
        loading,
        message,
        fetchConsultations,
        createConsultation,
        updateConsultation,
        getConsultationDetails,
        deleteConsultation
    };
}