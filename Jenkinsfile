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
                bat 'docker build -t playwright-saucedemo .'
            }
        }

        stage('Run Playwright Tests (Chromium)') {
            steps {
                bat '''
                docker run --rm ^
                  -v "%cd%/reports:/app/reports" ^
                  -v "%cd%/test-results:/app/test-results" ^
                  playwright-saucedemo
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Playwright Chromium tests passed"
        }
        failure {
            echo "❌ Playwright Chromium tests failed"
        }
    }
}
