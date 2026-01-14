pipeline {
    agent any

    environment {
        VENV_DIR = "${WORKSPACE}\\venv"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Setup Python Environment') {
            steps {
                echo 'Creating Python virtual environment...'
                bat "python -m venv %VENV_DIR%"
                echo 'Installing Python dependencies...'
                bat """
                    call %VENV_DIR%\\Scripts\\activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                """
            }
        }

        stage('Install Node.js Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm install'
            }
        }

        stage('Run Selenium & Robot Tests') {
            steps {
                echo 'Running Selenium tests...'
                bat """
                    call %VENV_DIR%\\Scripts\\activate
                    pytest selenium_tests --junitxml=test-results\\selenium-results.xml
                """
                
                echo 'Running Robot Framework tests...'
                bat """
                    call %VENV_DIR%\\Scripts\\activate
                    robot --outputdir test-results\\ robot_tests
                """
            }
            post {
                always {
                    junit 'test-results/*.xml'
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                echo 'Running Playwright tests...'
                bat 'npx playwright install'
                bat 'npx playwright test --reporter=html'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'playwright_tests\\test-results/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'All tests passed!'
        }
        failure {
            echo 'Some tests failed.'
        }
    }
}
