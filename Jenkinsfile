pipeline {
    agent any

    options { timestamps() }

    environment { PYTHON_CMD = 'py' }

    stages {
        stage('Checkout') { steps { checkout scm } }

        stage('Install Node.js Dependencies') {
            steps { bat 'npm install' }
        }

        stage('Install Playwright Browsers') {
            steps { bat 'npx playwright install' }
        }

        stage('Run Playwright Tests') {
            steps {
                bat 'npx playwright test --reporter=html,junit'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                    junit 'playwright-report/junit.xml'
                }
            }
        }

        stage('Install Python Dependencies') {
            steps {
                bat '''
                    %PYTHON_CMD% -m pip install --upgrade pip
                    %PYTHON_CMD% -m pip install -r requirements.txt
                '''
            }
        }

        stage('Run Selenium Tests') {
            steps {
                bat '%PYTHON_CMD% -m pytest selenium_tests --junitxml=test-results/selenium_results/results.xml'
            }
            post {
                always {
                    junit 'test-results/selenium_results/results.xml'
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                bat '''
                    cd robot_tests
                    %PYTHON_CMD% -m robot --outputdir ../test-results/robot_results .
                    rebot --outputdir ../test-results/robot_results --xunit ../test-results/robot_results/xunit.xml output.xml
                '''
            }
            post {
                always {
                    junit 'test-results/robot_results/xunit.xml'
                    archiveArtifacts artifacts: 'test-results/robot_results/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        success { echo '✅ All tests passed' }
        failure { echo '❌ One or more tests failed' }
        always { echo 'Pipeline finished' }
    }
}
