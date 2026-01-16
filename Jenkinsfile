pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports/playwright'
        SELENIUM_REPORT_DIR  = 'reports/selenium'
        ROBOT_REPORT_DIR     = 'reports/robot'
        ALLURE_RESULTS_DIR   = 'reports/allure'
        ALLURE_GLOBAL_HTML   = 'reports/allure/global-html'
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
                bat 'if not exist reports\\allure mkdir reports\\allure'
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
                        bat 'py -m pip install allure-pytest robotframework-allure'
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Playwright - Checkout') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            npx playwright test playwright_tests/paiement_process.spec.ts ^
                            --reporter=junit ^
                            --output=${PLAYWRIGHT_REPORT_DIR}/checkout
                            npx playwright test playwright_tests/paiement_process.spec.ts ^
                            --reporter=allure-playwright ^
                            --output=${ALLURE_RESULTS_DIR}/playwright
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
                            npx playwright test playwright_tests/product-filter.spec.ts ^
                            --reporter=allure-playwright ^
                            --output=${ALLURE_RESULTS_DIR}/playwright
                            """
                        }
                    }
                }

                stage('Selenium - TestSauceDemo') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m pytest selenium_tests/TestSauceDemo.py ^
                            --junitxml=${SELENIUM_REPORT_DIR}/test-sauce-demo.xml ^
                            --alluredir=${ALLURE_RESULTS_DIR}/selenium
                            """
                        }
                    }
                }

                stage('Selenium - Check Products') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m pytest selenium_tests/Tests_Check_Products.py ^
                            --junitxml=${SELENIUM_REPORT_DIR}/test-products.xml ^
                            --alluredir=${ALLURE_RESULTS_DIR}/selenium
                            """
                        }
                    }
                }

                stage('Robot Framework Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m robot ^
                            --outputdir ${ROBOT_REPORT_DIR}/output ^
                            --xunit ${ROBOT_REPORT_DIR}/output/xunit.xml ^
                            --listener allure_robotframework.listener:AllureListener ^
                            robot_tests
                            """
                            // Copy Robot Allure results to Allure folder
                            bat 'xcopy /s /y reports\\robot\\output\\* reports\\allure\\robot\\'
                        }
                    }
                }

            }
        }

        stage('Generate Global Allure HTML Report') {
            steps {
                script {
                    echo 'Merging Allure results and generating global HTML report...'
                    // Merge all results into one folder
                    bat 'mkdir reports\\allure\\combined'
                    bat 'xcopy /s /y reports\\allure\\playwright\\* reports\\allure\\combined\\'
                    bat 'xcopy /s /y reports\\allure\\selenium\\* reports\\allure\\combined\\'
                    bat 'xcopy /s /y reports\\allure\\robot\\* reports\\allure\\combined\\'
                    // Generate global HTML report
                    bat "allure generate reports\\allure\\combined --clean -o ${ALLURE_GLOBAL_HTML}"
                }
            }
        }

        stage('Archive Artifacts & Publish Reports') {
            steps {
                echo 'Archiving artifacts and publishing test results...'

                // Playwright
                archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT_DIR}/checkout/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${PLAYWRIGHT_REPORT_DIR}/checkout/**/junit.xml"

                archiveArtifacts artifacts: "${PLAYWRIGHT_REPORT_DIR}/product-filter/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${PLAYWRIGHT_REPORT_DIR}/product-filter/**/junit.xml"

                // Selenium
                archiveArtifacts artifacts: "${SELENIUM_REPORT_DIR}/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${SELENIUM_REPORT_DIR}/*.xml"

                // Robot
                archiveArtifacts artifacts: "${ROBOT_REPORT_DIR}/**", allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: "${ROBOT_REPORT_DIR}/output/xunit.xml"

                // Global Allure HTML
                archiveArtifacts artifacts: "${ALLURE_GLOBAL_HTML}/**", allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Check reports/ directory for all artifacts and test results.'
        }
    }
}
