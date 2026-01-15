pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports/playwright'
        SELENIUM_REPORT_DIR  = 'reports/selenium'
        ROBOT_REPORT_DIR     = 'reports/robot'
        PLAYWRIGHT_STAGE_RESULT = 'NOT RUN'
        SELENIUM_STAGE_RESULT = 'NOT RUN'
        ROBOT_STAGE_RESULT = 'NOT RUN'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Reports Directory') {
            steps {
                echo 'Preparing reports directories...'
                bat 'if not exist reports mkdir reports'
                bat 'if not exist %PLAYWRIGHT_REPORT_DIR% mkdir %PLAYWRIGHT_REPORT_DIR%'
                bat 'if not exist %SELENIUM_REPORT_DIR% mkdir %SELENIUM_REPORT_DIR%'
                bat 'if not exist %ROBOT_REPORT_DIR% mkdir %ROBOT_REPORT_DIR%'
            }
        }

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
                script {
                    echo 'Running Playwright tests...'
                    try {
                        bat """
                        npx playwright test ^
                        --reporter=list,junit ^
                        --output=%PLAYWRIGHT_REPORT_DIR%
                        """
                        env.PLAYWRIGHT_STAGE_RESULT = 'PASS'
                    } catch (Exception e) {
                        env.PLAYWRIGHT_STAGE_RESULT = 'FAIL'
                        echo "Playwright tests failed: ${e}"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT_DIR}/**", allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: "${PLAYWRIGHT_REPORT_DIR}/junit.xml"
                }
            }
        }

        stage('Install Python Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                bat 'py -m pip install --upgrade pip'
                bat 'py -m pip install -r requirements.txt'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                script {
                    echo 'Running Selenium tests...'
                    try {
                        // Explicitly target the test file(s)
                        bat 'py -m pytest selenium_tests/test_TestConnexionError.py --junitxml=reports/selenium/selenium-results.xml'
                        env.SELENIUM_STAGE_RESULT = 'PASS'
                    } catch (Exception e) {
                        env.SELENIUM_STAGE_RESULT = 'FAIL'
                        echo "Selenium tests failed: ${e}"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${SELENIUM_REPORT_DIR}/**", allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: "${SELENIUM_REPORT_DIR}/selenium-results.xml"
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                script {
                    echo 'Running Robot Framework tests...'
                    try {
                        bat """
                        py -m robot ^
                        --outputdir ${ROBOT_REPORT_DIR}/output ^
                        --xunit ${ROBOT_REPORT_DIR}/xunit.xml ^
                        robot_tests/
                        """
                        env.ROBOT_STAGE_RESULT = 'PASS'
                    } catch (Exception e) {
                        env.ROBOT_STAGE_RESULT = 'FAIL'
                        echo "Robot Framework tests failed: ${e}"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${ROBOT_REPORT_DIR}/**", allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: "${ROBOT_REPORT_DIR}/xunit.xml"
                }
            }
        }

        stage('Print Test Summary') {
            steps {
                echo '=================== TEST SUMMARY ===================='
                script {
                    echo "- Playwright:      ${env.PLAYWRIGHT_STAGE_RESULT}"
                    echo "- Selenium:        ${env.SELENIUM_STAGE_RESULT}"
                    echo "- Robot Framework: ${env.ROBOT_STAGE_RESULT}"
                }
                echo '====================================================='
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline finished successfully'
        }
        failure {
            echo '❌ Pipeline finished with failures'
        }
        always {
            echo 'Pipeline finished. Check reports/ directory for details.'
        }
    }
}
