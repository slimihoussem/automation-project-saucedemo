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
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Exécution des tests') {
            steps {
                bat '''
                    echo "🧪 Lancement des tests sur saucedemo.com..."
                    npx playwright test --reporter=html --output=playwright-report --project=chromium
                '''
            }
        }

        stage('Publication du rapport') {
            steps {
                // Version avec allowMissing (plugin HTML Publisher récent)
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Rapport Playwright',
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    allowMissing: true  // <-- AJOUTEZ CE PARAMÈTRE
                ])
                
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
        }
    }
}
