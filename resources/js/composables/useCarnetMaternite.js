// composables/useCarnetMaternite.js
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse';

export function useCarnetMaternite() {
  const carnet = ref(null);
  const suiviGrossesse = ref(null);
  const consultations = ref([]);
  const { loading, message, setApiResponse } = useApiResponse();

  const fetchCarnetMaternite = async (patientId) => {
    try {
      const response = await api.get(`/v1/carnets-maternite/${patientId}`);
      carnet.value = response.data.data;
      return response.data;
    } catch (error) {
      setApiResponse(error.response.data);
      throw error;
    }
  };

  const createCarnetMaternite = async (data) => {
    try {
      const response = await api.post('/v1/carnets-maternite', data);
      carnet.value = response.data.data;
      return response.data;
    } catch (error) {
      setApiResponse(error.response.data);
      throw error;
    }
  };

  const updateCarnetMaternite = async (id, data) => {
    try {
      const response = await api.put(`/v1/carnets-maternite/${id}`, data);
      carnet.value = response.data.data;
      return response.data;
    } catch (error) {
      setApiResponse(error.response.data);
      throw error;
    }
  };

  const getSuiviGrossesse = async (carnetId) => {
    try {
      const response = await api.get(`/v1/carnets-maternite/${carnetId}/suivi`);
      suiviGrossesse.value = response.data.data;
      return response.data;
    } catch (error) {
      setApiResponse(error.response.data);
      throw error;
    }
  };

  const getConsultationsPrenatales = async (carnetId) => {
    try {
      const response = await api.get(`/v1/carnets-maternite/${carnetId}/consultations`);
      consultations.value = response.data.data;
      return response.data;
    } catch (error) {
      setApiResponse(error.response.data);
      throw error;
    }
  };

  return {
    carnet,
    suiviGrossesse,
    consultations,
    loading,
    message,
    fetchCarnetMaternite,
    createCarnetMaternite,
    updateCarnetMaternite,
    getSuiviGrossesse,
    getConsultationsPrenatales
  };
}