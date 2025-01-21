// composables/useCarnetNumerique.js
import { ref } from 'vue';
import api from '@/services/api';
import { useApiResponse } from './useApiResponse';

export function useCarnetNumerique() {
    const carnetNumerique = ref(null);
    const historiqueMedical = ref([]);
    const traitements = ref([]);
    const prescriptions = ref([]);
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer le carnet numérique d'un patient
    const fetchCarnetNumerique = async (patientId) => {
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
            const response = await api.get(`/v1/medical/records/${patientId}`);
            carnetNumerique.value = response.data.data;
            setApiResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération du carnet:", error);
            setApiResponse(error.response.data);
            throw error;
        }
    };

    // Créer une nouvelle entrée dans le carnet
    const createCarnetNumerique = async (data) => {
        try {
            const response = await api.post('/v1/medical/records', data);
            await fetchCarnetNumerique(data.patient_id);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création:", error);
            throw error;
        }
    };

    // Mettre à jour une entrée du carnet
    const updateCarnetNumerique = async (carnetId, data) => {
        try {
            const response = await api.put(`/v1/medical/records/${carnetId}`, data);
            await fetchCarnetNumerique(data.patient_id);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            throw error;
        }
    };

    // Récupérer l'historique médical
    const getHistoriqueMedical = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/records/${patientId}/historique`);
            historiqueMedical.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
            throw error;
        }
    };

    // Récupérer les traitements
    const getTraitements = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/records/${patientId}/traitements`);
            traitements.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des traitements:", error);
            throw error;
        }
    };

    // Récupérer les prescriptions
    const getPrescriptions = async (patientId) => {
        try {
            const response = await api.get(`/v1/medical/records/${patientId}/prescriptions`);
            prescriptions.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des prescriptions:", error);
            throw error;
        }
    };

    return {
        carnetNumerique,
        historiqueMedical,
        traitements,
        prescriptions,
        loading,
        message,
        fetchCarnetNumerique,
        createCarnetNumerique,
        updateCarnetNumerique,
        getHistoriqueMedical,
        getTraitements,
        getPrescriptions
    };
}