// composables/usePatients.js
import { ref } from 'vue'
import api from '../services/api'
import { useApiResponse } from './useApiResponse'

export function usePatients() {
    const patients = ref([])
    const currentPatient = ref(null)
    const { loading, message, setApiResponse } = useApiResponse()

    // Liste des patients
    const fetchPatients = async () => {
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
            const response = await api.get('/v1/patients')
            patients.value = response.data.data
            setApiResponse(response.data)
            return response.data
        } catch (error) {
            console.error("Erreur lors de la récupération des patients:", error)
            setApiResponse(error.response.data)
            throw error
        }
    }

    // Créer patient
    const createPatient = async (patientData) => {
        try {
            const response = await api.post('/v1/patients', patientData)
            await fetchPatients()
            return response.data
        } catch (error) {
            console.error("Erreur lors de la création du patient:", error)
            throw error
        }
    }

    // Mettre à jour patient
    const updatePatient = async (patientId, patientData) => {
        try {
            const response = await api.put(`/v1/patients/${patientId}`, patientData)
            await fetchPatients()
            return response.data
        } catch (error) {
            console.error("Erreur lors de la mise à jour du patient:", error)
            throw error
        }
    }

    // Recherche patients
    const searchPatients = async (searchParams) => {
        try {
            const response = await api.get('/v1/patients/search', { params: searchParams })
            patients.value = response.data.data
            return response.data
        } catch (error) {
            console.error("Erreur lors de la recherche des patients:", error)
            throw error
        }
    }

    // Détails patient
    const getPatientDetails = async (patientId) => {
        try {
            const response = await api.get(`/v1/patients/${patientId}`)
            currentPatient.value = response.data.data
            return response.data
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du patient:", error)
            throw error
        }
    }

    // Supprimer patient
    const deletePatient = async (patientId) => {
        try {
            const response = await api.delete(`/v1/patients/${patientId}`)
            await fetchPatients()
            return response.data
        } catch (error) {
            console.error("Erreur lors de la suppression du patient:", error)
            throw error
        }
    }

    return {
        patients,
        currentPatient,
        loading,
        message,
        fetchPatients,
        createPatient,
        updatePatient,
        searchPatients,
        getPatientDetails,
        deletePatient
    }
}