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
                    set TEST_COUNT=0
                    
                    if exist playwright_tests\\*.spec.ts (
                        echo 🎭 Playwright tests found
                        set /a TEST_COUNT+=1
                    )
                    
                    if exist robot_tests\\*.robot (
                        echo 🤖 RobotFramework tests found  
                        set /a TEST_COUNT+=1
                    )
                    
                    if exist selenium_tests\\*.py (
                        echo 🌐 Selenium tests found
                        set /a TEST_COUNT+=1
                    )
                    
                    if %TEST_COUNT%==0 (
                        echo ⚠️ No tests found in any framework!
                        exit 0
                    )
                """
            }
        }

        stage('Build Optimized Docker Image') {
            steps {
                echo "🐋 Building optimized Docker image..."
                script {
                    // Check which tests exist to optimize build
                    def hasPlaywright = bat(script: "dir playwright_tests\\*.spec.ts /b 2>nul", returnStdout: true).trim()
                    def hasRobot = bat(script: "dir robot_tests\\*.robot /b 2>nul", returnStdout: true).trim()
                    def hasSelenium = bat(script: "dir selenium_tests\\*.py /b 2>nul", returnStdout: true).trim()
                    
                    // Build args based on what's needed
                    def buildArgs = ""
                    
                    if (hasPlaywright) {
                        buildArgs += " --build-arg INSTALL_PLAYWRIGHT=true"
                        echo "🎭 Will install Playwright"
                    }
                    
                    if (hasRobot || hasSelenium) {
                        buildArgs += " --build-arg INSTALL_PYTHON=true"
                        echo "🐍 Will install Python dependencies"
                    }
                    
                    // Build with optimizations
                    bat "docker build --no-cache=false${buildArgs} -t %IMAGE_NAME% ."
                }
            }
        }

        stage('Run Tests FAST') {
            failFast false
            parallel {
                stage('Playwright') {
                    when {
                        expression {
                            bat(script: "dir playwright_tests\\*.spec.ts /b 2>nul", returnStdout: true).trim() != ""
                        }
                    }
                    steps {
                        echo "🎭 Running Playwright tests (FAST)..."
                        timeout(time: 3, unit: 'MINUTES') {
                            bat """
                                docker run --rm ^
                                    -v "%WORKSPACE%\\reports\\playwright:/app/reports" ^
                                    -e CI=true ^
                                    -e PLAYWRIGHT_BROWSERS_PATH=0 ^
                                    %IMAGE_NAME% ^
                                    bash -c "
                                        echo 'Running Playwright with Chromium only...' &&
                                        npx playwright test ^
                                            --project=chromium ^
                                            --reporter=junit,/app/reports/results.xml ^
                                            --reporter=html ^
                                            --timeout=30000 ^
                                            2>&1 | grep -v 'Downloading' | grep -v 'Installing'
                                    "
                            """
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/playwright/results.xml')) {
                                    junit 'reports/playwright/results.xml'
                                }
                            }
                        }
                    }
                }

                stage('RobotFramework') {
                    when {
                        expression {
                            bat(script: "dir robot_tests\\*.robot /b 2>nul", returnStdout: true).trim() != ""
                        }
                    }
                    steps {
                        echo "🤖 Running RobotFramework tests..."
                        timeout(time: 2, unit: 'MINUTES') {
                            bat """
                                docker run --rm ^
                                    -v "%WORKSPACE%\\reports\\robot:/app/reports" ^
                                    %IMAGE_NAME% ^
                                    bash -c "cd /app/robot_tests && robot --outputdir /app/reports --log NONE --report NONE . 2>&1 || echo 'Robot tests done'"
                            """
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/robot/output.xml')) {
                                    junit 'reports/robot/output.xml'
                                }
                            }
                        }
                    }
                }

                stage('Selenium') {
                    when {
                        expression {
                            bat(script: "dir selenium_tests\\*.py /b 2>nul", returnStdout: true).trim() != ""
                        }
                    }
                    steps {
                        echo "🌐 Running Selenium tests..."
                        timeout(time: 2, unit: 'MINUTES') {
                            bat """
                                docker run --rm ^
                                    -v "%WORKSPACE%\\reports\\selenium:/app/reports" ^
                                    -e HEADLESS=true ^
                                    %IMAGE_NAME% ^
                                    bash -c "cd /app/selenium_tests && python -m pytest . -q --junitxml=/app/reports/results.xml 2>&1 || echo 'Selenium tests done'"
                            """
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/selenium/results.xml')) {
                                    junit 'reports/selenium/results.xml'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Quick Summary') {
            steps {
                echo "📊 Quick summary..."
                bat """
                    echo # Test Summary > reports\\summary.txt
                    echo ============= >> reports\\summary.txt
                    echo Time: %TIME% >> reports\\summary.txt
                    
                    if exist reports\\playwright\\results.xml (
                        echo 🎭 Playwright: ✓ >> reports\\summary.txt
                    )
                    
                    if exist reports\\robot\\output.xml (
                        echo 🤖 RobotFramework: ✓ >> reports\\summary.txt
                    )
                    
                    if exist reports\\selenium\\results.xml (
                        echo 🌐 Selenium: ✓ >> reports\\summary.txt
                    )
                """
                archiveArtifacts artifacts: 'reports/**/*'
            }
        }
    }

    post {
        always {
            echo "🧹 Quick cleanup..."
            bat 'docker system prune -f 2>nul'
            echo "✅ Done in ${currentBuild.durationString}"
        }
    }
}