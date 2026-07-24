#!/bin/bash

# ==============================================================================
# Script de compilation et de lancement global de l'écosystème EduFlex Spring Boot
# ==============================================================================

# 1. Gestion de l'arrêt propre (Trap)
# Cette fonction sera appelée quand on fera Ctrl+C ou quand on tuera le script
cleanup() {
    echo ""
    echo "🛑 Arrêt demandé ! Fermeture de tous les microservices en cours..."
    
    # Désactiver le trap pour éviter la boucle infinie
    trap - SIGINT SIGTERM EXIT
    
    # Tuer tous les processus enfants (jobs en arrière-plan)
    JOBS=$(jobs -p)
    if [ -n "$JOBS" ]; then
        kill -TERM $JOBS 2>/dev/null
    fi
    
    echo "✅ Tous les services ont été arrêtés."
    exit 0
}

# Associe la fonction cleanup aux signaux d'interruption
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Début du déploiement local EduFlex..."
echo "📦 Étape 1 : Compilation du projet (Maven Build)..."

# 2. Build complet du projet multi-modules
mvn clean install -DskipTests
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ Erreur lors de la compilation Maven. Le script va s'arrêter."
    exit 1
fi

echo "✅ Compilation réussie !"
echo "🔄 Étape 2 : Démarrage des microservices en arrière-plan..."

# 3. Lancement des services en arrière-plan
# Chaque commande est lancée avec '&' pour ne pas bloquer le terminal

echo " ⏳ Lancement de eduflex-gateway..."
mvn spring-boot:run -pl eduflex-gateway &

echo " ⏳ Lancement de auth-service..."
mvn spring-boot:run -pl auth-service &

echo " ⏳ Lancement de user-service..."
mvn spring-boot:run -pl user-service &

echo " ⏳ Lancement de course-service..."
mvn spring-boot:run -pl course-service &

echo " ⏳ Lancement de media-service..."
mvn spring-boot:run -pl media-service &

echo " ⏳ Lancement de payment-service..."
mvn spring-boot:run -pl payment-service &

echo " ⏳ Lancement de notification-service..."
mvn spring-boot:run -pl notification-service &

echo " ⏳ Lancement de search-service..."
mvn spring-boot:run -pl search-service &

echo " ⏳ Lancement de analytics-service..."
mvn spring-boot:run -pl analytics-service &

echo " ⏳ Lancement de certificate-service..."
mvn spring-boot:run -pl certificate-service &

echo "================================================================="
echo "🌟 TOUS LES SERVICES SONT EN COURS DE DÉMARRAGE !"
echo "⚠️  Appuyez sur [CTRL+C] à tout moment pour TOUT ARRETER."
echo "================================================================="

# 4. Attendre la fin des processus
# Maintient le script en vie tant que les processus fils tournent.
# Si l'utilisateur fait Ctrl+C, la fonction cleanup() interviendra.
wait
