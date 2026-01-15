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
                    bat 'npx playwright test --reporter=html --output=reports/playwright'
                }
                archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
                junit 'reports/playwright/*.xml'
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
                    // Run your self-contained test
                    bat 'py -c "from selenium_tests.test_TestConnexionError import main; main()"'
                }
                archiveArtifacts artifacts: 'reports/selenium/**', allowEmptyArchive: true
                junit 'reports/selenium/selenium-results.xml'
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                echo 'Running Robot Framework tests...'
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    bat 'py -m robot --outputdir reports\\robot\\output --xunit reports\\robot\\xunit.xml robot_tests/'
                }
                archiveArtifacts artifacts: 'reports/robot/**', allowEmptyArchive: true
                junit 'reports/robot/xunit.xml'
            }
        }

        stage('Print Test Summary') {
            steps {
                echo '================ TEST STATISTICS ================'
                echo 'All results are in reports/ directory'
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
            echo 'Pipeline finished. Check reports/ for details.'
        }
    }
}
