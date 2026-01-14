pipeline {
    agent any

    environment {
        IMAGE_NAME = "test-automation"
        CONTAINER_NAME = "test_run_${BUILD_NUMBER}"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo "🧹 Cleaning workspace..."
                bat """
                    if exist reports rmdir /s /q reports
                    mkdir reports
                    mkdir reports\\robot
                    mkdir reports\\selenium
                    mkdir reports\\playwright
                """
            }
        }

        stage('Checkout') {
            steps {
                echo "📥 Checking out repository..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐋 Building Docker image..."
                bat "docker build -t %IMAGE_NAME% ."
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Run RobotFramework Tests') {
                    steps {
                        echo "🤖 Running RobotFramework tests..."
                        bat """
                            docker run --rm ^
                                --name robot_%CONTAINER_NAME% ^
                                -v "%WORKSPACE%\\reports\\robot:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "cd /app/robot_tests && robot --outputdir /app/reports ."
                        """
                    }
                    post {
                        always {
                            junit 'reports/robot/output.xml'
                            archiveArtifacts artifacts: 'reports/robot/*.html'
                        }
                    }
                }

                stage('Run Selenium Tests') {
                    steps {
                        echo "🌐 Running Selenium tests..."
                        bat """
                            docker run --rm ^
                                --name selenium_%CONTAINER_NAME% ^
                                -v "%WORKSPACE%\\reports\\selenium:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "cd /app/selenium_tests && python -m pytest . --junitxml=/app/reports/results.xml --html=/app/reports/report.html"
                        """
                    }
                    post {
                        always {
                            junit 'reports/selenium/results.xml'
                            archiveArtifacts artifacts: 'reports/selenium/*.html'
                        }
                    }
                }

                stage('Run Playwright Tests') {
                    steps {
                        echo "🎭 Running Playwright tests..."
                        bat """
                            docker run --rm ^
                                --name playwright_%CONTAINER_NAME% ^
                                -v "%WORKSPACE%\\reports\\playwright:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "cd /app/playwright_tests && npx playwright test --reporter=junit,reports/results.xml --reporter=html"
                        """
                    }
                    post {
                        always {
                            junit 'reports/playwright/results.xml'
                            archiveArtifacts artifacts: 'reports/playwright/**/*'
                        }
                    }
                }
            }
        }

        stage('Generate Summary') {
            steps {
                echo "📊 Generating test summary..."
                bat """
                    echo Test Results Summary > reports\\summary.txt
                    echo ===================== >> reports\\summary.txt
                    echo Build: %BUILD_NUMBER% >> reports\\summary.txt
                    echo Date: %DATE% %TIME% >> reports\\summary.txt
                    echo. >> reports\\summary.txt
                    echo RobotFramework: reports\\robot\\ >> reports\\summary.txt
                    echo Selenium: reports\\selenium\\ >> reports\\summary.txt
                    echo Playwright: reports\\playwright\\ >> reports\\summary.txt
                """
                archiveArtifacts artifacts: 'reports/**/*'
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up containers..."
            bat """
                docker rm -f robot_%CONTAINER_NAME% 2>nul || echo "No robot container"
                docker rm -f selenium_%CONTAINER_NAME% 2>nul || echo "No selenium container"
                docker rm -f playwright_%CONTAINER_NAME% 2>nul || echo "No playwright container"
            """
        }
        success {
            echo "✅ All tests passed!"
        }
        failure {
            echo "❌ Some tests failed!"
        }
    }
}