pipeline {
    agent any

    tools {
        nodejs 'NodeJS_24'  // Assurez-vous que NodeJS est configuré dans Jenkins
    }

    environment {
        // URL de l'application à tester
        BASE_URL = 'http://localhost:8080'
        // Configuration pour Playwright
        PLAYWRIGHT_BROWSERS_PATH = '0'  // Télécharge les navigateurs
        CI = 'true'  // Mode CI activé
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/slimihoussem/automation-project-saucedemo/',
                        credentialsId: 'github_cred'  // Vos credentials GitHub
                    ]]
                ])
                // Vérifier le contenu du répertoire
                bat 'dir'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // Vérifier si package.json existe
                    if (fileExists('package.json')) {
                        bat 'npm ci'  // Utilise npm ci pour des installations propres en CI
                    } else {
                        error('package.json not found!')
                    }
                }
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install --with-deps chromium'
            }
        }

        stage('Run Tests on Localhost:8080') {
            steps {
                script {
                    // Vérifier que localhost:8080 est accessible
                    bat 'timeout 5 && curl -f http://localhost:8080 || echo "⚠️  Localhost:8080 not accessible, but continuing..."'
                    
                    // Exécuter les tests
                    bat """
                        set BASE_URL=http://localhost:8080
                        npx playwright test --reporter=html,line --output=playwright-report
                    """
                }
            }
        }

        stage('Generate and Publish Report') {
            steps {
                // Générer le rapport
                bat 'npx playwright show-report playwright-report || echo "Report generation failed"'
                
                // Publier le rapport HTML
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Test Report',
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
            echo "✅ Pipeline execution completed"
            // Nettoyage
            bat 'rm -rf node_modules || echo "Cleanup done"'
        }
        failure {
            echo "❌ Some tests failed!"
            // Capturer les screenshots en cas d'échec
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
        success {
            echo "🎉 All tests passed successfully!"
        }
    }
}
