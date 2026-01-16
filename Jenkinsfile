pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_REPORT_DIR = 'reports\\playwright'
        SELENIUM_REPORT_DIR   = 'reports\\allure\\selenium-html'
        ROBOT_REPORT_DIR      = 'reports\\allure\\robot-html'
        GLOBAL_REPORT_DIR     = 'reports\\allure\\global-html'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Prepare Reports Directory') {
            steps {
                echo 'Preparing reports directories...'
                bat 'if not exist reports mkdir reports'
                bat "if not exist ${PLAYWRIGHT_REPORT_DIR} mkdir ${PLAYWRIGHT_REPORT_DIR}"
                bat "if not exist ${SELENIUM_REPORT_DIR} mkdir ${SELENIUM_REPORT_DIR}"
                bat "if not exist ${ROBOT_REPORT_DIR} mkdir ${ROBOT_REPORT_DIR}"
                bat "if not exist ${GLOBAL_REPORT_DIR} mkdir ${GLOBAL_REPORT_DIR}"
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Node & Playwright') {
                    steps {
                        echo 'Installing Node & Playwright dependencies...'
                        bat 'npm install'
                        bat 'npx playwright install'
                    }
                }
                stage('Python Dependencies') {
                    steps {
                        echo 'Installing Python dependencies...'
                        bat 'py -m pip install --upgrade pip'
                        bat 'py -m pip install -r requirements.txt'
                        bat 'py -m pip install allure-pytest allure-robotframework'
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Playwright Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Playwright tests...'
                            bat """
                                npx playwright test playwright_tests/paiement_process.spec.ts --reporter=html --output=${PLAYWRIGHT_REPORT_DIR}
                                npx playwright test playwright_tests/product-filter.spec.ts --reporter=html --output=${PLAYWRIGHT_REPORT_DIR}
                            """
                        }
                    }
                }

                stage('Selenium Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Selenium tests...'
                            bat """
                                py -m pytest selenium_tests/TestSauceDemo.py --alluredir=reports\\allure\\selenium
                                py -m pytest selenium_tests/Tests_Check_Products.py --alluredir=reports\\allure\\selenium
                                allure generate reports\\allure\\selenium -o ${SELENIUM_REPORT_DIR} --clean
                            """
                        }
                    }
                }

                stage('Robot Framework Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            echo 'Running Robot Framework tests...'
                            bat """
                                py -m robot --listener allure_robotframework --outputdir reports\\allure\\robot robot_tests
                                allure generate reports\\allure\\robot -o ${ROBOT_REPORT_DIR} --clean
                            """
                        }
                    }
                }

            }
        }

        stage('Generate Global HTML Report') {
            steps {
                echo 'Merging all HTML reports into a single global report...'
                bat """
                    npm install -g merge-html-reports
                    merge-html-reports -d ${PLAYWRIGHT_REPORT_DIR},${SELENIUM_REPORT_DIR},${ROBOT_REPORT_DIR} -o ${GLOBAL_REPORT_DIR}
                """
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo 'Archiving all reports...'
                archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Open reports\\allure\\global-html\\index.html for combined test report.'
        }
    }
}
