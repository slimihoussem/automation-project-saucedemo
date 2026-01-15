pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports/playwright'
        SELENIUM_REPORT_DIR  = 'reports/selenium'
        ROBOT_REPORT_DIR     = 'reports/robot'

        // Variables to store stage results
        PLAYWRIGHT_STAGE_RESULT = 'NOT EXECUTED'
        SELENIUM_STAGE_RESULT   = 'NOT EXECUTED'
        ROBOT_STAGE_RESULT      = 'NOT EXECUTED'
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
                echo 'Running Playwright tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat """
                    npx playwright test --reporter=list,junit --output=%PLAYWRIGHT_REPORT_DIR%
                    """
                    script {
                        env.PLAYWRIGHT_STAGE_RESULT = 'PASS'
                    }
                }
                script {
                    if (currentBuild.currentResult == 'FAILURE') {
                        env.PLAYWRIGHT_STAGE_RESULT = 'FAIL'
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
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py -m pip install --upgrade pip'
                    bat 'py -m pip install -r requirements.txt'
                }
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    // Make sure your selenium runner script is correct
                    bat 'py selenium_tests/run_selenium.py'
                    script {
                        env.SELENIUM_STAGE_RESULT = 'PASS'
                    }
                }
                script {
                    if (currentBuild.currentResult == 'FAILURE') {
                        env.SELENIUM_STAGE_RESULT = 'FAIL'
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
                echo 'Running Robot Framework tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat """
                    py -m robot --outputdir ${ROBOT_REPORT_DIR}/output --xunit ${ROBOT_REPORT_DIR}/xunit.xml robot_tests/
                    """
                    script {
                        env.ROBOT_STAGE_RESULT = 'PASS'
                    }
                }
                script {
                    if (currentBuild.currentResult == 'FAILURE') {
                        env.ROBOT_STAGE_RESULT = 'FAIL'
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
                echo '==================== TEST SUMMARY ===================='
                echo "- Playwright:      ${env.PLAYWRIGHT_STAGE_RESULT}"
                echo "- Selenium:        ${env.SELENIUM_STAGE_RESULT}"
                echo "- Robot Framework: ${env.ROBOT_STAGE_RESULT}"
                echo '======================================================'
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
