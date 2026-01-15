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

        // ---------------- NODE / Playwright ----------------
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
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Playwright tests...'
                    bat 'npx playwright test --reporter=html,junit --output=reports/playwright'
                }
            }
            post {
                always {
                    echo 'Archiving Playwright artifacts...'
                    archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true

                    echo 'Publishing Playwright JUnit results...'
                    junit allowEmptyResults: true, testResults: 'reports/playwright/junit-results/*.xml'
                }
            }
        }

        // ---------------- PYTHON / Selenium ----------------
        stage('Install Python Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                bat 'py -m pip install --upgrade pip'
                bat 'py -m pip install -r requirements.txt'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Selenium tests...'
                    bat 'cd selenium_tests && py -m pytest --junitxml=../reports/selenium/results.xml'
                }
            }
            post {
                always {
                    echo 'Archiving Selenium artifacts...'
                    archiveArtifacts artifacts: 'reports/selenium/**', allowEmptyArchive: true

                    echo 'Publishing Selenium JUnit results...'
                    junit allowEmptyResults: true, testResults: 'reports/selenium/results.xml'
                }
            }
        }

        // ---------------- PYTHON / Robot Framework ----------------
        stage('Run Robot Framework Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Robot Framework tests...'
                    bat 'cd robot_tests && py -m robot --outputdir ../reports/robot .'
                }
            }
            post {
                always {
                    echo 'Archiving Robot Framework artifacts...'
                    archiveArtifacts artifacts: 'reports/robot/**', allowEmptyArchive: true

                    echo 'Publishing Robot Framework JUnit results...'
                    junit allowEmptyResults: true, testResults: 'reports/robot/output.xml'
                }
            }
        }
    }

    post {
        success {
            echo '✅ All stages completed successfully (tests may still have failed individually)'
        }
        failure {
            echo '❌ One or more stages failed. Check reports/ directory and JUnit results.'
        }
        always {
            echo 'Pipeline finished. All reports are in reports/ directory.'
        }
    }
}
