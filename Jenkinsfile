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
                echo 'Running Playwright tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat """
                    npx playwright test ^
                    --reporter=list,junit ^
                    --output=%PLAYWRIGHT_REPORT_DIR%
                    """
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
                echo 'Running Selenium tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py -m pytest selenium_tests/test_TestConnexionError.py --junitxml=reports/selenium/selenium-results.xml'
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
                    py -m robot ^
                    --outputdir ${ROBOT_REPORT_DIR}/output ^
                    --xunit ${ROBOT_REPORT_DIR}/output/xunit.xml ^
                    robot_tests/
                    """
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: "${ROBOT_REPORT_DIR}/**", allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: "${ROBOT_REPORT_DIR}/output/xunit.xml"
                }
            }
        }

        stage('Final Test Summary') {
            steps {
                script {
                    def summary = [:]

                    // Function to parse JUnit XML and return test results map
                    def parseJUnitXml = { path ->
                        def results = []
                        if (fileExists(path)) {
                            def xml = readFile(path)
                            def matcher = xml =~ /<testcase name="([^"]+)" classname="[^"]+"[^>]*>(?:(<failure|<error).*?)?<\/testcase>/
                            matcher.each { m ->
                                def name = m[1]
                                def status = (m[2]) ? 'FAIL' : 'PASS'
                                results << [name, status]
                            }
                        }
                        return results
                    }

                    summary['Playwright'] = parseJUnitXml("${PLAYWRIGHT_REPORT_DIR}/junit.xml")
                    summary['Selenium'] = parseJUnitXml("${SELENIUM_REPORT_DIR}/selenium-results.xml")
                    summary['Robot Framework'] = parseJUnitXml("${ROBOT_REPORT_DIR}/output/xunit.xml")

                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Check reports/ directory for details.'
        }
    }
}
