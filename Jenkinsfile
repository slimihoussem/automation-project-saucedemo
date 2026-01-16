pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        PLAYWRIGHT_JSON_DIR = 'reports\\playwright-json'
        SELENIUM_JSON_DIR  = 'reports\\selenium-json'
        ROBOT_XML_DIR      = 'reports\\robot-xml'
        GLOBAL_HTML        = 'reports\\global-test-report.html'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Prepare Directories') {
            steps {
                echo 'Creating reports directories...'
                bat """
                if not exist reports mkdir reports
                if not exist ${PLAYWRIGHT_JSON_DIR} mkdir ${PLAYWRIGHT_JSON_DIR}
                if not exist ${SELENIUM_JSON_DIR} mkdir ${SELENIUM_JSON_DIR}
                if not exist ${ROBOT_XML_DIR} mkdir ${ROBOT_XML_DIR}
                if not exist reports\\global-html mkdir reports\\global-html
                """
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
                            bat """
                            npx playwright test playwright_tests/paiement_process.spec.ts --output=${PLAYWRIGHT_JSON_DIR}\\paiement_process
                            npx playwright test playwright_tests/product-filter.spec.ts --output=${PLAYWRIGHT_JSON_DIR}\\product_filter
                            """
                        }
                    }
                }

                stage('Selenium Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m pytest selenium_tests/TestSauceDemo.py --alluredir=${SELENIUM_JSON_DIR}\\TestSauceDemo
                            py -m pytest selenium_tests/Tests_Check_Products.py --alluredir=${SELENIUM_JSON_DIR}\\CheckProducts
                            """
                        }
                    }
                }

                stage('Robot Framework Tests') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m robot --listener allure_robotframework --outputdir ${ROBOT_XML_DIR} robot_tests
                            """
                        }
                    }
                }
            }
        }

        stage('Generate Global HTML Report') {
            steps {
                echo 'Generating global HTML report...'

                // Merge all results and create one HTML page
                bat """
                echo ^<html^>^<head^>^<title^>Test Report^</title^>^</head^>^<body^>^<h1^>Global Test Report^</h1^> > ${GLOBAL_HTML}
                echo ^<h2^>Playwright Tests^</h2^> >> ${GLOBAL_HTML}
                dir /b ${PLAYWRIGHT_JSON_DIR} >> ${GLOBAL_HTML}
                echo ^<h2^>Selenium Tests^</h2^> >> ${GLOBAL_HTML}
                dir /b ${SELENIUM_JSON_DIR} >> ${GLOBAL_HTML}
                echo ^<h2^>Robot Framework Tests^</h2^> >> ${GLOBAL_HTML}
                dir /b ${ROBOT_XML_DIR} >> ${GLOBAL_HTML}
                echo ^</body^>^</html^> >> ${GLOBAL_HTML}
                """
            }
        }

        stage('Archive Report') {
            steps {
                echo "Archiving global HTML report..."
                archiveArtifacts artifacts: "${GLOBAL_HTML}", allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Open ${GLOBAL_HTML} for the combined test report."
        }
    }
}
