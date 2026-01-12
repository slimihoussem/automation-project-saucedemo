pipeline {
    agent any

    environment {
        // Node.js
        NODE_HOME = tool name: 'NodeJS_18', type: 'NodeJS'
        PATH = "${env.NODE_HOME}/bin:${env.PATH}"
        // Python virtualenv
        VENV = "${WORKSPACE}/venv"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "🔄 Checkout du code source"
                checkout scm
            }
        }

        stage('Setup Python & Install Requirements') {
            steps {
                echo "🐍 Création du virtualenv Python et installation des dépendances"
                sh """
                    python3 -m venv ${VENV}
                    source ${VENV}/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                """
            }
        }

        stage('Install Node & Playwright') {
            steps {
                echo "⚙️ Installation des dépendances Node.js et Playwright"
                sh """
                    npm install
                    npx playwright install
                """
            }
        }

        stage('Run Playwright Tests') {
            steps {
                echo "🎭 Exécution des tests Playwright"
                sh """
                    npx playwright test --reporter=html --output=reports/playwright
                """
            }
        }

        stage('Publish Report') {
            steps {
                echo "📄 Publication du rapport HTML"
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
            echo "❌ Certains tests ont échoué !"
        }
    }
}
