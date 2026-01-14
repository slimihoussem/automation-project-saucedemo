pipeline {
    agent any

    environment {
        // Python virtual environment folder
        VENV_DIR = "${WORKSPACE}/venv"
    }

    options {
        // Keep build logs and artifacts for 30 days
        buildDiscarder(logRotator(daysToKeepStr: '30'))
        timestamps()
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
                sh 'python -m venv ${VENV_DIR}'
                echo 'Installing Python dependencies...'
                sh '''
                    source ${VENV_DIR}/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Install Node.js Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Selenium & Robot Tests') {
            steps {
                echo 'Running Selenium tests...'
                sh '''
                    source ${VENV_DIR}/bin/activate
                    pytest selenium_tests --junitxml=test-results/selenium-results.xml
                '''

                echo 'Running Robot Framework tests...'
                sh '''
                    source ${VENV_DIR}/bin/activate
                    robot --outputdir test-results/ robot_tests/
                '''
            }
            post {
                always {
                    echo 'Archiving Selenium and Robot Framework test results...'
                    junit 'test-results/*.xml'
                    archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                echo 'Running Playwright tests...'
                sh 'npx playwright install'
                sh 'npx playwright test --reporter=html'
            }
            post {
                always {
                    echo 'Archiving Playwright test results...'
                    archiveArtifacts artifacts: 'playwright_tests/test-results/**', allowEmptyArchive: true
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
