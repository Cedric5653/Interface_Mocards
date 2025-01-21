
<template>
    <div class="password-strength">
        <!-- Indicateur de force -->
        <div class="strength-meter mb-2">
            <div 
                class="strength-bar"
                :style="{ width: `${score * 25}%` }"
                :class="strengthClass"
            ></div>
        </div>

        <!-- Message de force -->
        <div class="strength-text" :class="strengthClass">
            {{ strengthMessage }}
        </div>

        <!-- Liste des critères -->
        <div class="criteria-list mt-2">
            <div 
                v-for="(met, criteria) in criteriaStatus" 
                :key="criteria"
                class="criteria-item"
                :class="{ met }"
            >
                <i :class="met ? 'fas fa-check text-success' : 'fas fa-times text-danger'"></i>
                {{ getCriteriaMessage(criteria) }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    password: {
        type: String,
        required: true
    }
});

// Vérification des critères
const criteriaStatus = computed(() => {
    const password = props.password;
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
});

// Score de force (0-4)
const score = computed(() => {
    return Object.values(criteriaStatus.value).filter(Boolean).length;
});

// Classe CSS basée sur la force
const strengthClass = computed(() => {
    const strengthClasses = {
        0: 'very-weak',
        1: 'weak',
        2: 'medium',
        3: 'strong',
        4: 'very-strong'
    };
    return strengthClasses[score.value] || 'very-weak';
});

// Message de force
const strengthMessage = computed(() => {
    const messages = {
        0: 'Très faible',
        1: 'Faible',
        2: 'Moyen',
        3: 'Fort',
        4: 'Très fort'
    };
    return messages[score.value] || 'Très faible';
});

// Messages des critères
const getCriteriaMessage = (criteria) => {
    const messages = {
        length: 'Au moins 8 caractères',
        uppercase: 'Au moins une majuscule',
        lowercase: 'Au moins une minuscule',
        number: 'Au moins un chiffre',
        special: 'Au moins un caractère spécial'
    };
    return messages[criteria] || '';
};
</script>

<style scoped>
.password-strength {
    font-size: 0.875rem;
}

.strength-meter {
    height: 4px;
    background-color: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
}

.strength-bar {
    height: 100%;
    width: 0;
    transition: width 0.3s ease;
}

/* Classes de force */
.very-weak {
    background-color: #dc3545;
    color: #dc3545;
}

.weak {
    background-color: #ffc107;
    color: #ffc107;
}

.medium {
    background-color: #fd7e14;
    color: #fd7e14;
}

.strong {
    background-color: #20c997;
    color: #20c997;
}

.very-strong {
    background-color: #198754;
    color: #198754;
}

.strength-text {
    font-weight: 500;
    text-align: right;
}

.criteria-list {
    display: grid;
    gap: 0.5rem;
}

.criteria-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
}

.criteria-item.met {
    color: #198754;
}

.criteria-item i {
    width: 16px;
}

@media (max-width: 576px) {
    .criteria-list {
        font-size: 0.8rem;
    }
}
</style>