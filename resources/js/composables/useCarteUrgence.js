// composables/useCarteUrgence.js
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse';

export function useCarteUrgence() {
    const carteUrgence = ref(null);
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer la carte d'urgence
    const getCarteUrgence = async (patientId) => {
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
            const response = await api.get(`/v1/cartes-urgence/${patientId}`);
            carteUrgence.value = response.data.data;
            setApiResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération de la carte d'urgence:", error);
            setApiResponse(error.response.data);
            throw error;
        }
    };

    // Créer une carte d'urgence
    const createCarteUrgence = async (data) => {
        try {
            const response = await api.post('/v1/cartes-urgence', data);
            carteUrgence.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de la carte d'urgence:", error);
            throw error;
        }
    };

    // Mettre à jour une carte d'urgence
    const updateCarteUrgence = async (id, data) => {
        try {
            const response = await api.put(`/v1/cartes-urgence/${id}`, data);
            carteUrgence.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la carte d'urgence:", error);
            throw error;
        }
    };

    return {
        carteUrgence,
        loading,
        message,
        getCarteUrgence,
        createCarteUrgence,
        updateCarteUrgence
    };
}