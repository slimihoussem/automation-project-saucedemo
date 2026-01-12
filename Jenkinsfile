pipeline {
    agent any

    stages {
        stage('Vérification des outils') {
            steps {
                bat '''
                    echo "📋 Vérification des outils..."
                    node --version
                    npm --version
                '''
            }
        }

        stage('Checkout du code') {
            steps {
                checkout scm
            }
        }

        stage('Installation des dépendances') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Installation de Playwright (tous les navigateurs)') {
            steps {
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Exécution des tests (Chromium uniquement)') {
            steps {
                bat '''
                    echo "🧪 Lancement des tests sur saucedemo.com..."
                    npx playwright test --reporter=html --output=playwright-report --project=chromium
                '''
            }
        }

        stage('Publication du rapport') {
            steps {
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Rapport Playwright - SauceDemo',
                    alwaysLinkToLastBuild: true,
                    keepAll: true
                ])
                
                // Archiver les artefacts
                archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "🏁 Pipeline terminé"
        }
        success {
            echo "✅ Tous les tests ont réussi !"
        }
        failure {
            echo "❌ Certains tests ont échoué"
            // Archiver les logs d'erreur
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
    }
}
