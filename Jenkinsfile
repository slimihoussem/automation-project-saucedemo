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
                bat 'if not exist reports\\playwright mkdir reports\\playwright'
                bat 'if not exist reports\\selenium mkdir reports\\selenium'
                bat 'if not exist reports\\robot mkdir reports\\robot'
            }
        }

        stage('Install Dependencies') {
            parallel {

                stage('Node & Playwright') {
                    steps {
                        bat 'npm install'
                        bat 'npx playwright install'
                    }
                }

                stage('Python Dependencies') {
                    steps {
                        bat 'py -m pip install --upgrade pip'
                        bat 'py -m pip install -r requirements.txt'
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {

                // ================= PLAYWRIGHT =================

                stage('Playwright - Checkout') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            npx playwright test playwright_tests/paiement_process.spec.ts ^
                            --reporter=junit ^
                            --output=${PLAYWRIGHT_REPORT_DIR}/checkout
                            """
                        }
                    }
                }

                stage('Playwright - Product Filter') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            npx playwright test playwright_tests/product-filter.spec.ts ^
                            --reporter=junit ^
                            --output=${PLAYWRIGHT_REPORT_DIR}/product-filter
                            """
                        }
                    }
                }

                // ================= SELENIUM =================

                stage('Selenium - TestSauceDemo') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat '''
                            py -m pytest selenium_tests/TestSauceDemo.py ^
                            --junitxml=reports/selenium/test-sauce-demo.xml
                            '''
                        }
                    }
                }

                stage('Selenium - Check Products') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat '''
                            py -m pytest selenium_tests/Tests_Check_Products.py ^
                            --junitxml=reports/selenium/test-products.xml
                            '''
                        }
                    }
                }

                // ================= ROBOT FRAMEWORK =================

                stage('Robot Framework Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m robot ^
                            --outputdir ${ROBOT_REPORT_DIR}/output ^
                            --xunit ${ROBOT_REPORT_DIR}/output/xunit.xml ^
                            robot_tests
                            """
                        }
                    }
                }
            }
        }

        stage('Archive Artifacts & Publish Reports') {
            steps {
                echo 'Archiving artifacts and publishing test results...'

                // Playwright Checkout
                archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT_DIR}/checkout/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${PLAYWRIGHT_REPORT_DIR}/checkout/**/junit.xml"

                // Playwright Product Filter
                archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT_DIR}/product-filter/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${PLAYWRIGHT_REPORT_DIR}/product-filter/**/junit.xml"

                // Selenium
                archiveArtifacts artifacts: "${SELENIUM_REPORT_DIR}/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${SELENIUM_REPORT_DIR}/test-sauce-demo.xml"
                junit allowEmptyResults: true, testResults: "${SELENIUM_REPORT_DIR}/test-products.xml"

                // Robot Framework
                archiveArtifacts artifacts: "${ROBOT_REPORT_DIR}/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${ROBOT_REPORT_DIR}/output/xunit.xml"
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Check reports/ directory for all artifacts and test results.'
        }
    }
}
