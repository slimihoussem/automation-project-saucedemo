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
                    mkdir "${REPORTS_DIR}\\robot" 2>nul
                    mkdir "${REPORTS_DIR}\\selenium" 2>nul
                    mkdir "${REPORTS_DIR}\\playwright" 2>nul
                    
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
                    
                    echo 1. Checking Python installation...
                    python --version 2>nul || (
                        echo ❌ Python not found. Please install Python and add to PATH
                        exit 1
                    )
                    
                    echo 2. Installing Python packages from requirements.txt...
                    python -m pip install -r requirements.txt
                    
                    echo 3. Checking installations...
                    python --version
                    python -m robot --version 2>nul || echo "Robot Framework command not available"
                    python -m pytest --version 2>nul || echo "pytest command not available"
                    
                    echo 4. Initializing Node.js project if needed...
                    if not exist "package.json" (
                        npm init -y --silent
                    )
                    
                    echo 5. Installing Playwright with Chromium only...
                    npm install @playwright/test --save-dev
                    
                    echo 6. Installing browser binaries...
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
                            echo "🔍 Looking for RobotFramework tests..."
                            
                            // Create directory if it doesn't exist
                            bat """
                                if not exist "robot_tests" (
                                    mkdir robot_tests
                                    echo # RobotFramework tests > robot_tests\\README.txt
                                )
                            """
                            
                            // Check for robot files
                            def robotTestDir = "robot_tests"
                            if (fileExists(robotTestDir)) {
                                def robotFiles = findFiles(glob: "${robotTestDir}/**/*.robot")
                                
                                if (!robotFiles.isEmpty()) {
                                    echo "🚀 Running RobotFramework tests..."
                                    bat """
                                        cd ${robotTestDir}
                                        robot --outputdir "..\\${REPORTS_DIR}\\robot" ^
                                              --log robot_log.html ^
                                              --report robot_report.html ^
                                              --output output.xml ^
                                              .
                                    """
                                    echo "✅ RobotFramework tests completed"
                                } else {
                                    echo "⏭️ Skipping RobotFramework - no .robot files found in ${robotTestDir}"
                                    // Create a dummy result to avoid failure
                                    writeFile(
                                        file: "${REPORTS_DIR}\\robot\\robot_skipped.txt",
                                        text: "No RobotFramework tests found in ${robotTestDir}"
                                    )
                                }
                            } else {
                                echo "⏭️ Skipping RobotFramework - directory ${robotTestDir} not found"
                                writeFile(
                                    file: "${REPORTS_DIR}\\robot\\robot_skipped.txt",
                                    text: "RobotFramework test directory not found: ${robotTestDir}"
                                )
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
                            echo "🔍 Looking for Selenium tests..."
                            
                            // Create directory if it doesn't exist
                            bat """
                                if not exist "selenium_tests" (
                                    mkdir selenium_tests
                                    echo # Selenium tests > selenium_tests\\README.txt
                                )
                            """
                            
                            // Check for Python test files
                            def seleniumTestDir = "selenium_tests"
                            if (fileExists(seleniumTestDir)) {
                                def seleniumFiles = findFiles(glob: "${seleniumTestDir}/**/*.py")
                                
                                if (!seleniumFiles.isEmpty()) {
                                    echo "🚀 Running Selenium tests..."
                                    bat """
                                        cd ${seleniumTestDir}
                                        python -m pytest . ^
                                            --junitxml="..\\${REPORTS_DIR}\\selenium\\results.xml" ^
                                            --html="..\\${REPORTS_DIR}\\selenium\\report.html" ^
                                            --self-contained-html ^
                                            -v
                                    """
                                    echo "✅ Selenium tests completed"
                                } else {
                                    echo "⏭️ Skipping Selenium - no .py test files found in ${seleniumTestDir}"
                                    writeFile(
                                        file: "${REPORTS_DIR}\\selenium\\selenium_skipped.txt",
                                        text: "No Selenium tests found in ${seleniumTestDir}"
                                    )
                                }
                            } else {
                                echo "⏭️ Skipping Selenium - directory ${seleniumTestDir} not found"
                                writeFile(
                                    file: "${REPORTS_DIR}\\selenium\\selenium_skipped.txt",
                                    text: "Selenium test directory not found: ${seleniumTestDir}"
                                )
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
                            echo "🔍 Looking for Playwright tests..."
                            
                            // Create directory if it doesn't exist
                            bat """
                                if not exist "playwright_tests" (
                                    mkdir playwright_tests
                                    echo # Playwright tests > playwright_tests\\README.txt
                                    echo // Example test > playwright_tests\\example.spec.ts
                                    echo import { test, expect } from '@playwright/test'; >> playwright_tests\\example.spec.ts
                                )
                            """
                            
                            // Create playwright.config.ts if it doesn't exist
                            if (!fileExists("playwright.config.ts")) {
                                writeFile(
                                    file: "playwright.config.ts",
                                    text: """import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright_tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-reports/playwright' }],
    ['junit', { outputFile: 'test-reports/playwright/results.xml' }]
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});"""
                                )
                            }
                            
                            // Check for test files
                            def playwrightTestDir = "playwright_tests"
                            if (fileExists(playwrightTestDir)) {
                                def playwrightFiles = findFiles(glob: "${playwrightTestDir}/**/*.spec.ts") + 
                                                     findFiles(glob: "${playwrightTestDir}/**/*.spec.js") +
                                                     findFiles(glob: "${playwrightTestDir}/**/*.test.ts") +
                                                     findFiles(glob: "${playwrightTestDir}/**/*.test.js")
                                
                                if (!playwrightFiles.isEmpty()) {
                                    echo "🚀 Running Playwright tests..."
                                    bat """
                                        npx playwright test ^
                                            --project=${BROWSER} ^
                                            --reporter=junit,"${REPORTS_DIR}\\playwright\\results.xml" ^
                                            --reporter=html,"${REPORTS_DIR}\\playwright" ^
                                            --timeout=30000
                                    """
                                    echo "✅ Playwright tests completed"
                                } else {
                                    echo "⏭️ Skipping Playwright - no test files found in ${playwrightTestDir}"
                                    // Create a simple example test
                                    writeFile(
                                        file: "${playwrightTestDir}\\example.spec.ts",
                                        text: """import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});"""
                                    )
                                    echo "📝 Created example test in ${playwrightTestDir}"
                                    
                                    bat """
                                        npx playwright test ^
                                            --project=${BROWSER} ^
                                            --reporter=junit,"${REPORTS_DIR}\\playwright\\results.xml" ^
                                            --reporter=html,"${REPORTS_DIR}\\playwright" ^
                                            --timeout=30000
                                    """
                                }
                            } else {
                                echo "⏭️ Skipping Playwright - directory ${playwrightTestDir} not found"
                                writeFile(
                                    file: "${REPORTS_DIR}\\playwright\\playwright_skipped.txt",
                                    text: "Playwright test directory not found: ${playwrightTestDir}"
                                )
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
                    echo # Test Execution Summary > "${REPORTS_DIR}\\summary.md"
                    echo ====================== >> "${REPORTS_DIR}\\summary.md"
                    echo >> "${REPORTS_DIR}\\summary.md"
                    echo "- **Build**: ${BUILD_NUMBER}" >> "${REPORTS_DIR}\\summary.md"
                    echo "- **Date**: %DATE% %TIME%" >> "${REPORTS_DIR}\\summary.md"
                    echo "- **Browser**: ${BROWSER}" >> "${REPORTS_DIR}\\summary.md"
                    echo >> "${REPORTS_DIR}\\summary.md"
                    
                    echo "## Test Results" >> "${REPORTS_DIR}\\summary.md"
                    echo >> "${REPORTS_DIR}\\summary.md"
                    
                    if exist "${REPORTS_DIR}\\robot\\robot_report.html" (
                        echo "✅ **RobotFramework**: [View Report](${REPORTS_DIR}/robot/robot_report.html)" >> "${REPORTS_DIR}\\summary.md"
                    ) else (
                        echo "⏭️ **RobotFramework**: No tests executed" >> "${REPORTS_DIR}\\summary.md"
                    )
                    
                    if exist "${REPORTS_DIR}\\selenium\\report.html" (
                        echo "✅ **Selenium**: [View Report](${REPORTS_DIR}/selenium/report.html)" >> "${REPORTS_DIR}\\summary.md"
                    ) else (
                        echo "⏭️ **Selenium**: No tests executed" >> "${REPORTS_DIR}\\summary.md"
                    )
                    
                    if exist "${REPORTS_DIR}\\playwright\\index.html" (
                        echo "✅ **Playwright**: [View Report](${REPORTS_DIR}/playwright/index.html)" >> "${REPORTS_DIR}\\summary.md"
                    ) else (
                        echo "⏭️ **Playwright**: No tests executed" >> "${REPORTS_DIR}\\summary.md"
                    )
                """
                
                // Create simple HTML dashboard
                writeFile(
                    file: "${REPORTS_DIR}\\index.html",
                    text: """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Test Automation Dashboard</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
                            .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                            .links a { display: inline-block; margin: 5px; padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
                            .status { padding: 5px 10px; border-radius: 3px; }
                            .success { background: #d4edda; color: #155724; }
                            .skipped { background: #fff3cd; color: #856404; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>🚀 Test Automation Dashboard</h1>
                            <p><strong>Build:</strong> ${BUILD_NUMBER}</p>
                            <p><strong>Browser:</strong> ${BROWSER}</p>
                        </div>
                        
                        <div class="test-section">
                            <h2>🤖 RobotFramework</h2>
                            <div class="links">
                                ${fileExists("${REPORTS_DIR}/robot/robot_report.html") ? '<a href="robot/robot_report.html" target="_blank">View Report</a>' : '<span class="status skipped">No tests found</span>'}
                            </div>
                        </div>
                        
                        <div class="test-section">
                            <h2>🌐 Selenium</h2>
                            <div class="links">
                                ${fileExists("${REPORTS_DIR}/selenium/report.html") ? '<a href="selenium/report.html" target="_blank">View Report</a>' : '<span class="status skipped">No tests found</span>'}
                            </div>
                        </div>
                        
                        <div class="test-section">
                            <h2>🎭 Playwright</h2>
                            <div class="links">
                                ${fileExists("${REPORTS_DIR}/playwright/index.html") ? '<a href="playwright/index.html" target="_blank">View Report</a>' : '<span class="status skipped">No tests found</span>'}
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                )
                
                // Archive all reports
                archiveArtifacts artifacts: "${REPORTS_DIR}/**/*", allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            echo "📊 Pipeline execution completed!"
            echo "📁 Reports available in: ${REPORTS_DIR}"
            
            // Display summary
            script {
                if (fileExists("${REPORTS_DIR}/summary.md")) {
                    def summary = readFile("${REPORTS_DIR}/summary.md")
                    echo "📋 Summary:"
                    echo summary
                }
            }
        }
        success {
            echo "✅ All stages completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check the logs above for details."
        }
        unstable {
            echo "⚠️ Pipeline is unstable. Some tests may have failed."
        }
    }
}