<template>
    <div class="forgot-password-container">
        <div class="card forgot-password-card">
            <div class="card-header bg-primary text-white text-center">
                <h4 class="mb-0">
                    <i class="fas fa-lock-open me-2"></i>
                    Mot de passe oublié
                </h4>
            </div>

            <div class="card-body">
                <!-- Message d'erreur -->
                <div v-if="errorMessage" 
                     class="alert alert-danger alert-dismissible fade show">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    {{ errorMessage }}
                    <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                </div>

                <!-- Message de succès -->
                <div v-if="successMessage"
                     class="alert alert-success alert-dismissible fade show">
                    <i class="fas fa-check-circle me-2"></i>
                    {{ successMessage }}
                    <button type="button" class="btn-close" @click="successMessage = ''"></button>
                </div>

                <form @submit.prevent="handleSubmit">
                    <div class="mb-4">
                        <label class="form-label required">Email</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-envelope"></i>
                            </span>
                            <input 
                                type="email"
                                class="form-control"
                                v-model="email"
                                :class="{ 'is-invalid': errors.email }"
                                required
                                placeholder="Entrez votre email"
                            >
                            <div class="invalid-feedback">{{ errors.email }}</div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary w-100"
                        :disabled="loading"
                    >
                        <span class="spinner-border spinner-border-sm me-2" v-if="loading"></span>
                        Envoyer le lien de réinitialisation
                    </button>
                </form>
            </div>

            <div class="card-footer text-center">
                <router-link to="/login" class="text-decoration-none">
                    <i class="fas fa-arrow-left me-2"></i>
                    Retour à la connexion
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'vue-toastification';

const router = useRouter();
const { forgotPassword, loading } = useAuth();
const toast = useToast();

const email = ref('');
const errors = ref({});
const errorMessage = ref('');
const successMessage = ref('');

const handleSubmit = async () => {
    try {
        errors.value = {};
        errorMessage.value = '';
        successMessage.value = '';

        // Validation basique de l'email
        if (!email.value) {
            errors.value.email = "L'email est requis";
            return;
        }

        const response = await forgotPassword(email.value);
        
        if (response.status === 'success') {
            successMessage.value = "Un email de réinitialisation a été envoyé si l'adresse existe.";
            toast.success(successMessage.value);
            
            // Redirection après 3 secondes
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
        } else {
            errorMessage.value = error.response?.data?.message || "Une erreur est survenue";
        }
        toast.error(errorMessage.value);
    }
};
</script>

<style scoped>
.forgot-password-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    padding: 1rem;
}

.forgot-password-card {
    width: 100%;
    max-width: 400px;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.required::after {
    content: '*';
    color: red;
    margin-left: 4px;
}

.input-group-text {
    background-color: #f8f9fa;
}

.input-group-text i {
    width: 16px;
}

@media (max-width: 576px) {
    .forgot-password-card {
        margin: 1rem;
    }
}
</style>