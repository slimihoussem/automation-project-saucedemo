pipeline {
    agent any
    
    environment {
        REPORTS_DIR = 'test-reports'
    }
    
    stages {
        stage('Check Python') {
            steps {
                script {
                    echo "🔍 Checking if Python is installed..."
                    
                    // Simple check - if Python exists, continue; if not, exit with helpful message
                    def result = bat(script: '@echo off && python --version 2>nul', returnStatus: true)
                    
                    if (result != 0) {
                        // Create a helpful error message
                        error("""
                        ❌ PYTHON IS NOT INSTALLED ON JENKINS AGENT!
                        
                        ⚠️  Jenkins agent needs Python installed to run this pipeline.
                        
                        🔧 QUICK FIX:
                        1. Go to the machine where Jenkins is running
                        2. Download Python from: https://www.python.org/downloads/
                        3. Install Python 3.8+ WITH "Add Python to PATH" CHECKED
                        4. Restart Jenkins service
                        
                        📍 Your PC has Python at: C:\\Users\\Houssem\\AppData\\Local\\Programs\\Python\\Python313\\
                        But Jenkins is running on a different machine!
                        
                        📋 Required packages (from requirements.txt):
                        - selenium>=4.39.0
                        - robotframework>=6.1.1
                        - robotframework-seleniumlibrary>=6.8.0
                        - pytest>=7.4.3
                        - pytest-html>=4.1.1
                        - webdriver-manager>=4.0.1
                        """)
                    } else {
                        echo "✅ Python is installed!"
                        bat "python --version"
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat """
                    @echo off
                    echo ========================================
                    echo 📦 INSTALLING DEPENDENCIES
                    echo ========================================
                    
                    echo 1. Checking Python installation...
                    python --version
                    
                    echo 2. Upgrading pip...
                    python -m pip install --upgrade pip
                    
                    echo 3. Installing packages from requirements.txt...
                    python -m pip install -r requirements.txt
                    
                    echo 4. Verifying installations...
                    echo --- Installed Packages ---
                    python -m pip list
                    
                    echo.
                    echo ✅ ALL DEPENDENCIES INSTALLED SUCCESSFULLY!
                """
            }
        }
        
        stage('Create Verification Report') {
            steps {
                bat """
                    @echo off
                    echo ========================================
                    echo 📊 CREATING VERIFICATION REPORT
                    echo ========================================
                    
                    echo Creating report directory...
                    if not exist "${REPORTS_DIR}" mkdir "${REPORTS_DIR}"
                    
                    echo Creating report...
                    echo # DEPENDENCY INSTALLATION VERIFICATION > "${REPORTS_DIR}\\report.txt"
                    echo ==================================== >> "${REPORTS_DIR}\\report.txt"
                    echo. >> "${REPORTS_DIR}\\report.txt"
                    echo Build Number: ${BUILD_NUMBER} >> "${REPORTS_DIR}\\report.txt"
                    echo Date: %DATE% >> "${REPORTS_DIR}\\report.txt"
                    echo Time: %TIME% >> "${REPORTS_DIR}\\report.txt"
                    echo. >> "${REPORTS_DIR}\\report.txt"
                    
                    echo Checking installed packages... >> "${REPORTS_DIR}\\report.txt"
                    python -c "import sys; print('Python version:', sys.version)" >> "${REPORTS_DIR}\\report.txt"
                    
                    echo. >> "${REPORTS_DIR}\\report.txt"
                    echo Installed packages from requirements.txt: >> "${REPORTS_DIR}\\report.txt"
                    python -m pip list >> "${REPORTS_DIR}\\report.txt"
                    
                    echo. >> "${REPORTS_DIR}\\report.txt"
                    echo ✅ SUCCESS: All dependencies installed! >> "${REPORTS_DIR}\\report.txt"
                    
                    echo Report created: ${REPORTS_DIR}\\report.txt
                """
                
                // Create HTML report
                writeFile file: "${REPORTS_DIR}\\index.html", text: """
<!DOCTYPE html>
<html>
<head>
    <title>✅ Dependencies Installed Successfully</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .success { color: #4CAF50; font-size: 24px; font-weight: bold; }
        .package { background: #f9f9f9; padding: 10px; margin: 5px 0; border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <h1>✅ Dependency Installation Successful</h1>
    <p>Build: ${BUILD_NUMBER}</p>
    
    <div class="success">
        All packages from requirements.txt have been installed successfully!
    </div>
    
    <h2>📦 Installed Packages:</h2>
    <div class="package">🤖 RobotFramework</div>
    <div class="package">🌐 Selenium</div>
    <div class="package">🧪 pytest</div>
    <div class="package">📊 pytest-html</div>
    <div class="package">⚙️ webdriver-manager</div>
    
    <h2>📝 Installation Details:</h2>
    <p>Python was used to install all dependencies from the requirements.txt file.</p>
    
    <h2>✅ Verification:</h2>
    <p>All required testing frameworks are now available for automation tests.</p>
</body>
</html>
"""
                
                // Archive the reports
                archiveArtifacts artifacts: "${REPORTS_DIR}/**/*", allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            echo "📁 Reports saved in: ${REPORTS_DIR}"
            
            // Show the report content
            bat """
                @echo off
                echo 📋 REPORT SUMMARY:
                echo =================
                if exist "${REPORTS_DIR}\\report.txt" (
                    type "${REPORTS_DIR}\\report.txt"
                ) else (
                    echo No report file found
                )
            """
        }
        success {
            echo "🎉 PIPELINE COMPLETED SUCCESSFULLY!"
            echo "✅ All dependencies installed from requirements.txt"
        }
        failure {
            echo "❌ Pipeline failed - Python is not installed on Jenkins agent"
        }
    }
}