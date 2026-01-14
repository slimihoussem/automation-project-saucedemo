pipeline {
    agent any

    environment {
        IMAGE_NAME = "test-automation"
    }

    stages {
        stage('Quick Setup') {
            steps {
                echo "⚡ FAST Pipeline - Checking tests..."
                
                // Minimal cleanup
                bat 'if exist reports rmdir /s /q reports 2>nul'
                bat 'mkdir reports 2>nul'
                
                checkout scm
                
                // Quick test check
                bat """
                    echo ⚡ Checking tests...
                    
                    echo Files in project:
                    dir /b
                    
                    echo Test directories:
                    if exist playwright_tests (
                        echo 🎭 playwright_tests exists
                        dir playwright_tests\\*.spec.ts /b 2>nul && echo "  - Found .spec.ts files" || echo "  - No .spec.ts files"
                    )
                    
                    if exist robot_tests (
                        echo 🤖 robot_tests exists
                        dir robot_tests\\*.robot /b 2>nul && echo "  - Found .robot files" || echo "  - No .robot files"
                    )
                    
                    if exist selenium_tests (
                        echo 🌐 selenium_tests exists
                        dir selenium_tests\\*.py /b 2>nul && echo "  - Found .py files" || echo "  - No .py files"
                    )
                """
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐋 Building Docker image..."
                
                // First, let's see what's in our directory
                bat """
                    echo Current directory content:
                    dir /b
                    
                    echo Dockerfile content (first 10 lines):
                    type Dockerfile | head -10
                    
                    echo Requirements.txt:
                    type requirements.txt
                    
                    echo Package.json:
                    type package.json
                """
                
                // Then build Docker image
                bat "docker build -t %IMAGE_NAME% ."
            }
        }

        stage('Run Tests') {
            parallel {
                stage('🎭 Playwright') {
                    steps {
                        echo "Running Playwright tests..."
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE%\\reports:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "
                                    echo 'Checking directory structure...' &&
                                    ls -la &&
                                    echo '---' &&
                                    ls -la playwright_tests/ &&
                                    echo '---' &&
                                    echo 'Running Playwright tests...' &&
                                    cd /app && npx playwright test --reporter=junit,/app/reports/results.xml --reporter=html
                                "
                        """
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/results.xml')) {
                                    junit 'reports/results.xml'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Generate Summary') {
            steps {
                bat """
                    echo # Test Results > reports\\summary.txt
                    echo ============= >> reports\\summary.txt
                    echo Date: %DATE% %TIME% >> reports\\summary.txt
                    if exist reports\\results.xml (
                        echo ✅ Tests executed successfully >> reports\\summary.txt
                    ) else (
                        echo ❌ No test results found >> reports\\summary.txt
                    )
                """
                archiveArtifacts artifacts: 'reports/**/*'
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline completed in ${currentBuild.durationString}"
        }
    }
}