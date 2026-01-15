pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        VENV_DIR = "venv"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =======================
           PLAYWRIGHT
        ======================= */

        stage('Install Node.js Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo 'Installing Playwright browsers...'
                bat 'npx playwright install'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                echo 'Running Playwright tests...'
                bat 'npx playwright test --reporter=html'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                }
            }
        }

        /* =======================
           SELENIUM (Python)
        ======================= */

        stage('Setup Python Environment') {
            steps {
                echo 'Setting up Python virtual environment...'
                bat '''
                    py -m venv %VENV_DIR%
                    call %VENV_DIR%\\Scripts\\activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium tests...'
                bat '''
                    call %VENV_DIR%\\Scripts\\activate
                    pytest selenium_tests
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'selenium_tests/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo '✅ Playwright + Selenium tests passed'
        }
        failure {
            echo '❌ One or more test stages failed'
        }
        always {
            echo 'Pipeline finished'
        }
    }
}
