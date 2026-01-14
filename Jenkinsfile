<<<<<<< HEAD
<<<<<<< HEAD
      // Python virtualenv
        VENV = "${WORKSPACE}/venv"
=======
pipeline {
    agent any

    environment {
        NODE_HOME = tool name: 'NodeJS_18', type: 'NodeJS'
        PATH = "${env.NODE_HOME}/bin:${env.PATH}"
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
    }

    stages {
        stage('Checkout') {
            steps {
<<<<<<< HEAD
                echo " ~D Checkout du code source"
=======
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
=======
pipeline {
    agent any

    stages {
        stage('Vérification des outils ') {
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
>>>>>>> 1072c9fe42c41e21cafe15cfed7919ecd10c17f6
                checkout scm
            }
        }

<<<<<<< HEAD
<<<<<<< HEAD
        stage('Setup Python & Install Requirements') {
=======
        stage('Installation des dépendances') {
>>>>>>> 1072c9fe42c41e21cafe15cfed7919ecd10c17f6
            steps {
                bat 'npm ci'
            }
        }

<<<<<<< HEAD
=======
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
        stage('Install Node & Playwright') {
            steps {
                sh """
                    npm install
                    npx playwright install
                """
=======
        stage('Installation de Playwright') {
            steps {
                bat 'npx playwright install --with-deps'
>>>>>>> 1072c9fe42c41e21cafe15cfed7919ecd10c17f6
            }
        }

        stage('Exécution des tests') {
            steps {
<<<<<<< HEAD
<<<<<<< HEAD
                echo " M-- Exécution des tests Playwright"
=======
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
                sh """
                    npx playwright test --reporter=html --output=reports/playwright
                """
=======
                bat '''
                    echo "🧪 Lancement des tests sur saucedemo.com..."
                    npx playwright test --reporter=html --output=playwright-report --project=chromium
                '''
>>>>>>> 1072c9fe42c41e21cafe15cfed7919ecd10c17f6
            }
        }

        stage('Publication du rapport') {
            steps {
<<<<<<< HEAD
<<<<<<< HEAD
                echo " ~D Publication du rapport HTML"
                publishHTML([
                    rep
=======
                publishHTML([
                    reportDir: 'reports/playwright',
                    reportFiles: 'index.html',
                    reportName: 'Playwright HTML Report'
                ])
=======
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
>>>>>>> 1072c9fe42c41e21cafe15cfed7919ecd10c17f6
            }
        }
    }

    post {
        always {
<<<<<<< HEAD
            echo "✅ Pipeline terminé"
            archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
        }
        failure {
            echo "❌ Certains tests Playwright ont échoué !"
        }
    }
}
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
=======
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
>>>>>>> 1072c9fe42c41e21cafe15cfed7919ecd10c17f6
