pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports/allure/playwright'
        SELENIUM_REPORT_DIR  = 'reports/allure/selenium'
        ROBOT_REPORT_DIR     = 'reports/allure/robot'
        ALLURE_COMBINED_DIR  = 'reports/allure/combined'
        ALLURE_HTML_DIR      = 'reports/allure/global-html'
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
                bat 'if not exist reports\\allure mkdir reports\\allure'
                bat "if not exist ${PLAYWRIGHT_REPORT_DIR} mkdir ${PLAYWRIGHT_REPORT_DIR}"
                bat "if not exist ${SELENIUM_REPORT_DIR} mkdir ${SELENIUM_REPORT_DIR}"
                bat "if not exist ${ROBOT_REPORT_DIR} mkdir ${ROBOT_REPORT_DIR}"
                bat "if not exist ${ALLURE_COMBINED_DIR} mkdir ${ALLURE_COMBINED_DIR}"
                bat "if not exist ${ALLURE_HTML_DIR} mkdir ${ALLURE_HTML_DIR}"
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Node & Playwright') {
                    steps {
                        bat 'npm install'
                        bat 'npx playwright install'
                        bat 'npm install -D @shelex/allure-playwright'
                    }
                }
                stage('Python Dependencies') {
                    steps {
                        bat 'py -m pip install --upgrade pip'
                        bat 'py -m pip install -r requirements.txt'
                        bat 'py -m pip install allure-pytest allure-robotframework'
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
                            --reporter=allure-playwright ^
                            --output=${PLAYWRIGHT_REPORT_DIR}
                            """
                        }
                    }
                }

                stage('Playwright - Product Filter') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            npx playwright test playwright_tests/product-filter.spec.ts ^
                            --reporter=allure-playwright ^
                            --output=${PLAYWRIGHT_REPORT_DIR}
                            """
                        }
                    }
                }

                stage('Selenium - TestSauceDemo') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat "py -m pytest selenium_tests/TestSauceDemo.py --alluredir=${SELENIUM_REPORT_DIR}"
                        }
                    }
                }

                stage('Selenium - Check Products') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat "py -m pytest selenium_tests/Tests_Check_Products.py --alluredir=${SELENIUM_REPORT_DIR}"
                        }
                    }
                }

                stage('Robot Framework Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m robot ^
                            --listener allure_robotframework.listener:AllureListener ^
                            --outputdir ${ROBOT_REPORT_DIR} ^
                            robot_tests
                            """
                        }
                    }
                }
            }
        }

        stage('Generate Global Allure HTML Report') {
            steps {
                echo 'Merging Allure results and generating global HTML report...'
                bat "xcopy /s /y ${PLAYWRIGHT_REPORT_DIR}\\* ${ALLURE_COMBINED_DIR}\\"
                bat "xcopy /s /y ${SELENIUM_REPORT_DIR}\\* ${ALLURE_COMBINED_DIR}\\"
                bat "xcopy /s /y ${ROBOT_REPORT_DIR}\\* ${ALLURE_COMBINED_DIR}\\"
                bat "allure generate ${ALLURE_COMBINED_DIR} --clean -o ${ALLURE_HTML_DIR}"
            }
        }

        stage('Archive Artifacts & Publish Reports') {
            steps {
                echo 'Archiving artifacts and publishing test results...'
                archiveArtifacts artifacts: 'reports/allure/global-html/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Check reports/allure/global-html/index.html for combined report.'
        }
    }
}
