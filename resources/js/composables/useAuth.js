
import { ref } from 'vue';
import api from '../services/api';
import { useApiResponse } from './useApiResponse';

export function useAuth() {
    const user = ref(null);
    const isAuthenticated = ref(false);
    const roles = ref([]); 
    const errorMessage = ref(''); 
    const { loading, message, setApiResponse } = useApiResponse();

    
    // Modification du fetchRoles dans Register.vue
    const fetchRoles = async () => {
        try {
            // Appel à l'API pour récupérer les rôles
            const response = await api.get('/v1/auth/roles/register');
            roles.value = response.data.data || [];
             
            // Ajouter console.log pour debug
            console.log('Rôles récupérés:', roles.value);
            
            if (!roles.value.length) {
                errorMessage.value = "Aucun rôle disponible";
            }
        } catch (error) {
            console.error("Erreur récupération rôles:", error);
            errorMessage.value = "Erreur lors du chargement des rôles";
        }
    };
   

    const login = async (credentials) => {
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
            
            const response = await api.post('/v1/auth/login', credentials, { headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            });
            
            if (response.data.status === 'success') {
                user.value = response.data.user;
                isAuthenticated.value = true;
                localStorage.setItem('token', response.data.access_token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
                setApiResponse(response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error("Erreur d'authentification:", error);
            setApiResponse(error.response?.data || {
                status: 'error',
                message: error.message
            });
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await api.post('/v1/auth/logout');
            user.value = null;
            isAuthenticated.value = false;
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            throw error;
        }
    };

    // Check Auth Status
    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/v1/auth/user');
            user.value = response.data.data;
            isAuthenticated.value = true;
            return true;
        } catch (error) {
            user.value = null;
            isAuthenticated.value = false;
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            return false;
        }
    };

    // Get User Profile
    const getUserProfile = async (formData) => {
        try {
            const response = await api.get('/v1/auth/user-profile',formData);
            user.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error);
            throw error;
        }
    };

    // Update User Profile
    const updateUserProfile = async (profileData) => {
        try {
            const response = await api.put('/v1/auth/update-user-profile', profileData);
            user.value = response.data.data;
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            throw error;
        }
    };

    const register = async (userData) => {
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

                // Ajout du header Content-Type
                const response = await api.post('/v1/auth/register', userData);

                // Gestion plus détaillée de la réponse
                if (response.data.error) {
                    throw new Error(response.data.error);
                }

                setApiResponse(response.data);
                return response.data;
            } catch (error) {
                const errorResponse = {
                    success: false,
                    code: error.response?.status,
                    body: {
                        error_message: error.response?.data?.message || "Erreur d'inscription",
                        errors: error.response?.data?.errors || {},
                        response_data: null
                    }
                };
                setApiResponse(errorResponse);
                throw error;
            }
        };

        const forgotPassword = async (email) => {
            try {
                const response = await api.post('/v1/auth/forgot-password', { email });
                return response.data;
            } catch (error) {
                console.error('Erreur récupération mot de passe:', error);
                throw error;
            }
        };

    // Réinitialisation du mot de passe
    const resetPassword = async (resetData) => {
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

            const response = await api.post('/v1/auth/reset-password', {
                email: resetData.email,
                token: resetData.token,
                password: resetData.password,
                password_confirmation: resetData.password_confirmation
            });

            if (response.data.status === 'success') {
                setApiResponse(response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Erreur de réinitialisation');
            }
        } catch (error) {
            console.error('Erreur réinitialisation mot de passe:', error);
            const errorResponse = {
                success: false,
                code: error.response?.status,
                body: {
                    error_message: error.response?.data?.message || "Erreur de réinitialisation",
                    errors: error.response?.data?.errors || {},
                    response_data: null
                }
            };
            setApiResponse(errorResponse);
            throw error;
        }
    };


    return {
        user,
        isAuthenticated,
        loading,
        message,
        roles,
        login,
        logout,
        checkAuth,
        getUserProfile,
        updateUserProfile,
        register,
        fetchRoles,
        forgotPassword,
        resetPassword
    };
}