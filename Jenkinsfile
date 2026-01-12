pipeline {
    agent any

    environment {
        NODE_HOME = tool name: 'NodeJS_18', type: 'NodeJS'
        PATH = "${env.NODE_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

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
                sh """
                    npx playwright test --reporter=html --output=reports/playwright
                """
            }
        }

        stage('Publish Report') {
            steps {
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
