pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports/playwright'
        SELENIUM_REPORT_DIR  = 'reports/selenium'
        ROBOT_REPORT_DIR     = 'reports/robot'
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
                    try {
                        echo 'Running Playwright tests...'
                        bat 'npx playwright test --reporter=list,junit --output=%PLAYWRIGHT_REPORT_DIR%'
                        currentBuild.description = (currentBuild.description ?: '') + "Playwright: PASS; "
                        env.PLAYWRIGHT_STAGE_RESULT = 'PASS'
                    } catch (Exception e) {
                        currentBuild.description = (currentBuild.description ?: '') + "Playwright: FAIL; "
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
                script {
                    try {
                        echo 'Running Selenium tests...'
                        // Run all .py files in selenium_tests/ with pytest and JUnit XML output
                        bat 'py -m pytest selenium_tests/ --junitxml=%SELENIUM_REPORT_DIR%/selenium-results.xml'
                        currentBuild.description = (currentBuild.description ?: '') + "Selenium: PASS; "
                        env.SELENIUM_STAGE_RESULT = 'PASS'
                    } catch (Exception e) {
                        currentBuild.description = (currentBuild.description ?: '') + "Selenium: FAIL; "
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
                script {
                    try {
                        echo 'Running Robot Framework tests...'
                        bat "py -m robot --outputdir ${ROBOT_REPORT_DIR}/output --xunit ${ROBOT_REPORT_DIR}/xunit.xml robot_tests/"
                        currentBuild.description = (currentBuild.description ?: '') + "Robot: PASS; "
                        env.ROBOT_STAGE_RESULT = 'PASS'
                    } catch (Exception e) {
                        currentBuild.description = (currentBuild.description ?: '') + "Robot: FAIL; "
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
                script {
                    echo "- Playwright:      ${env.PLAYWRIGHT_STAGE_RESULT ?: 'NOT EXECUTED'}"
                    echo "- Selenium:        ${env.SELENIUM_STAGE_RESULT ?: 'NOT EXECUTED'}"
                    echo "- Robot Framework: ${env.ROBOT_STAGE_RESULT ?: 'NOT EXECUTED'}"
                }
                echo '======================================================'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Check reports/ directory for details.'
        }
    }
}
