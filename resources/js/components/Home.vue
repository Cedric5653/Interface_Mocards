

<template>
    <div class="home">
        <div class="hero-section text-center py-5">
            <h1 class="display-4 mb-4">
                <i class="fas fa-heartbeat text-danger"></i>
                Health_Pro
            </h1>
            <p class="lead mb-4">
                Votre plateforme de gestion médicale numérique
            </p>
            <div class="d-flex justify-content-center gap-3">
                <router-link to="/dossier-medical" class="btn btn-primary btn-lg">
                    <i class="fas fa-folder-open me-2"></i>
                    Consulter Dossier Médical
                </router-link>
                <router-link to="/register" class="btn btn-outline-primary btn-lg">
                    <i class="fas fa-user-md me-2"></i>
                    Espace Personnel Médical
                </router-link>
            </div>
        </div>

        <!-- Sections d'informations -->
        <div class="container py-5">
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-user-shield fa-3x text-primary mb-3"></i>
                            <h3>Sécurisé</h3>
                            <p>Vos données médicales sont protégées et sécurisées.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-laptop-medical fa-3x text-primary mb-3"></i>
                            <h3>Numérique</h3>
                            <p>Accédez à vos dossiers médicaux en quelques clics.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-hands-helping fa-3x text-primary mb-3"></i>
                            <h3>Accompagnement</h3>
                            <p>Un suivi médical personnalisé et efficace.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<!-- <p>
    ♥♥♥ Health_Pro ♥♥♥
</p> -->