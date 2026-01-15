pipeline {
    agent any

    options {
        timestamps()
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
                // Windows-safe mkdir commands
                bat 'if not exist reports mkdir reports'
                bat 'if not exist reports\\playwright mkdir reports\\playwright'
                bat 'if not exist reports\\selenium mkdir reports\\selenium'
                bat 'if not exist reports\\robot mkdir reports\\robot'
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
                    bat 'npx playwright test --reporter=html,junit --output=reports\\playwright'
                }
            }
            post {
                always {
                    echo 'Archiving Playwright artifacts...'
                    archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
                    echo 'Publishing Playwright JUnit results...'
                    junit allowEmptyResults: true, testResults: 'reports/playwright/**/*.xml'
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

        stage('Run Selenium Test') {
            steps {
                echo 'Running Selenium test: TestConnexionError.py'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py -m pytest selenium_tests/TestConnexionError.py --junitxml=reports\\selenium\\results.xml'
                }
            }
            post {
                always {
                    echo 'Archiving Selenium artifacts...'
                    archiveArtifacts artifacts: 'reports/selenium/**', allowEmptyArchive: true
                    echo 'Publishing Selenium JUnit results...'
                    junit allowEmptyResults: true, testResults: 'reports/selenium/**/*.xml'
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                echo 'Running Robot Framework tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py -m robot --outputdir reports\\robot robot_tests/'
                }
            }
            post {
                always {
                    echo 'Archiving Robot Framework artifacts...'
                    archiveArtifacts artifacts: 'reports/robot/**', allowEmptyArchive: true
                    echo 'Publishing Robot JUnit results...'
                    junit allowEmptyResults: true, testResults: 'reports/robot/output.xml'
                }
            }
        }

        stage('Print Test Summary') {
            steps {
                echo '================ TEST SUMMARY ================'
                echo 'Playwright test results:'
                bat 'type reports\\playwright\\*.txt || echo No playwright summary file'
                echo 'Selenium test results:'
                bat 'type reports\\selenium\\results.xml || echo No selenium results'
                echo 'Robot Framework test results:'
                bat 'type reports\\robot\\output.xml || echo No robot results'
                echo '=============================================='
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. All reports are in reports/ directory.'
            echo '✅ All stages completed (tests may still have failed individually).'
        }
    }
}
