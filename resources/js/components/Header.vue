<template>
    <nav class="navbar sticky-top navbar-expand-lg bg-body-tertiary bg-dark border-bottom border-body" data-bs-theme="dark">
        <div class="container-fluid">
            <router-link class="navbar-brand" to="/">
                <i class="fas fa-heartbeat me-2"></i>
                Health_Pro
            </router-link>

            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNavAltMarkup"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <!-- Menu principal -->
                <div class="navbar-nav me-auto">
                    <router-link 
                        v-for="item in publicMenuItems"
                        :key="item.path"
                        class="nav-link"
                        :to="item.path"
                    >
                        {{ item.label }}
                    </router-link>

                    <!-- Menu protégé (si authentifié) -->
                    <template v-if="isAuthenticated">
                        <router-link 
                            v-for="item in protectedMenuItems"
                            :key="item.path"
                            class="nav-link"
                            :to="item.path"
                        >
                            {{ item.label }}
                        </router-link>
                    </template>
                </div>

                <!-- Boutons Auth -->
                <div class="navbar-nav">
                    <template v-if="!isAuthenticated">
                        <router-link to="/login" class="nav-link">
                            <i class="fas fa-sign-in-alt me-1"></i>
                            Connexion
                        </router-link>
                        <router-link to="/register" class="nav-link">
                            <i class="fas fa-user-plus me-1"></i>
                            Inscription
                        </router-link>
                    </template>
                    <template v-else>
                        <div class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
                                <i class="fas fa-user-circle me-1"></i>
                                {{ user?.username }}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <router-link to="/profile" class="dropdown-item">
                                        <i class="fas fa-id-card me-2"></i>
                                        Profil
                                    </router-link>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="#" @click.prevent="logout">
                                        <i class="fas fa-sign-out-alt me-2"></i>
                                        Déconnexion
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue';
import navItems from "@/navbarItems";
import { useAuth } from '@/composables/useAuth';

export default {
    setup() {
        const { user, isAuthenticated, logout } = useAuth();

        const publicMenuItems = computed(() => 
            navItems.filter(item => item.public && !item.hideInNav)
        );

        const protectedMenuItems = computed(() => 
            navItems.filter(item => item.protected && !item.hideInNav)
        );

        return {
            publicMenuItems,
            protectedMenuItems,
            user,
            isAuthenticated,
            logout
        };
    }
};
</script>