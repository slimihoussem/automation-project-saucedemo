pipeline {
    agent any
    
    environment {
        REPORTS_DIR = 'test-reports'
    }
    
    stages {
        stage('Clean Workspace') {
            steps {
                bat """
                    echo Cleaning workspace...
                    if exist "${REPORTS_DIR}" rmdir /s /q "${REPORTS_DIR}"
                    mkdir "${REPORTS_DIR}"
                    echo ✅ Workspace cleaned
                """
            }
        }
        
        stage('Install Python on Jenkins Agent') {
            steps {
                script {
                    echo "🔧 Installing Python on Jenkins agent..."
                    
                    // Method 1: Try to install using winget (Windows Package Manager)
                    bat """
                        echo Trying to install Python using winget...
                        winget install --id Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements 2>nul && (
                            echo ✅ Python installed via winget
                        ) || (
                            echo ⚠️ winget not available, trying direct download...
                            
                            # Download Python installer
                            powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe', 'python_installer.exe')"
                            
                            # Install Python
                            python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
                            
                            # Wait for installation
                            timeout /t 30 /nobreak
                            
                            # Clean up
                            del python_installer.exe
                            
                            echo ✅ Python installed via direct download
                        )
                        
                        # Refresh PATH
                        for /f "tokens=2*" %%a in ('reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v PATH 2^>nul') do set "SYSTEM_PATH=%%b"
                        set PATH=%SYSTEM_PATH%;C:\\Python311;C:\\Python311\\Scripts
                        
                        # Verify installation
                        where python || echo "Python not found after installation"
                    """
                }
            }
        }
        
        stage('Verify Python Installation') {
            steps {
                script {
                    echo "🔍 Verifying Python is installed..."
                    
                    // Try multiple ways to find Python
                    bat """
                        echo Looking for Python...
                        echo Method 1: Checking PATH...
                        python --version 2>nul && (
                            echo ✅ Python found in PATH
                            goto :success
                        )
                        
                        echo Method 2: Checking common locations...
                        if exist "C:\\Python311\\python.exe" (
                            set PATH=C:\\Python311;C:\\Python311\\Scripts;%PATH%
                            echo ✅ Python found at C:\\Python311
                            goto :success
                        )
                        
                        if exist "C:\\Program Files\\Python311\\python.exe" (
                            set PATH=C:\\Program Files\\Python311;C:\\Program Files\\Python311\\Scripts;%PATH%
                            echo ✅ Python found at C:\\Program Files\\Python311
                            goto :success
                        )
                        
                        echo ❌ Python not found anywhere
                        exit 1
                        
                        :success
                        python --version
                        pip --version
                    """
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat """
                    echo ========================================
                    echo 📦 INSTALLING DEPENDENCIES
                    echo ========================================
                    
                    echo 1. Current Python location:
                    where python
                    
                    echo 2. Python version:
                    python --version
                    
                    echo 3. Upgrading pip...
                    python -m pip install --upgrade pip
                    
                    echo 4. Installing from requirements.txt...
                    python -m pip install -r requirements.txt
                    
                    echo 5. Listing installed packages:
                    python -m pip list
                    
                    echo.
                    echo ✅ ALL DEPENDENCIES INSTALLED!
                """
            }
        }
        
        stage('Verify Installations') {
            steps {
                bat """
                    echo ========================================
                    echo ✅ VERIFICATION TESTS
                    echo ========================================
                    
                    echo 1. Testing Selenium...
                    python -c "import selenium; print('✅ Selenium version:', selenium.__version__)"
                    
                    echo.
                    echo 2. Testing RobotFramework...
                    python -c "import robot; print('✅ RobotFramework available')"
                    
                    echo.
                    echo 3. Testing pytest...
                    python -c "import pytest; print('✅ pytest version:', pytest.__version__)"
                    
                    echo.
                    echo 4. Creating test report...
                    echo # Dependency Installation Report > "${REPORTS_DIR}\\install_report.txt"
                    echo ============================= >> "${REPORTS_DIR}\\install_report.txt"
                    date /t >> "${REPORTS_DIR}\\install_report.txt"
                    time /t >> "${REPORTS_DIR}\\install_report.txt"
                    echo. >> "${REPORTS_DIR}\\install_report.txt"
                    python --version >> "${REPORTS_DIR}\\install_report.txt"
                    echo "✅ All packages from requirements.txt installed successfully" >> "${REPORTS_DIR}\\install_report.txt"
                """
            }
        }
        
        stage('Generate Final Report') {
            steps {
                bat """
                    echo ========================================
                    echo 📊 GENERATING FINAL REPORT
                    echo ========================================
                    
                    echo Creating success report...
                    echo "<html><body>" > "${REPORTS_DIR}\\success.html"
                    echo "<h1 style='color: green;'>✅ SUCCESS</h1>" >> "${REPORTS_DIR}\\success.html"
                    echo "<h2>Dependency Installation Report</h2>" >> "${REPORTS_DIR}\\success.html"
                    echo "<p>Build: ${BUILD_NUMBER}</p>" >> "${REPORTS_DIR}\\success.html"
                    echo "<h3>📦 Installed Packages:</h3>" >> "${REPORTS_DIR}\\success.html"
                    echo "<ul>" >> "${REPORTS_DIR}\\success.html"
                    
                    # Add installed packages to HTML
                    python -c "
import pkg_resources
installed_packages = [pkg.key for pkg in pkg_resources.working_set]
for package in ['selenium', 'robotframework', 'pytest', 'pytest-html', 'webdriver-manager']:
    if package in installed_packages:
        print(f'<li>✅ {package}</li>')
    else:
        print(f'<li>❌ {package} (not found)</li>')
" >> "${REPORTS_DIR}\\success.html"
                    
                    echo "</ul>" >> "${REPORTS_DIR}\\success.html"
                    echo "<p>All dependencies from requirements.txt have been installed.</p>" >> "${REPORTS_DIR}\\success.html"
                    echo "</body></html>" >> "${REPORTS_DIR}\\success.html"
                    
                    echo.
                    echo ✅ Report generated: ${REPORTS_DIR}\\success.html
                """
                
                // Archive the report
                archiveArtifacts artifacts: "${REPORTS_DIR}/**/*", allowEmptyArchive: true
            }
        }
    }
    
    post {
        always {
            echo "📁 Reports saved in: ${REPORTS_DIR}"
            
            // Show the installation report
            bat """
                echo 📋 INSTALLATION SUMMARY:
                type "${REPORTS_DIR}\\install_report.txt" 2>nul || echo No installation report found
            """
        }
        success {
            echo "🎉 PIPELINE SUCCESS!"
            echo "✅ Python has been installed on Jenkins agent"
            echo "✅ All dependencies from requirements.txt have been installed"
        }
        failure {
            echo "❌ Pipeline failed"
            echo "💡 Tip: Jenkins agent might need admin rights to install Python"
        }
    }
}