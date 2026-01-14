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
                checkout scm
            }
        }

<<<<<<< HEAD
        stage('Setup Python & Install Requirements') {
            steps {
                echo " ~M Création du virtualenv Python et installation des dépendances"
                sh """
                    python3 -m venv ${VENV}
                    source ${VENV}/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                """
            }
        }

=======
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
        stage('Install Node & Playwright') {
            steps {
                sh """
                    npm install
                    npx playwright install
                """
            }
        }

        stage('Run Playwright Tests') {
            steps {
<<<<<<< HEAD
                echo " M-- Exécution des tests Playwright"
=======
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
                sh """
                    npx playwright test --reporter=html --output=reports/playwright
                """
            }
        }

        stage('Publish Report') {
            steps {
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
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline terminé"
            archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
        }
        failure {
            echo "❌ Certains tests Playwright ont échoué !"
        }
    }
}
>>>>>>> 60b2e87ea4e2d4b05c9964ff48850233ae8fa65f
