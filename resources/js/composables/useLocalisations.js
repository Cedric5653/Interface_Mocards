// composables/useLocalisations.js
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse'

export function useLocalisations() {
  const localisations = ref([]);
  const { loading, message, setApiResponse } = useApiResponse()

  const fetchLocalisations = async () => {
    try {
        setApiResponse({
            success: null,
            code: null,
            body: {
                error_message: null,
                errors: null,
                response_data: null,
            },
        })
      const response = await api.get('/v1/localisations');
      console.log('Localisations reçues:', response.data.data); // pour vérifier
      localisations.value = response.data.data;
      setApiResponse(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations:', error);
      setApiResponse(error.response.data)
    }
  };

  return {
    localisations,
    fetchLocalisations,
    loading,
    message,
  };
}
