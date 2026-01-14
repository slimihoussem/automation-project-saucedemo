pipeline {
    agent any

    environment {
        IMAGE_NAME = "test-automation"
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
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐋 Building Docker image..."
                bat "docker build -t %IMAGE_NAME% ."
            }
        }

        stage('Check Test Directories') {
            steps {
                echo "📁 Checking test directories..."
                script {
                    // Check what test directories exist
                    bat """
                        echo === Checking Test Directories ===
                        if exist robot_tests (
                            echo ✅ robot_tests directory exists
                            dir robot_tests\\*.robot /b 2>nul && echo "✅ Found .robot files" || echo "⚠️ No .robot files found"
                        ) else (
                            echo ❌ robot_tests directory not found
                        )
                        
                        if exist selenium_tests (
                            echo ✅ selenium_tests directory exists
                            dir selenium_tests\\*.py /b 2>nul && echo "✅ Found .py files" || echo "⚠️ No .py files found"
                        ) else (
                            echo ❌ selenium_tests directory not found
                        )
                        
                        if exist playwright_tests (
                            echo ✅ playwright_tests directory exists
                            dir playwright_tests\\*.spec.ts playwright_tests\\*.spec.js playwright_tests\\*.ts playwright_tests\\*.js /b 2>nul && echo "✅ Found test files" || echo "⚠️ No test files found"
                        ) else (
                            echo ❌ playwright_tests directory not found
                        )
                    """
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('🤖 RobotFramework') {
                    when {
                        expression { 
                            // Only run if robot_tests directory exists AND has .robot files
                            def robotDir = fileExists('robot_tests')
                            if (robotDir) {
                                // Check if there are .robot files
                                def robotFiles = bat(script: "dir robot_tests\\*.robot /b 2>nul", returnStdout: true).trim()
                                return robotFiles != ""
                            }
                            return false
                        }
                    }
                    steps {
                        echo "Running RobotFramework tests..."
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE%\\reports\\robot:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "cd /app/robot_tests && robot --outputdir /app/reports --log robot_log.html --report robot_report.html ."
                        """
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/robot/output.xml')) {
                                    junit 'reports/robot/output.xml'
                                    archiveArtifacts artifacts: 'reports/robot/*.html'
                                }
                            }
                        }
                    }
                }

                stage('🌐 Selenium') {
                    when {
                        expression { 
                            // Only run if selenium_tests directory exists AND has .py files
                            def seleniumDir = fileExists('selenium_tests')
                            if (seleniumDir) {
                                // Check if there are .py files
                                def pyFiles = bat(script: "dir selenium_tests\\*.py /b 2>nul", returnStdout: true).trim()
                                return pyFiles != ""
                            }
                            return false
                        }
                    }
                    steps {
                        echo "Running Selenium tests..."
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE%\\reports\\selenium:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "cd /app/selenium_tests && python -m pytest . --junitxml=/app/reports/results.xml --html=/app/reports/report.html --self-contained-html"
                        """
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/selenium/results.xml')) {
                                    junit 'reports/selenium/results.xml'
                                    archiveArtifacts artifacts: 'reports/selenium/*.html'
                                }
                            }
                        }
                    }
                }

                stage('🎭 Playwright') {
                    when {
                        expression { 
                            // Only run if playwright_tests directory exists AND has test files
                            def playwrightDir = fileExists('playwright_tests')
                            if (playwrightDir) {
                                // Check if there are test files (.spec.ts, .spec.js, .ts, .js)
                                def testFiles = bat(script: "dir playwright_tests\\*.spec.ts playwright_tests\\*.spec.js playwright_tests\\*.ts playwright_tests\\*.js /b 2>nul", returnStdout: true).trim()
                                return testFiles != ""
                            }
                            return false
                        }
                    }
                    steps {
                        echo "Running Playwright tests..."
                        bat """
                            docker run --rm ^
                                -v "%WORKSPACE%\\reports\\playwright:/app/reports" ^
                                %IMAGE_NAME% ^
                                bash -c "cd /app && npx playwright test --reporter=junit,/app/reports/results.xml --reporter=html"
                        """
                    }
                    post {
                        always {
                            script {
                                if (fileExists('reports/playwright/results.xml')) {
                                    junit 'reports/playwright/results.xml'
                                    archiveArtifacts artifacts: 'reports/playwright/**/*'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Generate Summary') {
            steps {
                echo "📊 Generating test summary..."
                script {
                    // Create summary file
                    def summary = "# Test Execution Summary\n\n"
                    summary += "## Build Information\n"
                    summary += "- **Build Number:** ${env.BUILD_NUMBER}\n"
                    summary += "- **Execution Date:** ${new Date().format('yyyy-MM-dd HH:mm:ss')}\n\n"
                    
                    summary += "## Test Results\n"
                    
                    // Check RobotFramework results
                    if (fileExists('reports/robot/output.xml')) {
                        summary += "### 🤖 RobotFramework\n"
                        summary += "- ✅ Tests executed\n"
                        summary += "- [Report](robot/robot_report.html)\n"
                        summary += "- [Log](robot/robot_log.html)\n\n"
                    } else {
                        summary += "### 🤖 RobotFramework\n"
                        summary += "- ⚠️ No tests found or directory missing\n\n"
                    }
                    
                    // Check Selenium results
                    if (fileExists('reports/selenium/results.xml')) {
                        summary += "### 🌐 Selenium\n"
                        summary += "- ✅ Tests executed\n"
                        summary += "- [Report](selenium/report.html)\n\n"
                    } else {
                        summary += "### 🌐 Selenium\n"
                        summary += "- ⚠️ No tests found or directory missing\n\n"
                    }
                    
                    // Check Playwright results
                    if (fileExists('reports/playwright/results.xml')) {
                        summary += "### 🎭 Playwright\n"
                        summary += "- ✅ Tests executed\n"
                        summary += "- [Report](playwright/playwright-report/index.html)\n\n"
                    } else {
                        summary += "### 🎭 Playwright\n"
                        summary += "- ⚠️ No tests found or directory missing\n\n"
                    }
                    
                    summary += "---\n"
                    summary += "*Note: Jenkins will skip test stages if no test files are found.*\n"
                    
                    writeFile file: 'reports/summary.md', text: summary
                    
                    // Also create HTML summary
                    def htmlSummary = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Test Summary</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
                            .framework { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                            .success { color: green; }
                            .warning { color: orange; }
                            .links a { display: inline-block; margin: 5px; padding: 8px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Test Execution Summary</h1>
                            <p>Build: ${env.BUILD_NUMBER}</p>
                            <p>Date: ${new Date().format('yyyy-MM-dd HH:mm:ss')}</p>
                        </div>
                    """
                    
                    // RobotFramework section
                    htmlSummary += """
                        <div class="framework">
                            <h2>🤖 RobotFramework</h2>
                    """
                    if (fileExists('reports/robot/output.xml')) {
                        htmlSummary += """
                            <p class="success">✅ Tests executed successfully</p>
                            <div class="links">
                                <a href="robot/robot_report.html">View Report</a>
                                <a href="robot/robot_log.html">View Log</a>
                            </div>
                        """
                    } else {
                        htmlSummary += """
                            <p class="warning">⚠️ No tests found or directory missing</p>
                        """
                    }
                    htmlSummary += "</div>"
                    
                    // Selenium section
                    htmlSummary += """
                        <div class="framework">
                            <h2>🌐 Selenium</h2>
                    """
                    if (fileExists('reports/selenium/results.xml')) {
                        htmlSummary += """
                            <p class="success">✅ Tests executed successfully</p>
                            <div class="links">
                                <a href="selenium/report.html">View Report</a>
                            </div>
                        """
                    } else {
                        htmlSummary += """
                            <p class="warning">⚠️ No tests found or directory missing</p>
                        """
                    }
                    htmlSummary += "</div>"
                    
                    // Playwright section
                    htmlSummary += """
                        <div class="framework">
                            <h2>🎭 Playwright</h2>
                    """
                    if (fileExists('reports/playwright/results.xml')) {
                        htmlSummary += """
                            <p class="success">✅ Tests executed successfully</p>
                            <div class="links">
                                <a href="playwright/playwright-report/index.html">View Report</a>
                            </div>
                        """
                    } else {
                        htmlSummary += """
                            <p class="warning">⚠️ No tests found or directory missing</p>
                        """
                    }
                    htmlSummary += """
                            </div>
                        </body>
                        </html>
                        """
                    
                    writeFile file: 'reports/index.html', text: htmlSummary
                    
                    // Archive everything
                    archiveArtifacts artifacts: 'reports/**/*'
                    
                    // Publish HTML report
                    publishHTML([
                        target: [
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'reports',
                            reportFiles: 'index.html',
                            reportName: 'Test Summary'
                        ]
                    ])
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up Docker..."
            bat "docker system prune -f 2>nul || echo 'Cleanup complete'"
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}