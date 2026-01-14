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
                script {
                    docker.build("playwright-chromium")
                }
            }
        }

        stage('Run Playwright Tests (Chromium)') {
            steps {
                script {
                    docker.image("playwright-chromium").inside {
                        sh 'npx playwright test --project=chromium'
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo '✅ Playwright Chromium tests passed'
        }
        failure {
            echo '❌ Playwright Chromium tests failed'
        }
    }
}
