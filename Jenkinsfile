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
           SELENIUM
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

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium tests (Python script)...'
                bat '''
                    cd selenium_tests
                    %PYTHON_CMD% TestConnexionError.py
                '''
            }
        }

        /* =========================
           ROBOT FRAMEWORK
        ========================== */
        stage('Run Robot Framework Tests') {
            steps {
                echo 'Running Robot Framework tests...'
                bat '''
                    cd robot_tests
                    %PYTHON_CMD% -m robot --outputdir ../test-results/robot_results .
                '''
            }
            post {
                always {
                    // Archive Robot Framework results
                    archiveArtifacts artifacts: 'test-results/robot_results/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success {
            echo '✅ All tests (Playwright + Selenium + Robot) passed'
        }
        failure {
            echo '❌ One or more test stages failed'
        }
        always {
            echo 'Pipeline finished'
        }
    }
}
