

import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import  api  from '@/services/api';
import { useApiResponse } from './useApiResponse';

export function useDashboard() {
    const { user,checkAuth } = useAuth();
    const stats = ref({
        patients: 0,
        consultations: 0,
        rendezVous: 0,
        examens: 0,
        patientsChange: 0,
        consultationsToday: 0,
        weeklyAppointments: 0,
        urgentCases: 0
    });

    const recentActivities = ref([]);
    const upcomingAppointments = ref([]);
    const alerts = ref([]);
    const { loading, message, setApiResponse } = useApiResponse();

   
    
    const authorizedActions = computed(() => {
        const roleName = user.value?.role?.role_name?.toLowerCase() || '';
        return {
            canAddPatient: ['admin', 'médecin'].includes(roleName),
            canAddAppointment: ['admin', 'médecin', 'infirmier'].includes(roleName),
            canViewUrgent: ['admin', 'médecin', 'infirmier', 'secouriste'].includes(roleName),
            canManageDocuments: ['admin', 'médecin'].includes(roleName)
        };
    });
    

    // Stats personnalisées selon le rôle avec gestion d'erreurs améliorée
    const fetchDashboardStats = async () => {
        try {

            // if (!user.value) {
            //     console.warn("Utilisateur non authentifié, attente...");
            //     return;
            // }
            if (!user.value) {
                const authenticated = await checkAuth();
                if (!authenticated) {
                    router.push('/login');
                    return;
                }
            }
            
            const response = await api.get('/v1/dashboard/stats', {
                params: { role: user.value?.role }
            });
            
            // Vérification et traitement des données
            if (response.data?.data) {
                stats.value = {
                    ...stats.value,
                    ...response.data.data
                };
            }
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques:", error);
            setApiResponse({ 
                type: 'error', 
                message: error.response?.data?.message || 'Erreur de chargement des statistiques' 
            });
            // On conserve les anciennes stats en cas d'erreur
            throw error;
        }
    };

    const fetchRecentActivities = async () => {
        try {
            const response = await api.get('/v1/dashboard/activities', {
                params: { role: user.value?.role }
            });
            if (response.data?.data) {
                recentActivities.value = response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des activités:", error);
            setApiResponse({ type: 'error', message: 'Erreur de chargement des activités' });
            throw error;
        }
    };

    const fetchUpcomingAppointments = async () => {
        try {
            const response = await api.get('/v1/dashboard/appointments', {
                params: { role: user.value?.role }
            });
            if (response.data?.data) {
                upcomingAppointments.value = response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des rendez-vous:", error);
            setApiResponse({ type: 'error', message: 'Erreur de chargement des rendez-vous' });
            throw error;
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/v1/dashboard/alerts', {
                params: { role: user.value?.role }
            });
            if (response.data?.data) {
                alerts.value = response.data.data;
            }
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des alertes:", error);
            setApiResponse({ type: 'error', message: 'Erreur de chargement des alertes' });
            throw error;
        }
    };

    return {
        stats,
        recentActivities,
        upcomingAppointments,
        alerts,
        loading,
        message,
        authorizedActions,
        fetchDashboardStats,
        fetchRecentActivities,
        fetchUpcomingAppointments,
        fetchAlerts
    };
}