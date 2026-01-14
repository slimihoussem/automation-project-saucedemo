pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t playwright-chromium .'
            }
        }

        stage('Run Playwright Tests (Chromium)') {
            steps {
                bat '''
                docker run --rm ^
                  -v "%cd%\\reports:/app/reports" ^
                  -v "%cd%\\test-results:/app/test-results" ^
                  playwright-chromium
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
        }
        success {
            echo '✅ Playwright Chromium tests passed'
        }
        failure {
            echo '❌ Playwright Chromium tests failed'
        }
    }
}
