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
                
                bat """
                    echo Cleaning workspace...
                    if exist "${REPORTS_DIR}" rmdir /s /q "${REPORTS_DIR}"
                    mkdir "${REPORTS_DIR}"
                    mkdir "${REPORTS_DIR}\\robot" 2>nul
                    mkdir "${REPORTS_DIR}\\selenium" 2>nul
                    mkdir "${REPORTS_DIR}\\playwright" 2>nul
                    
                    echo ✅ Workspace cleaned
                """
            }
        }
        
        stage('Verify Requirements') {
            steps {
                script {
                    if (!fileExists('requirements.txt')) {
                        error('❌ requirements.txt not found! Please add it to your repository.')
                    }
                    
                    echo '✅ Found requirements.txt'
                    bat 'type requirements.txt'
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat """
                    echo === Installing Dependencies ===
                    
                    echo 1. Checking system tools...
                    python --version 2>nul || (
                        echo ❌ ERROR: Python not found!
                        echo 💡 Please install Python 3.8+ and add to PATH
                        echo 📥 Download from: https://www.python.org/downloads/
                        exit 1
                    )
                    
                    echo 2. Upgrading pip...
                    python -m pip install --upgrade pip
                    
                    echo 3. Installing packages from requirements.txt...
                    python -m pip install -r requirements.txt
                    
                    echo 4. Verifying installations...
                    echo --- Python Packages ---
                    python -m pip list | findstr "selenium robotframework pytest"
                    
                    echo.
                    echo ✅ Dependencies installed successfully!
                """
            }
        }
        
        stage('Setup Playwright') {
            steps {
                bat """
                    echo === Setting up Playwright ===
                    
                    echo 1. Checking Node.js...
                    node --version 2>nul || (
                        echo ❌ ERROR: Node.js not found!
                        echo 💡 Please install Node.js 16+ and add to PATH
                        echo 📥 Download from: https://nodejs.org/
                        exit 1
                    )
                    
                    echo 2. Initializing npm project...
                    if not exist "package.json" (
                        npm init -y --silent
                        echo "Initialized package.json"
                    )
                    
                    echo 3. Installing Playwright...
                    npm install @playwright/test --save-dev --silent
                    
                    echo 4. Installing browser binaries...
                    npx playwright install chromium --with-deps
                    
                    echo ✅ Playwright setup completed!
                """
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo "🔍 Looking for test files..."
                    
                    // Check what types of tests we have
                    def robotTests = findFiles(glob: '**/*.robot')
                    def pythonTests = findFiles(glob: '**/*test*.py') - findFiles(glob: '**/*__pycache__/**')
                    def playwrightTests = findFiles(glob: '**/*.spec.ts') + findFiles(glob: '**/*.spec.js')
                    
                    echo "Found:"
                    echo "- ${robotTests.size()} RobotFramework tests"
                    echo "- ${pythonTests.size()} Python/Selenium tests"
                    echo "- ${playwrightTests.size()} Playwright tests"
                    
                    // Run appropriate tests
                    if (!robotTests.isEmpty() || !pythonTests.isEmpty() || !playwrightTests.isEmpty()) {
                        parallel {
                            stage('🤖 RobotFramework') {
                                when {
                                    expression { !robotTests.isEmpty() }
                                }
                                steps {
                                    script {
                                        echo "🚀 Running ${robotTests.size()} RobotFramework tests..."
                                        bat """
                                            robot --outputdir "${REPORTS_DIR}\\robot" ^
                                                  --log robot_log.html ^
                                                  --report robot_report.html ^
                                                  --output output.xml ^
                                                  --nostatusrc ^
                                                  .
                                        """
                                    }
                                }
                                post {
                                    always {
                                        junit "${REPORTS_DIR}\\robot\\output.xml"
                                    }
                                }
                            }
                            
                            stage('🌐 Selenium/Python') {
                                when {
                                    expression { !pythonTests.isEmpty() }
                                }
                                steps {
                                    script {
                                        echo "🚀 Running ${pythonTests.size()} Python tests..."
                                        bat """
                                            python -m pytest . ^
                                                --junitxml="${REPORTS_DIR}\\selenium\\results.xml" ^
                                                --html="${REPORTS_DIR}\\selenium\\report.html" ^
                                                --self-contained-html ^
                                                -v
                                        """
                                    }
                                }
                                post {
                                    always {
                                        junit "${REPORTS_DIR}\\selenium\\results.xml"
                                    }
                                }
                            }
                            
                            stage('🎭 Playwright') {
                                when {
                                    expression { !playwrightTests.isEmpty() }
                                }
                                steps {
                                    script {
                                        echo "🚀 Running ${playwrightTests.size()} Playwright tests..."
                                        
                                        // Create playwright.config.ts if needed
                                        if (!fileExists("playwright.config.ts")) {
                                            writeFile file: "playwright.config.ts", text: """
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '${REPORTS_DIR}/playwright' }],
    ['junit', { outputFile: '${REPORTS_DIR}/playwright/results.xml' }]
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
});
"""
                                        }
                                        
                                        bat """
                                            npx playwright test ^
                                                --project=chromium ^
                                                --reporter=junit,"${REPORTS_DIR}\\playwright\\results.xml" ^
                                                --reporter=html,"${REPORTS_DIR}\\playwright" ^
                                                --timeout=30000
                                        """
                                    }
                                }
                                post {
                                    always {
                                        junit "${REPORTS_DIR}\\playwright\\results.xml"
                                    }
                                }
                            }
                        }
                    } else {
                        echo "⚠️ No test files found. Creating example tests..."
                        createExampleTests()
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                echo "📊 Generating reports..."
                
                bat """
                    echo # Test Execution Summary > "${REPORTS_DIR}\\summary.txt"
                    echo ====================== >> "${REPORTS_DIR}\\summary.txt"
                    echo Build: ${BUILD_NUMBER} >> "${REPORTS_DIR}\\summary.txt"
                    echo Date: %DATE% %TIME% >> "${REPORTS_DIR}\\summary.txt"
                    echo >> "${REPORTS_DIR}\\summary.txt"
                    
                    if exist "${REPORTS_DIR}\\robot\\robot_report.html" (
                        echo ✅ RobotFramework: robot/robot_report.html >> "${REPORTS_DIR}\\summary.txt"
                    )
                    
                    if exist "${REPORTS_DIR}\\selenium\\report.html" (
                        echo ✅ Selenium/Python: selenium/report.html >> "${REPORTS_DIR}\\summary.txt"
                    )
                    
                    if exist "${REPORTS_DIR}\\playwright\\index.html" (
                        echo ✅ Playwright: playwright/index.html >> "${REPORTS_DIR}\\summary.txt"
                    )
                """
                
                // Archive reports
                archiveArtifacts artifacts: "${REPORTS_DIR}/**/*", allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            echo "📁 Reports saved in: ${REPORTS_DIR}"
            echo "📋 Summary:"
            bat "type ${REPORTS_DIR}\\summary.txt 2>nul || echo No summary file"
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}

// Helper function to create example tests if none exist
def createExampleTests() {
    // Create example Python test
    if (!fileExists("test_example.py")) {
        writeFile file: "test_example.py", text: """
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

def test_saucedemo_login():
    driver = webdriver.Chrome()
    try:
        driver.get("https://www.saucedemo.com")
        assert "Swag Labs" in driver.title
        print("✅ Test passed: Page loaded successfully")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_saucedemo_login()
"""
        echo "📝 Created example Python test: test_example.py"
    }
    
    // Create example RobotFramework test
    if (!fileExists("example.robot")) {
        writeFile file: "example.robot", text: """
*** Settings ***
Library    SeleniumLibrary

*** Test Cases ***
Example Test
    Open Browser    https://www.saucedemo.com    chrome
    Title Should Be    Swag Labs
    Close Browser
"""
        echo "📝 Created example RobotFramework test: example.robot"
    }
    
    // Create example Playwright test
    if (!fileExists("example.spec.ts")) {
        writeFile file: "example.spec.ts", text: """
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await expect(page).toHaveTitle(/Swag Labs/);
});
"""
        echo "📝 Created example Playwright test: example.spec.ts"
    }
}