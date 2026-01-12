pipeline {
    agent any

    environment {
        // Utiliser le NodeJS déjà installé
        BASE_URL = 'http://localhost:8080'
        CI = 'true'
    }

    stages {
        stage('Vérification de NodeJS') {
            steps {
                bat """
                    echo "✅ NodeJS version:"
                    node --version
                    echo "✅ NPM version:"
                    npm --version
                """
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/slimihoussem/automation-project-saucedemo/',
                        credentialsId: 'github_cred'
                    ]]
                ])
                
                // Afficher le contenu du répertoire pour vérifier
                bat 'dir'
            }
        }

        stage('Installation des dépendances') {
            steps {
                script {
                    // Vérifier si package.json existe
                    if (fileExists('package.json')) {
                        bat 'npm ci'
                    } else {
                        error('❌ Fichier package.json non trouvé !')
                    }
                }
            }
        }

        stage('Installation de Playwright') {
            steps {
                bat """
                    echo "🎭 Installation des navigateurs Playwright..."
                    npx playwright install --with-deps chromium
                """
            }
        }

        stage('Vérification de localhost:8080') {
            steps {
                bat """
                    echo "🔍 Vérification de la disponibilité de l'application..."
                    timeout /t 5
                    curl -f http://localhost:8080 || echo "⚠️  L'application n'est pas encore démarrée"
                """
            }
        }

        stage('Exécution des tests') {
            steps {
                bat """
                    echo "🧪 Lancement des tests Playwright..."
                    set BASE_URL=http://localhost:8080
                    npx playwright test --reporter=html,line --output=playwright-report
                """
            }
        }

        stage('Génération du rapport') {
            steps {
                bat """
                    echo "📊 Génération du rapport..."
                    npx playwright show-report playwright-report || echo "Le rapport est généré"
                """
                
                // Publier le rapport HTML
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Rapport Playwright',
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
            // Capturer les logs de sortie
            bat 'dir playwright-report /s 2>nul || echo "Aucun rapport généré"'
        }
        success {
            echo "✅ Tous les tests ont réussi !"
            // Archiver également les résultats
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
        failure {
            echo "❌ Certains tests ont échoué !"
            // Archiver les screenshots en cas d'échec
            archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*', allowEmptyArchive: true
        }
    }
}
