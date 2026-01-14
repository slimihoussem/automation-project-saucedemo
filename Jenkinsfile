pipeline {
    agent any
    
    environment {
        REPORTS_DIR = 'test-reports'
        BROWSER = 'chromium'
        PYTHON_VERSION = '3.11.9'
        PYTHON_URL = "https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-amd64.exe"
        PYTHON_INSTALL_DIR = "C:\\Python${PYTHON_VERSION.replace('.', '')}"
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
        
        stage('Install Python') {
            steps {
                script {
                    echo "🔧 Checking Python installation..."
                    
                    // Check if Python is already installed
                    def pythonCheck = bat(
                        script: '@echo off && python --version 2>nul && echo "PYTHON_FOUND" || echo "PYTHON_NOT_FOUND"',
                        returnStdout: true
                    ).trim()
                    
                    if (pythonCheck.contains("PYTHON_NOT_FOUND")) {
                        echo "📥 Python not found. Installing Python ${PYTHON_VERSION}..."
                        
                        bat """
                            echo Downloading Python ${PYTHON_VERSION}...
                            
                            # Download Python installer
                            powershell -Command "Invoke-WebRequest -Uri '${PYTHON_URL}' -OutFile 'python-installer.exe'"
                            
                            echo Installing Python...
                            # Install Python silently with specific options
                            python-installer.exe /quiet ^
                                InstallAllUsers=1 ^
                                PrependPath=1 ^
                                Include_test=0 ^
                                Include_launcher=0 ^
                                Include_doc=0 ^
                                Include_dev=0 ^
                                TargetDir="${PYTHON_INSTALL_DIR}"
                            
                            echo Cleaning up installer...
                            del python-installer.exe
                            
                            # Add Python to PATH for current session
                            set PATH=${PYTHON_INSTALL_DIR};${PYTHON_INSTALL_DIR}\\Scripts;%PATH%
                            
                            echo Verifying installation...
                            "${PYTHON_INSTALL_DIR}\\python.exe" --version
                            "${PYTHON_INSTALL_DIR}\\Scripts\\pip.exe" --version
                        """
                        
                        // Update environment for subsequent steps
                        env.PATH = "${PYTHON_INSTALL_DIR};${PYTHON_INSTALL_DIR}\\Scripts;${env.PATH}"
                        
                        echo "✅ Python ${PYTHON_VERSION} installed successfully!"
                    } else {
                        echo "✅ Python is already installed"
                        bat "python --version"
                    }
                }
            }
        }
        
        stage('Install Python Dependencies') {
            steps {
                script {
                    echo "📦 Installing dependencies from requirements.txt"
                    
                    // Use the specific Python executable if we installed it
                    def pythonExe = "python"
                    if (env.PYTHON_INSTALL_DIR) {
                        pythonExe = "${env.PYTHON_INSTALL_DIR}\\python.exe"
                    }
                    
                    bat """
                        echo 1. Checking Python and pip...
                        "${pythonExe}" --version
                        "${pythonExe}" -m pip --version
                        
                        echo 2. Upgrading pip...
                        "${pythonExe}" -m pip install --upgrade pip
                        
                        echo 3. Installing packages from requirements.txt...
                        "${pythonExe}" -m pip install -r requirements.txt
                        
                        echo 4. Verifying key packages...
                        echo --- Installed Packages ---
                        "${pythonExe}" -m pip list
                        
                        echo.
                        echo ✅ Python dependencies installed!
                    """
                }
            }
        }
        
        stage('Setup Playwright') {
            steps {
                bat """
                    echo === Setting up Playwright ===
                    
                    echo 1. Checking Node.js...
                    node --version 2>nul && (
                        echo ✅ Node.js found
                    ) || (
                        echo ❌ Node.js not found
                        echo 💡 Installing Node.js...
                        # You can add Node.js installation here if needed
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
                    
                    if (robotTests.isEmpty() && pythonTests.isEmpty() && playwrightTests.isEmpty()) {
                        echo "⚠️ No test files found. Creating example tests..."
                        createExampleTests()
                        // Re-check after creating examples
                        robotTests = findFiles(glob: '**/*.robot')
                        pythonTests = findFiles(glob: '**/*test*.py')
                        playwrightTests = findFiles(glob: '**/*.spec.ts') + findFiles(glob: '**/*.spec.js')
                    }
                    
                    // Run tests in parallel
                    parallel {
                        stage('🤖 RobotFramework') {
                            when {
                                expression { !robotTests.isEmpty() }
                            }
                            steps {
                                script {
                                    echo "🚀 Running ${robotTests.size()} RobotFramework tests..."
                                    bat """
                                        python -m robot --outputdir "${REPORTS_DIR}\\robot" ^
                                              --log robot_log.html ^
                                              --report robot_report.html ^
                                              --output output.xml ^
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
                        echo 🤖 RobotFramework: robot/robot_report.html >> "${REPORTS_DIR}\\summary.txt"
                    )
                    
                    if exist "${REPORTS_DIR}\\selenium\\report.html" (
                        echo 🌐 Selenium/Python: selenium/report.html >> "${REPORTS_DIR}\\summary.txt"
                    )
                    
                    if exist "${REPORTS_DIR}\\playwright\\index.html" (
                        echo 🎭 Playwright: playwright/index.html >> "${REPORTS_DIR}\\summary.txt"
                    )
                """
                
                // Create a simple HTML dashboard
                writeFile file: "${REPORTS_DIR}\\index.html", text: """
                <html>
                <head><title>Test Results Dashboard</title></head>
                <body>
                    <h1>Test Automation Dashboard</h1>
                    <p>Build: ${BUILD_NUMBER}</p>
                    
                    <h2>📋 Available Reports:</h2>
                    <ul>
                        ${fileExists("${REPORTS_DIR}/robot/robot_report.html") ? '<li><a href="robot/robot_report.html">RobotFramework Report</a></li>' : ''}
                        ${fileExists("${REPORTS_DIR}/selenium/report.html") ? '<li><a href="selenium/report.html">Selenium/Python Report</a></li>' : ''}
                        ${fileExists("${REPORTS_DIR}/playwright/index.html") ? '<li><a href="playwright/index.html">Playwright Report</a></li>' : ''}
                    </ul>
                </body>
                </html>
                """
                
                // Archive reports
                archiveArtifacts artifacts: "${REPORTS_DIR}/**/*", allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            echo "📁 Reports saved in: ${REPORTS_DIR}"
            script {
                if (fileExists("${REPORTS_DIR}\\summary.txt")) {
                    echo "📋 Summary:"
                    bat "type ${REPORTS_DIR}\\summary.txt"
                }
            }
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}

// Helper function to create example tests
def createExampleTests() {
    // Create example Python test
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
    
    // Create example RobotFramework test
    writeFile file: "example.robot", text: """
*** Settings ***
Library    SeleniumLibrary

*** Test Cases ***
Example Test
    Open Browser    https://www.saucedemo.com    chrome
    Title Should Be    Swag Labs
    Close Browser
"""
    
    // Create example Playwright test
    writeFile file: "example.spec.ts", text: """
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await expect(page).toHaveTitle(/Swag Labs/);
});
"""
    
    echo "📝 Created example test files"
}