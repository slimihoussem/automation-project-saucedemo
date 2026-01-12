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

        stage('Installation de Playwright') {
            steps {
                bat 'npx playwright install chromium'
            }
        }

        stage('Exécution des tests sur saucedemo.com') {
            steps {
                bat '''
                    echo "🧪 Lancement des tests sur saucedemo.com..."
                    npx playwright test --reporter=html --output=playwright-report
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
            // Nettoyage optionnel
            bat 'rmdir /s /q node_modules 2>nul || echo "Nettoyage effectué"'
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
