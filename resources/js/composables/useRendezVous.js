
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse';

export function useRendezVous() {
    const rendezVous = ref([]);
    const currentRendezVous = ref(null);
    const { loading, message, setApiResponse } = useApiResponse();

    // Récupérer les rendez-vous
    const fetchRendezVous = async (filters = {}) => {
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
            const response = await api.get('/v1/rendez-vous', { params: filters });
            rendezVous.value = response.data.data;
            setApiResponse(response.data);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des rendez-vous:", error);
            setApiResponse(error.response.data);
            throw error;
        }
    };

    // Créer un rendez-vous
    const createRendezVous = async (rdvData) => {
        try {
            const response = await api.post('/v1/rendez-vous', rdvData);
            await fetchRendezVous();
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la création du rendez-vous:", error);
            throw error;
        }
    };

    // Mettre à jour un rendez-vous
    const updateRendezVous = async (rdvId, rdvData) => {
        try {
            const response = await api.put(`/v1/rendez-vous/${rdvId}`, rdvData);
            await fetchRendezVous();
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du rendez-vous:", error);
            throw error;
        }
    };

    // Annuler un rendez-vous
    const cancelRendezVous = async (rdvId) => {
        try {
            const response = await api.patch(`/v1/rendez-vous/${rdvId}`, {
                statut: 'annulé'
            });
            await fetchRendezVous();
            return response.data;
        } catch (error) {
            console.error("Erreur lors de l'annulation du rendez-vous:", error);
            throw error;
        }
    };

    // Vérifier la disponibilité
    const checkDisponibilite = async (medecinId, date) => {
        try {
            const response = await api.get('/v1/rendez-vous/check-disponibilite', {
                params: {
                    medecin_id: medecinId,
                    date: date
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la vérification de disponibilité:", error);
            throw error;
        }
    };

    // Obtenir les créneaux disponibles
    const getCreneauxDisponibles = async (medecinId, date) => {
        try {
            const response = await api.get('/v1/rendez-vous/creneaux-disponibles', {
                params: {
                    medecin_id: medecinId,
                    date: date
                }
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des créneaux:", error);
            throw error;
        }
    };

    return {
        rendezVous,
        currentRendezVous,
        loading,
        message,
        fetchRendezVous,
        createRendezVous,
        updateRendezVous,
        cancelRendezVous,
        checkDisponibilite,
        getCreneauxDisponibles
    };
}