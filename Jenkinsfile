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

        stage('Génération et archivage du rapport') {
            steps {
                bat '''
                    echo "📊 Génération du rapport..."
                    if exist playwright-report (
                        echo "✅ Rapport généré avec succès"
                        dir playwright-report
                    ) else (
                        echo "⚠️  Aucun rapport généré"
                    )
                '''
                
                // Alternative au plugin HTML Publisher
                archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                
                // Stocker le rapport comme artefact
                stash name: 'playwright-report', includes: 'playwright-report/**/*'
            }
        }
    }

    post {
        always {
            echo "🏁 Pipeline terminé"
            
            script {
                // Vérifier si le rapport existe
                if (fileExists('playwright-report/index.html')) {
                    echo "📄 Rapport disponible dans les artefacts"
                    // Vous pouvez aussi envoyer un email avec le lien
                    emailext (
                        subject: "Rapport Playwright - Build ${env.BUILD_NUMBER}",
                        body: "Les tests ont été exécutés. Le rapport est disponible en pièce jointe.",
                        attachmentsPattern: 'playwright-report/**/*',
                        to: 'votre@email.com'
                    )
                }
            }
        }
        success {
            echo "✅ Tous les tests ont réussi !"
        }
        failure {
            echo "❌ Certains tests ont échoué"
            // Archiver aussi les logs d'erreur
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
    }
}
