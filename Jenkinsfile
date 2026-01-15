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
                        bat """
                        npx playwright test ^
                        --reporter=list,junit ^
                        --output=%PLAYWRIGHT_REPORT_DIR%
                        """
                    } catch (Exception e) {
                        echo "Playwright tests failed"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT_DIR}/**", allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: "${PLAYWRIGHT_REPORT_DIR}/**/junit.xml"
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
                    try {
                        echo 'Running Selenium tests...'
                        bat 'py -m pytest selenium_tests/test_TestConnexionError.py --junitxml=reports/selenium/selenium-results.xml'
                    } catch (Exception e) {
                        echo "Selenium tests failed"
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
                        bat """
                        py -m robot ^
                        --outputdir ${ROBOT_REPORT_DIR}/output ^
                        --xunit ${ROBOT_REPORT_DIR}/output/xunit.xml ^
                        robot_tests/
                        """
                    } catch (Exception e) {
                        echo "Robot Framework tests failed"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${ROBOT_REPORT_DIR}/**", allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: "${ROBOT_REPORT_DIR}/output/xunit.xml"
                }
            }
        }

        stage('Print Test Summary') {
            steps {
                script {
                    echo '=================== TEST SUMMARY ===================='

                    // Helper function to parse JUnit XML
                    def parseJUnit = { path ->
                        def summary = []
                        if (fileExists(path)) {
                            def xml = readFile(path)
                            def parser = new XmlSlurper().parseText(xml)
                            parser.testsuite.testcase.each { tc ->
                                def name = tc.@name.toString()
                                def status = tc.failure.size() > 0 ? 'FAIL' : 'PASS'
                                summary << [name: name, status: status]
                            }
                        }
                        return summary
                    }

                    // Playwright
                    def pw_tests = parseJUnit("${PLAYWRIGHT_REPORT_DIR}/**/junit.xml")
                    echo "Playwright:"
                    if (pw_tests.isEmpty()) {
                        echo "  - No tests executed"
                    } else {
                        pw_tests.each { t -> echo "  - ${t.name}: ${t.status}" }
                    }

                    // Selenium
                    def selenium_tests = parseJUnit("${SELENIUM_REPORT_DIR}/selenium-results.xml")
                    echo "Selenium:"
                    if (selenium_tests.isEmpty()) {
                        echo "  - No tests executed"
                    } else {
                        selenium_tests.each { t -> echo "  - ${t.name}: ${t.status}" }
                    }

                    // Robot Framework
                    def robot_tests = parseJUnit("${ROBOT_REPORT_DIR}/output/xunit.xml")
                    echo "Robot Framework:"
                    if (robot_tests.isEmpty()) {
                        echo "  - No tests executed"
                    } else {
                        robot_tests.each { t -> echo "  - ${t.name}: ${t.status}" }
                    }

                    echo '====================================================='
                }
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
