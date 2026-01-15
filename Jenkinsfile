pipeline {
    agent any
    options { timestamps() }

    stages {
        stage('Checkout') { steps { checkout scm } }

        stage('Prepare Reports Directory') {
            steps {
                echo 'Preparing reports directories...'
                bat 'if not exist reports mkdir reports'
                bat 'if not exist reports\\playwright mkdir reports\\playwright'
                bat 'if not exist reports\\selenium mkdir reports\\selenium'
                bat 'if not exist reports\\robot mkdir reports\\robot'
            }
        }

        stage('Install Node.js Dependencies') { steps { bat 'npm install' } }
        stage('Install Playwright Browsers') { steps { bat 'npx playwright install' } }

        stage('Run Playwright Tests') {
            steps {
                echo 'Running Playwright tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'npx playwright test --reporter=html,junit --reporter=junit:reports\\playwright\\playwright-results.xml'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/playwright/playwright-results.xml'
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
                echo 'Running Selenium tests'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py run_tests.py'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/selenium/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/selenium/selenium-results.xml'
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                echo 'Running Robot Framework tests'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py -m robot --outputdir reports\\robot --xunit reports\\robot\\xunit.xml robot_tests/'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/robot/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/robot/xunit.xml'
                }
            }
        }

        stage('Print Test Summary') {
            steps {
                echo '================ TEST SUMMARY ================'
                echo 'Playwright:'
                bat 'dir reports\\playwright'
                echo 'Selenium:'
                bat 'type reports\\selenium\\selenium-results.xml || echo No selenium results'
                echo 'Robot:'
                bat 'type reports\\robot\\xunit.xml || echo No robot results'
                echo '=============================================='
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. All reports are in reports/ directory.'
        }
    }
}
