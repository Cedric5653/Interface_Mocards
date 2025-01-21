<template>
    <div class="reset-password-container">
        <div class="card reset-password-card">
            <div class="card-header bg-primary text-white text-center">
                <h4 class="mb-0">
                    <i class="fas fa-key me-2"></i>
                    Réinitialisation du mot de passe
                </h4>
            </div>

            <div class="card-body">
                <div v-if="errorMessage" 
                     class="alert alert-danger alert-dismissible fade show">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    {{ errorMessage }}
                    <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="mb-3">
                        <label class="form-label required">Nouveau mot de passe</label>
                        <div class="input-group">
                            <input 
                                :type="showPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="formData.password"
                                :class="{ 'is-invalid': errors.password }"
                                required
                            >
                            <button 
                                type="button" 
                                class="btn btn-outline-secondary"
                                @click="showPassword = !showPassword"
                            >
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                            <div class="invalid-feedback">{{ errors.password }}</div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label required">Confirmer le mot de passe</label>
                        <div class="input-group">
                            <input 
                                :type="showConfirmPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="formData.password_confirmation"
                                :class="{ 'is-invalid': errors.password_confirmation }"
                                required
                            >
                            <button 
                                type="button" 
                                class="btn btn-outline-secondary"
                                @click="showConfirmPassword = !showConfirmPassword"
                            >
                                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                            <div class="invalid-feedback">{{ errors.password_confirmation }}</div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary w-100"
                        :disabled="loading"
                    >
                        <span class="spinner-border spinner-border-sm me-2" v-if="loading"></span>
                        Réinitialiser le mot de passe
                    </button>
                </form>
            </div>

            <div class="card-footer text-center">
                <router-link to="/login" class="text-decoration-none">
                    Retour à la connexion
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const { resetPassword, loading } = useAuth();
const toast = useToast();

const formData = ref({
    email: '',
    token: '',
    password: '',
    password_confirmation: ''
});

const errors = ref({});
const errorMessage = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleSubmit = async () => {
    try {
        errors.value = {};
        errorMessage.value = '';

        // Validation
        if (formData.value.password.length < 8) {
            errors.value.password = "Le mot de passe doit contenir au moins 8 caractères";
            return;
        }

        if (formData.value.password !== formData.value.password_confirmation) {
            errors.value.password_confirmation = "Les mots de passe ne correspondent pas";
            return;
        }

        const response = await resetPassword(formData.value);

        if (response.status === 'success') {
            toast.success("Mot de passe réinitialisé avec succès");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            errorMessage.value = error.response?.data?.message || 
                               "Erreur lors de la réinitialisation du mot de passe";
        }
        toast.error(errorMessage.value);
    }
};

onMounted(() => {
    // Récupérer le token et l'email depuis l'URL
    formData.value.token = route.query.token;
    formData.value.email = route.query.email;

    if (!formData.value.token || !formData.value.email) {
        errorMessage.value = "Lien de réinitialisation invalide";
        toast.error(errorMessage.value);
    }
});
</script>

<style scoped>
.reset-password-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    padding: 1rem;
}

.reset-password-card {
    width: 100%;
    max-width: 400px;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}
</style>