pipeline {
    agent any
    
    environment {
        REPORTS_DIR = 'test-reports'
        BROWSER = 'chromium'
    }
    
    stages {
        stage('Clean & Setup') {
            steps {
                echo "🚀 Starting Test Pipeline"
                echo "📅 Build: ${BUILD_NUMBER}"
                echo "🌐 Browser: ${BROWSER} (Chromium only)"
                
                bat """
                    echo Cleaning workspace...
                    if exist "${REPORTS_DIR}" rmdir /s /q "${REPORTS_DIR}"
                    mkdir "${REPORTS_DIR}"
                    
                    echo Checking for requirements.txt...
                    if exist "requirements.txt" (
                        echo ✅ Found requirements.txt
                        type requirements.txt
                    ) else (
                        echo ❌ requirements.txt not found
                        exit 1
                    )
                """
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat """
                    echo === Installing Dependencies ===
                    
                    echo 1. Installing Python packages from requirements.txt...
                    pip install -r requirements.txt
                    
                    echo 2. Checking installations...
                    python --version
                    robot --version
                    pytest --version
                    
                    echo 3. Installing Playwright with Chromium only...
                    npm install @playwright/test
                    npx playwright install chromium
                    
                    echo ✅ All dependencies installed
                """
            }
        }
        
        stage('Run Available Tests') {
            failFast false
            parallel {
                stage('🤖 RobotFramework') {
                    steps {
                        script {
                            def robotFiles = bat(script: 'dir /b robot_tests\\*.robot 2>nul', returnStdout: true).trim()
                            
                            if (robotFiles) {
                                echo "🚀 Running RobotFramework tests..."
                                bat """
                                    cd robot_tests
                                    robot --outputdir "..\\${REPORTS_DIR}\\robot" ^
                                          --log robot_log.html ^
                                          --report robot_report.html ^
                                          --output output.xml ^
                                          .
                                """
                                echo "✅ RobotFramework tests completed"
                            } else {
                                echo "⏭️ Skipping RobotFramework - no .robot files found"
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists("${REPORTS_DIR}\\robot\\output.xml")) {
                                    junit "${REPORTS_DIR}\\robot\\output.xml"
                                }
                            }
                        }
                    }
                }
                
                stage('🌐 Selenium') {
                    steps {
                        script {
                            def seleniumFiles = bat(script: 'dir /b selenium_tests\\*.py 2>nul', returnStdout: true).trim()
                            
                            if (seleniumFiles) {
                                echo "🚀 Running Selenium tests..."
                                bat """
                                    cd selenium_tests
                                    python -m pytest . ^
                                        --junitxml="..\\${REPORTS_DIR}\\selenium\\results.xml" ^
                                        --html="..\\${REPORTS_DIR}\\selenium\\report.html" ^
                                        --self-contained-html ^
                                        -v
                                """
                                echo "✅ Selenium tests completed"
                            } else {
                                echo "⏭️ Skipping Selenium - no .py files found"
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists("${REPORTS_DIR}\\selenium\\results.xml")) {
                                    junit "${REPORTS_DIR}\\selenium\\results.xml"
                                }
                            }
                        }
                    }
                }
                
                stage('🎭 Playwright') {
                    steps {
                        script {
                            def playwrightFiles = bat(script: 'dir /b playwright_tests\\*.spec.ts 2>nul', returnStdout: true).trim()
                            
                            if (playwrightFiles) {
                                echo "🚀 Running Playwright tests..."
                                bat """
                                    npx playwright test ^
                                        --project=chromium ^
                                        --reporter=junit,"${REPORTS_DIR}\\playwright\\results.xml" ^
                                        --reporter=html,"${REPORTS_DIR}\\playwright" ^
                                        --timeout=30000
                                """
                                echo "✅ Playwright tests completed"
                            } else {
                                echo "⏭️ Skipping Playwright - no .spec.ts files found"
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                if (fileExists("${REPORTS_DIR}\\playwright\\results.xml")) {
                                    junit "${REPORTS_DIR}\\playwright\\results.xml"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Generate Report') {
            steps {
                echo "📊 Generating test report..."
                
                bat """
                    echo # Test Execution Summary > "${REPORTS_DIR}\\summary.txt"
                    echo ====================== >> "${REPORTS_DIR}\\summary.txt"
                    echo Build: ${BUILD_NUMBER} >> "${REPORTS_DIR}\\summary.txt"
                    echo Date: %DATE% %TIME% >> "${REPORTS_DIR}\\summary.txt"
                    echo Browser: ${BROWSER} >> "${REPORTS_DIR}\\summary.txt"
                    echo. >> "${REPORTS_DIR}\\summary.txt"
                    
                    echo ## Test Results >> "${REPORTS_DIR}\\summary.txt"
                    echo. >> "${REPORTS_DIR}\\summary.txt"
                    
                    if exist "${REPORTS_DIR}\\robot\\output.xml" (
                        echo 🤖 RobotFramework: PASSED >> "${REPORTS_DIR}\\summary.txt"
                        echo   - Report: ${REPORTS_DIR}\\robot\\robot_report.html >> "${REPORTS_DIR}\\summary.txt"
                    ) else (
                        echo 🤖 RobotFramework: SKIPPED >> "${REPORTS_DIR}\\summary.txt"
                    )
                    
                    if exist "${REPORTS_DIR}\\selenium\\results.xml" (
                        echo 🌐 Selenium: PASSED >> "${REPORTS_DIR}\\summary.txt"
                        echo   - Report: ${REPORTS_DIR}\\selenium\\report.html >> "${REPORTS_DIR}\\summary.txt"
                    ) else (
                        echo 🌐 Selenium: SKIPPED >> "${REPORTS_DIR}\\summary.txt"
                    )
                    
                    if exist "${REPORTS_DIR}\\playwright\\results.xml" (
                        echo 🎭 Playwright: PASSED >> "${REPORTS_DIR}\\summary.txt"
                        echo   - Report: ${REPORTS_DIR}\\playwright\\index.html >> "${REPORTS_DIR}\\summary.txt"
                    ) else (
                        echo 🎭 Playwright: SKIPPED >> "${REPORTS_DIR}\\summary.txt"
                    )
                """
                
                // Create simple HTML dashboard
                writeFile(
                    file: "${REPORTS_DIR}\\dashboard.html",
                    text: """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Test Dashboard</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
                            .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                            .links a { display: inline-block; margin: 5px; padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Test Automation Dashboard</h1>
                            <p>Build: ${BUILD_NUMBER}</p>
                            <p>Browser: ${BROWSER}</p>
                        </div>
                        
                        <div class="test-section">
                            <h2>🤖 RobotFramework</h2>
                            <div class="links">
                                ${fileExists("${REPORTS_DIR}\\robot\\robot_report.html") ? '<a href="robot/robot_report.html">View Report</a>' : '<p>No tests found</p>'}
                            </div>
                        </div>
                        
                        <div class="test-section">
                            <h2>🌐 Selenium</h2>
                            <div class="links">
                                ${fileExists("${REPORTS_DIR}\\selenium\\report.html") ? '<a href="selenium/report.html">View Report</a>' : '<p>No tests found</p>'}
                            </div>
                        </div>
                        
                        <div class="test-section">
                            <h2>🎭 Playwright</h2>
                            <div class="links">
                                ${fileExists("${REPORTS_DIR}\\playwright\\index.html") ? '<a href="playwright/index.html">View Report</a>' : '<p>No tests found</p>'}
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                )
                
                // Archive all reports
                archiveArtifacts artifacts: "${REPORTS_DIR}\\**\\*"
            }
        }
    }
    
    post {
        always {
            echo "✅ Pipeline completed!"
            echo "📁 Reports saved in: ${REPORTS_DIR}"
        }
    }
}