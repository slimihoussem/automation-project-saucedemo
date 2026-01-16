pipeline {
    agent any
    environment {
        PYTHON = "py"
        NODE = "npm"
        REPORTS_DIR = "reports\\allure"
        COMBINED_DIR = "${REPORTS_DIR}\\combined"
        GLOBAL_HTML = "${REPORTS_DIR}\\global-html"
    }
    stages {

        stage('Checkout SCM') {
            steps {
                echo "Checking out code..."
                checkout([$class: 'GitSCM', 
                          branches: [[name: '*/main']], 
                          userRemoteConfigs: [[url: 'https://github.com/slimihoussem/automation-project-saucedemo.git', credentialsId: 'github_cred']]])
            }
        }

        stage('Prepare Reports Directory') {
            steps {
                echo "Preparing reports directories..."
                bat """
                    if not exist ${REPORTS_DIR} mkdir ${REPORTS_DIR}
                    if not exist ${REPORTS_DIR}\\playwright mkdir ${REPORTS_DIR}\\playwright
                    if not exist ${REPORTS_DIR}\\selenium mkdir ${REPORTS_DIR}\\selenium
                    if not exist ${REPORTS_DIR}\\robot mkdir ${REPORTS_DIR}\\robot
                    if not exist ${COMBINED_DIR} mkdir ${COMBINED_DIR}
                    if not exist ${GLOBAL_HTML} mkdir ${GLOBAL_HTML}
                """
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Node & Playwright') {
                    steps {
                        echo "Installing Node & Playwright dependencies..."
                        bat "npm install"
                        bat "npx playwright install"
                    }
                }
                stage('Python Dependencies') {
                    steps {
                        echo "Installing Python dependencies..."
                        bat "${PYTHON} -m pip install --upgrade pip"
                        bat "${PYTHON} -m pip install -r requirements.txt"
                        bat "${PYTHON} -m pip install allure-pytest allure-robotframework"
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Playwright Tests') {
                    steps {
                        echo "Running Playwright tests..."
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat "npx playwright test playwright_tests/paiement_process.spec.ts --reporter=@shelex/allure-playwright --output=${REPORTS_DIR}\\playwright"
                            bat "npx playwright test playwright_tests/product-filter.spec.ts --reporter=@shelex/allure-playwright --output=${REPORTS_DIR}\\playwright"
                        }
                    }
                }

                stage('Selenium Tests') {
                    steps {
                        echo "Running Selenium tests..."
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat "${PYTHON} -m pytest selenium_tests/TestSauceDemo.py --alluredir=${REPORTS_DIR}\\selenium"
                            bat "${PYTHON} -m pytest selenium_tests/Tests_Check_Products.py --alluredir=${REPORTS_DIR}\\selenium"
                        }
                    }
                }

                stage('Robot Framework Tests') {
                    steps {
                        echo "Running Robot Framework tests..."
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat "${PYTHON} -m robot --listener allure_robotframework --outputdir ${REPORTS_DIR}\\robot robot_tests"
                        }
                    }
                }

            }
        }

        stage('Generate Global Allure HTML Report') {
            steps {
                echo "Merging Allure results and generating global HTML report..."
                bat """
                    xcopy /s /y ${REPORTS_DIR}\\playwright\\* ${COMBINED_DIR}\\
                    xcopy /s /y ${REPORTS_DIR}\\selenium\\* ${COMBINED_DIR}\\
                    xcopy /s /y ${REPORTS_DIR}\\robot\\* ${COMBINED_DIR}\\
                    allure generate ${COMBINED_DIR} --clean -o ${GLOBAL_HTML}
                """
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: "${GLOBAL_HTML}\\**", fingerprint: true
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Check the combined report at ${GLOBAL_HTML}\\index.html"
        }
    }
}
