
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse';

export function useExamens() {
    const examens = ref([]);
    const currentExamen = ref(null);
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer les examens d'un patient
    const fetchExamens = async (patientId) => {
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
            const response = await api.get(`/v1/medical/examinations/${patientId}`);
            examens.value = response.data.data;
            setApiResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des examens:", error);
            setApiResponse(error.response.data);
            throw error;
        }
    };

    // Créer un nouvel examen
    const createExamen = async (examenData) => {
        try {
            const response = await api.post('/v1/medical/examinations', examenData);
            await fetchExamens(examenData.patient_id);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création de l'examen:", error);
            throw error;
        }
    };

    // Mettre à jour un examen
    const updateExamen = async (examenId, examenData) => {
        try {
            const response = await api.put(`/v1/medical/examinations/${examenId}`, examenData);
            await fetchExamens(examenData.patient_id);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'examen:", error);
            throw error;
        }
    };

    // Récupérer les résultats d'examen
    const getExamenResults = async (examenId) => {
        try {
            const response = await api.get(`/v1/medical/examinations/${examenId}/results`);
            currentExamen.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des résultats:", error);
            throw error;
        }
    };

    // Supprimer un examen
    const deleteExamen = async (examenId, patientId) => {
        try {
            const response = await api.delete(`/v1/medical/examinations/${examenId}`);
            await fetchExamens(patientId);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la suppression de l'examen:", error);
            throw error;
        }
    };

    // Upload document d'examen
    const uploadExamenDocument = async (examenId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`/v1/medical/examinations/${examenId}/document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de l'upload du document:", error);
            throw error;
        }
    };

    return {
        examens,
        currentExamen,
        loading,
        message,
        fetchExamens,
        createExamen,
        updateExamen,
        getExamenResults,
        deleteExamen,
        uploadExamenDocument
    };
}