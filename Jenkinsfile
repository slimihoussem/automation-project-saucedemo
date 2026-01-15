pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PYTHON_CMD = 'py'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =========================
           PLAYWRIGHT
        ========================== */
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
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                }
            }
        }

        /* =========================
           SELENIUM (SCRIPT MODE)
        ========================== */
        stage('Install Python Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                bat '''
                    %PYTHON_CMD% -m pip install --upgrade pip
                    %PYTHON_CMD% -m pip install -r requirements.txt
                '''
            }
        }

        stage('Run Selenium Tests (Script Mode)') {
            steps {
                echo 'Running Selenium tests (Python script)...'
                bat '''
                    cd selenium_tests
                    %PYTHON_CMD% TestConnexionError.py
                '''
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
