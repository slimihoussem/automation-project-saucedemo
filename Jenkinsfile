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
                    // Reports go to reports/playwright
                    bat 'npx playwright test --reporter=html,junit --output=reports/playwright'
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

        stage('Run Selenium Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Selenium test: TestConnexionError.py'
                    // Explicit test file and output XML
                    bat 'py -m pytest selenium_tests/TestConnexionError.py --junitxml=reports/selenium/results.xml'
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

        stage('Run Robot Framework Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Robot Framework tests...'
                    // Output goes to reports/robot
                    bat 'py -m robot --outputdir reports/robot robot_tests/'
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
        always {
            echo 'Pipeline finished. All reports are in reports/ directory.'
        }
        success {
            echo '✅ All stages completed successfully (tests may still have failed individually).'
        }
        failure {
            echo '❌ One or more tests failed.'
        }
    }
}
