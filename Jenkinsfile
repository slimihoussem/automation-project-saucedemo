pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports\\playwright'
        SELENIUM_REPORT_DIR  = 'reports\\selenium'
        ROBOT_REPORT_DIR     = 'reports\\robot'
    }

    stages {

        stage('Checkout SCM') {
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

        stage('Install Node & Python Dependencies') {
            parallel {
                stage('Node & Playwright') {
                    steps {
                        echo 'Installing Node.js dependencies and Playwright browsers...'
                        bat 'npm install'
                        bat 'npx playwright install'
                    }
                }
                stage('Python Dependencies') {
                    steps {
                        echo 'Installing Python dependencies...'
                        bat 'py -m pip install --upgrade pip'
                        bat 'py -m pip install -r requirements.txt'
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Playwright - Checkout') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Playwright Checkout Tests...'
                            bat """
                            npx playwright test playwright_tests/paiement_process.spec.ts ^
                            --reporter=list,junit ^
                            --output=%PLAYWRIGHT_REPORT_DIR%\\checkout
                            """
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: "%PLAYWRIGHT_REPORT_DIR%\\checkout\\**", allowEmptyArchive: true
                            junit allowEmptyResults: true, testResults: "%PLAYWRIGHT_REPORT_DIR%\\checkout\\junit.xml"
                        }
                    }
                }

                stage('Playwright - Product Filter') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Playwright Product Filter Tests...'
                            bat """
                            npx playwright test playwright_tests/product-filter.spec.ts ^
                            --reporter=list,junit ^
                            --output=%PLAYWRIGHT_REPORT_DIR%\\product-filter
                            """
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: "%PLAYWRIGHT_REPORT_DIR%\\product-filter\\**", allowEmptyArchive: true
                            junit allowEmptyResults: true, testResults: "%PLAYWRIGHT_REPORT_DIR%\\product-filter\\junit.xml"
                        }
                    }
                }

                stage('Selenium Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Selenium Tests...'
                            bat 'py -m pytest selenium_tests/test_TestConnexionError.py --junitxml=%SELENIUM_REPORT_DIR%\\selenium-results.xml'
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: "%SELENIUM_REPORT_DIR%\\**", allowEmptyArchive: true
                            junit allowEmptyResults: true, testResults: "%SELENIUM_REPORT_DIR%\\selenium-results.xml"
                        }
                    }
                }

                stage('Robot Framework Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Robot Framework Tests...'
                            bat """
                            py -m robot ^
                            --outputdir %ROBOT_REPORT_DIR%\\output ^
                            --xunit %ROBOT_REPORT_DIR%\\output\\xunit.xml ^
                            robot_tests/
                            """
                        }
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: "%ROBOT_REPORT_DIR%\\**", allowEmptyArchive: true
                            junit allowEmptyResults: true, testResults: "%ROBOT_REPORT_DIR%\\output\\xunit.xml"
                        }
                    }
                }
            }
        }

        stage('Final Summary') {
            steps {
                echo 'All test stages finished. Check reports directory for details.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}
