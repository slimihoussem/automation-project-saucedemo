pipeline {
    agent any

    options { timestamps() }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Prepare Reports Directory') {
            steps {
                echo 'Preparing reports directories...'
                bat 'if not exist reports mkdir reports'
                bat 'if not exist reports\\playwright mkdir reports\\playwright'
                bat 'if not exist reports\\selenium mkdir reports\\selenium'
                bat 'if not exist reports\\robot mkdir reports\\robot'
            }
        }

        stage('Install Node.js Dependencies') {
            steps { bat 'npm install' }
        }

        stage('Install Playwright Browsers') {
            steps { bat 'npx playwright install' }
        }

        stage('Run Playwright Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Playwright tests...'
                    bat 'npx playwright test'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/playwright/results.xml'
                }
            }
        }

        stage('Install Python Dependencies') {
            steps {
                bat 'py -m pip install --upgrade pip'
                bat 'py -m pip install -r requirements.txt'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Selenium tests...'
                    bat 'py selenium_tests/run_tests.py'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/selenium/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/selenium/results.xml'
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Robot Framework tests...'
                    bat 'py -m robot --outputdir reports\\robot\\output --xunit reports\\robot\\xunit.xml robot_tests/'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/robot/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/robot/output/output.xml'
                }
            }
        }

        stage('Print Test Summary') {
            steps {
                echo '================ TEST STATISTICS ================'
                script {
                    def parseJUnit = { path ->
                        def total=0, passed=0, failed=0
                        if (fileExists(path)) {
                            def xml = readFile(path)
                            def report = new XmlSlurper().parseText(xml)
                            if(report.testsuite) {
                                total = report.testsuite.@tests.toInteger()
                                failed = report.testsuite.@failures.toInteger() + report.testsuite.@errors.toInteger()
                                passed = total - failed
                            }
                        }
                        return [total: total, passed: passed, failed: failed]
                    }

                    def playwrightStats = parseJUnit('reports/playwright/results.xml')
                    def seleniumStats  = parseJUnit('reports/selenium/results.xml')
                    def robotStats     = parseJUnit('reports/robot/output/output.xml')

                    def totalTests = playwrightStats.total + seleniumStats.total + robotStats.total
                    def totalPassed = playwrightStats.passed + seleniumStats.passed + robotStats.passed
                    def totalFailed = playwrightStats.failed + seleniumStats.failed + robotStats.failed
                    def successRate = totalTests > 0 ? (totalPassed / totalTests * 100).round(1) : 0

                    echo "Playwright: ${playwrightStats.total} tests | Passed: ${playwrightStats.passed} | Failed: ${playwrightStats.failed}"
                    echo "Selenium:  ${seleniumStats.total} tests | Passed: ${seleniumStats.passed} | Failed: ${seleniumStats.failed}"
                    echo "Robot:     ${robotStats.total} tests | Passed: ${robotStats.passed} | Failed: ${robotStats.failed}"
                    echo "--------------------------------------------"
                    echo "TOTAL: ${totalTests} tests | Passed: ${totalPassed} | Failed: ${totalFailed} | Success Rate: ${successRate}%"
                }
                echo '==============================================='
            }
        }

    }

    post {
        always {
            echo 'Pipeline finished. All reports are in reports/ directory.'
        }
    }
}
