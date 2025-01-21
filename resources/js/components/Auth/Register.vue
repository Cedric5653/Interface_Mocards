<!-- Register.vue -->
<template>
    <div class="register-container">
        <div class="card register-card">
            <div class="card-header bg-primary text-white text-center">
                <h4 class="mb-0">
                    <i class="fas fa-user-plus me-2"></i>
                    Création de compte
                </h4>
            </div>

            <div class="card-body">
                <!-- Message d'erreur -->
                <div 
                    v-if="errorMessage"
                    class="alert alert-danger alert-dismissible fade show"
                >
                    <i class="fas fa-exclamation-circle me-2"></i>
                    {{ errorMessage }}
                    <button 
                        type="button" 
                        class="btn-close"
                        @click="errorMessage = ''"
                    ></button>
                </div>

                <form @submit.prevent="handleRegister" class="row g-3">
                    <!-- Nom d'utilisateur -->
                    <div class="col-md-6">
                        <label class="form-label required">Nom d'utilisateur</label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="formData.nom"
                            :class="{ 'is-invalid': errors.nom }"
                            required
                        >
                        <div class="invalid-feedback">{{ errors.nom }}</div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label required">Prenom </label>
                        <input 
                            type="text"
                            class="form-control"
                            v-model="formData.prenom"
                            :class="{ 'is-invalid': errors.prenom }"
                            required
                        >
                        <div class="invalid-feedback">{{ errors.prenom }}</div>
                    </div>

                    <!-- Email -->
                    <div class="col-md-6">
                        <label class="form-label required">Email</label>
                        <input 
                            type="email"
                            class="form-control"
                            v-model="formData.email"
                            :class="{ 'is-invalid': errors.email }"
                            required
                        >
                        <div class="invalid-feedback">{{ errors.email }}</div>
                    </div>

                    <!-- Mot de passe -->
                    <div class="col-md-6">
                        <label class="form-label required">Mot de passe</label>
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
                        <div class="form-text" v-if="formData.password">
                            <PasswordStrength :password="formData.password" />
                        </div>
                    </div>

                    <!-- Confirmation mot de passe -->
                    <div class="col-md-6">
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

                    <!-- Rôle -->
                    <div class="col-12">
                        <label class="form-label required">Rôle</label>
                        <select 
                            class="form-select"
                            v-model="formData.role_id"
                            :class="{ 'is-invalid': errors.role_id }"
                            required
                        >
                            <option value="">Sélectionner un rôle</option>
                            <option v-for="role in roles" :key="role.role_id" :value="role.role_id">
                                {{ role.role_name }}
                            </option>
                        </select>
                        <div class="invalid-feedback">{{ errors.role_id }}</div>
                    </div>

                    <!-- Boutons -->
                    <div class="col-12">
                        <hr>
                        <div class="d-flex gap-2 justify-content-between">
                            <router-link to="/login" class="btn btn-outline-secondary">
                                <i class="fas fa-arrow-left me-2"></i>
                                Retour à la connexion
                            </router-link>
                            <button 
                                type="submit" 
                                class="btn btn-primary"
                                :disabled="loading"
                            >
                                <span 
                                    class="spinner-border spinner-border-sm me-2" 
                                    v-if="loading"
                                ></span>
                                Créer le compte
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'vue-toastification';

import PasswordStrength from '@/components/Auth/PasswordStrength.vue';


const router = useRouter();
const toast = useToast();
const { register, loading, fetchRoles, roles} = useAuth();

// États
const formData = ref({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: ''
});
const errorMessage = ref('');
const errors = ref({});
const showPassword = ref(false);
const showConfirmPassword = ref(false);




const showSuccessMessage = (message) => {
    toast.success(message, {
        timeout: 2000,
        position: "top-right",
        icon: "✅"
    });
};

const showErrorMessage = (message) => {
    toast.error(message, {
        timeout: 4000,
        position: "top-right",
        icon: "❌"
    });
};



const handleRegister = async () => {
    try {
        errors.value = {};
        errorMessage.value = '';

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            errors.value = validationErrors;
            showErrorMessage("Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        const response = await register(formData.value);

        if (response.status === 'success') {
            showSuccessMessage("Compte créé avec succès !");
            setTimeout(() => {
                router.push({
                    path: '/login',
                    query: { 
                        registered: 'success',
                        email: formData.value.email 
                    }
                });
            }, 2000);
        } else {
            showErrorMessage(response.message || "Erreur lors de la création du compte");
        }
    } catch (error) {
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors;
            showErrorMessage("Erreur de validation. Veuillez vérifier vos informations.");
        } else {
            errorMessage.value = error.response?.data?.message || "Erreur lors de la création du compte";
            showErrorMessage(errorMessage.value);
        }
    }
};



// Améliorons aussi la validation
const validateForm = () => {
    const validationErrors = {};

    // Validation du nom d'utilisateur
    if (!formData.value.nom?.trim()) {
        validationErrors.nom = "Le nom d'utilisateur est requis";
    } else if (formData.value.nom.length < 3) {
        validationErrors.nom = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.value.email?.trim()) {
        validationErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.value.email)) {
        validationErrors.email = "L'email n'est pas valide";
    }

    // Validation du mot de passe
    if (!formData.value.password) {
        validationErrors.password = "Le mot de passe est requis";
    } else if (formData.value.password.length < 8) {
        validationErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Validation de la confirmation du mot de passe
    if (formData.value.password !== formData.value.password_confirmation) {
        validationErrors.password_confirmation = "Les mots de passe ne correspondent pas";
    }

    // Validation du rôle
    if (!formData.value.role_id) {
        validationErrors.role_id = "Le rôle est requis";
    }

    return validationErrors;
};



// Lifecycle Hooks
onMounted(async () => {
    try {
        await fetchRoles();
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    }
})
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    padding: 1rem;
}

.register-card {
    width: 100%;
    max-width: 800px;
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


.Vue-Toastification__toast {
    padding: 15px 20px;
    min-height: auto;
    border-radius: 8px;
}

.Vue-Toastification__toast--success {
    background-color: #10b981;
}

.Vue-Toastification__toast--error {
    background-color: #ef4444;
}

.Vue-Toastification__toast-body {
    font-size: 14px;
    font-weight: 500;
}


@media (max-width: 768px) {
    .register-card {
        margin: 1rem;
    }

    .btn-group {
        flex-direction: column;
        width: 100%;
    }

    .btn-group .btn {
        width: 100%;
        margin-bottom: 0.5rem;
    }
}
</style>
