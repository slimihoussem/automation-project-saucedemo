pipeline {
    agent any
    
    parameters {
        choice(
            name: 'BROWSER',
            choices: ['chrome'],
            description: 'browser for tests'
        )
        string(
            name: 'BASE_URL',
            defaultValue: 'https://www.saucedemo.com',
            description: 'Base URL for the application'
        )
        booleanParam(
            name: 'HEADLESS',
            defaultValue: true,
            description: 'Run tests in headless mode'
        )
    }
    
    environment {
        // Directory paths
        ROBOT_TESTS = 'robot_tests'
        SELENIUM_TESTS = 'selenium_tests'
        PLAYWRIGHT_TESTS = 'playwright_tests'
        
        // Report directories
        REPORTS_DIR = 'reports'
        ROBOT_REPORTS = "${REPORTS_DIR}/robotframework"
        SELENIUM_REPORTS = "${REPORTS_DIR}/selenium"
        PLAYWRIGHT_REPORTS = "${REPORTS_DIR}/playwright"
        
        // Test results
        BUILD_STATUS = 'UNKNOWN'
    }
    
    stages {
        stage('Clean Workspace') {
            steps {
                echo '🚀 Starting Test Automation Pipeline'
                echo '📦 Cleaning workspace...'
                cleanWs()
                
                // Create report directories
                sh '''
                mkdir -p reports/robotframework
                mkdir -p reports/selenium
                mkdir -p reports/playwright
                '''
            }
        }
        
        stage('Checkout Code') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            parallel {
                stage('Setup Python Environment') {
                    steps {
                        echo '🐍 Setting up Python environment...'
                        script {
                            // Create virtual environment
                            sh 'python3 -m venv venv || python -m venv venv'
                            
                            // Activate and install requirements
                            sh '''
                            source venv/bin/activate || venv\\Scripts\\activate
                            pip install --upgrade pip
                            pip install -r requirements.txt
                            
                            # Install webdriver manager for Selenium
                            pip install webdriver-manager
                            
                            # Install pytest for Selenium tests if needed
                            pip install pytest pytest-html
                            '''
                        }
                    }
                }
                
                stage('Setup Node.js Environment') {
                    steps {
                        echo '⬢ Setting up Node.js environment...'
                        script {
                            dir(env.PLAYWRIGHT_TESTS) {
                                // Install dependencies
                                sh 'npm ci || npm install'
                                
                                // Install Playwright browsers
                                sh 'npx playwright install'
                                
                                // Install Playwright test runner
                                sh 'npm install -g @playwright/test'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Run All Tests in Parallel') {
            parallel {
                stage('Run RobotFramework Tests') {
                    steps {
                        echo '🤖 Running RobotFramework tests...'
                        script {
                            dir(env.ROBOT_TESTS) {
                                sh """
                                source ../venv/bin/activate || ..\\venv\\Scripts\\activate
                                
                                # Set environment variables
                                export BROWSER=${params.BROWSER}
                                export BASE_URL=${params.BASE_URL}
                                export HEADLESS=${params.HEADLESS}
                                
                                # Run all robot tests
                                robot --outputdir ../${env.ROBOT_REPORTS} \
                                      --log robot_log.html \
                                      --report robot_report.html \
                                      --output output.xml \
                                      --xunit xunit.xml \
                                      --variable BROWSER:${params.BROWSER} \
                                      --variable BASE_URL:${params.BASE_URL} \
                                      --variable HEADLESS:${params.HEADLESS} \
                                      .
                                """
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                // Archive robot results
                                junit "${env.ROBOT_REPORTS}/xunit.xml"
                                archiveArtifacts artifacts: "${env.ROBOT_REPORTS}/robot_report.html, ${env.ROBOT_REPORTS}/robot_log.html"
                                
                                // Check if tests passed
                                def robotResult = sh(
                                    script: "test -f ${env.ROBOT_REPORTS}/output.xml && echo 'ROBOT_TESTS_EXIST' || echo 'NO_ROBOT_TESTS'",
                                    returnStdout: true
                                ).trim()
                                
                                if (robotResult == 'NO_ROBOT_TESTS') {
                                    echo "⚠️ No RobotFramework tests found or all were skipped"
                                }
                            }
                        }
                    }
                }
                
                stage('Run Selenium Tests') {
                    steps {
                        echo '🌐 Running Selenium tests...'
                        script {
                            dir(env.SELENIUM_TESTS) {
                                sh """
                                source ../venv/bin/activate || ..\\venv\\Scripts\\activate
                                
                                # Set environment variables
                                export BROWSER=${params.BROWSER}
                                export BASE_URL=${params.BASE_URL}
                                export HEADLESS=${params.HEADLESS}
                                
                                # Run pytest for Selenium tests
                                python -m pytest . \
                                    --junitxml=../${env.SELENIUM_REPORTS}/selenium_results.xml \
                                    --html=../${env.SELENIUM_REPORTS}/selenium_report.html \
                                    --self-contained-html \
                                    -v
                                """
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                // Archive selenium results
                                junit "${env.SELENIUM_REPORTS}/selenium_results.xml"
                                archiveArtifacts artifacts: "${env.SELENIUM_REPORTS}/selenium_report.html"
                                
                                // Check if tests exist
                                def seleniumResult = sh(
                                    script: "test -f ${env.SELENIUM_REPORTS}/selenium_results.xml && echo 'SELENIUM_TESTS_EXIST' || echo 'NO_SELENIUM_TESTS'",
                                    returnStdout: true
                                ).trim()
                                
                                if (seleniumResult == 'NO_SELENIUM_TESTS') {
                                    echo "⚠️ No Selenium tests found or all were skipped"
                                }
                            }
                        }
                    }
                }
                
                stage('Run Playwright Tests') {
                    steps {
                        echo '🎭 Running Playwright tests...'
                        script {
                            // Set browser based on parameter
                            def browserProject = params.BROWSER
                            
                            dir(env.PLAYWRIGHT_TESTS) {
                                sh """
                                # Set environment variables
                                export BASE_URL="${params.BASE_URL}"
                                export HEADLESS="${params.HEADLESS}"
                                
                                # Run Playwright tests
                                npx playwright test \
                                    --project=${browserProject} \
                                    --reporter=html \
                                    --output=../${env.PLAYWRIGHT_REPORTS} \
                                    --reporter=junit,../${env.PLAYWRIGHT_REPORTS}/playwright_results.xml
                                """
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                // Archive playwright results
                                junit "${env.PLAYWRIGHT_REPORTS}/playwright_results.xml"
                                
                                // Copy Playwright HTML report
                                sh """
                                if [ -d "${env.PLAYWRIGHT_TESTS}/playwright-report" ]; then
                                    cp -r ${env.PLAYWRIGHT_TESTS}/playwright-report ${env.PLAYWRIGHT_REPORTS}/ || true
                                fi
                                """
                                
                                archiveArtifacts artifacts: "${env.PLAYWRIGHT_REPORTS}/**/*"
                                
                                // Check if tests exist
                                def playwrightResult = sh(
                                    script: "test -f ${env.PLAYWRIGHT_REPORTS}/playwright_results.xml && echo 'PLAYWRIGHT_TESTS_EXIST' || echo 'NO_PLAYWRIGHT_TESTS'",
                                    returnStdout: true
                                ).trim()
                                
                                if (playwrightResult == 'NO_PLAYWRIGHT_TESTS') {
                                    echo "⚠️ No Playwright tests found or all were skipped"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Generate Consolidated Report') {
            steps {
                echo '📊 Generating consolidated test report...'
                script {
                    // Create summary statistics
                    sh '''
                    echo "# 🚀 Test Automation Results Summary" > ${REPORTS_DIR}/SUMMARY.md
                    echo "" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "## Build Information" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "- **Build Number:** ${BUILD_NUMBER}" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "- **Build URL:** ${BUILD_URL}" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "- **Execution Time:** $(date)" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "- **Browser:** '${BROWSER}'" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "- **Base URL:** '${BASE_URL}'" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "- **Headless Mode:** '${HEADLESS}'" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "" >> ${REPORTS_DIR}/SUMMARY.md
                    
                    echo "## 📁 Test Results" >> ${REPORTS_DIR}/SUMMARY.md
                    echo "" >> ${REPORTS_DIR}/SUMMARY.md
                    
                    # RobotFramework results
                    if [ -f "${ROBOT_REPORTS}/output.xml" ]; then
                        echo "### 🤖 RobotFramework Tests" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "- [Report](${ROBOT_REPORTS}/robot_report.html)" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "- [Log](${ROBOT_REPORTS}/robot_log.html)" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "" >> ${REPORTS_DIR}/SUMMARY.md
                    fi
                    
                    # Selenium results
                    if [ -f "${SELENIUM_REPORTS}/selenium_results.xml" ]; then
                        echo "### 🌐 Selenium Tests" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "- [Report](${SELENIUM_REPORTS}/selenium_report.html)" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "" >> ${REPORTS_DIR}/SUMMARY.md
                    fi
                    
                    # Playwright results
                    if [ -d "${PLAYWRIGHT_REPORTS}/playwright-report" ]; then
                        echo "### 🎭 Playwright Tests" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "- [Report](${PLAYWRIGHT_REPORTS}/playwright-report/index.html)" >> ${REPORTS_DIR}/SUMMARY.md
                        echo "" >> ${REPORTS_DIR}/SUMMARY.md
                    fi
                    '''
                    
                    // Create HTML dashboard
                    writeFile(
                        file: "${env.REPORTS_DIR}/dashboard.html",
                        text: """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Test Automation Dashboard</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
                                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
                                .stats { display: flex; gap: 20px; margin-bottom: 30px; }
                                .stat-card { flex: 1; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                                .stat-card h3 { margin-top: 0; color: #333; }
                                .stat-card .number { font-size: 36px; font-weight: bold; margin: 10px 0; }
                                .framework-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
                                .framework-header { display: flex; align-items: center; margin-bottom: 15px; }
                                .framework-icon { font-size: 24px; margin-right: 15px; }
                                .links a { display: inline-block; background: #007bff; color: white; padding: 8px 15px; margin: 5px; border-radius: 5px; text-decoration: none; }
                                .links a:hover { background: #0056b3; }
                                .success { color: #28a745; }
                                .warning { color: #ffc107; }
                                .danger { color: #dc3545; }
                                .build-info { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>🚀 Test Automation Dashboard</h1>
                                <p>Consolidated results from all test frameworks</p>
                            </div>
                            
                            <div class="build-info">
                                <h2>📋 Build Information</h2>
                                <p><strong>Build #${env.BUILD_NUMBER}</strong></p>
                                <p><strong>Date:</strong> ${new Date().format("yyyy-MM-dd HH:mm:ss")}</p>
                                <p><strong>Browser:</strong> ${params.BROWSER}</p>
                                <p><strong>Base URL:</strong> ${params.BASE_URL}</p>
                                <p><strong>Headless:</strong> ${params.HEADLESS}</p>
                            </div>
                            
                            <div class="framework-card">
                                <div class="framework-header">
                                    <div class="framework-icon">🤖</div>
                                    <h2>RobotFramework Tests</h2>
                                </div>
                                <p>Behavior-driven testing framework using Selenium</p>
                                <div class="links">
                                    <a href="robotframework/robot_report.html" target="_blank">📊 Test Report</a>
                                    <a href="robotframework/robot_log.html" target="_blank">📋 Execution Log</a>
                                </div>
                            </div>
                            
                            <div class="framework-card">
                                <div class="framework-header">
                                    <div class="framework-icon">🌐</div>
                                    <h2>Selenium Tests</h2>
                                </div>
                                <p>Python-based Selenium WebDriver tests</p>
                                <div class="links">
                                    <a href="selenium/selenium_report.html" target="_blank">📊 HTML Report</a>
                                    <a href="selenium/selenium_results.xml" target="_blank">📋 JUnit Results</a>
                                </div>
                            </div>
                            
                            <div class="framework-card">
                                <div class="framework-header">
                                    <div class="framework-icon">🎭</div>
                                    <h2>Playwright Tests</h2>
                                </div>
                                <p>Modern end-to-end testing with Playwright</p>
                                <div class="links">
                                    <a href="playwright/playwright-report/index.html" target="_blank">📊 Interactive Report</a>
                                    <a href="playwright/playwright_results.xml" target="_blank">📋 JUnit Results</a>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 40px; color: #666;">
                                <p>Generated by Jenkins Test Automation Pipeline</p>
                                <p><a href="${env.BUILD_URL}">View Build #${env.BUILD_NUMBER}</a></p>
                            </div>
                        </body>
                        </html>
                        """
                    )
                }
            }
        }
        
        stage('Archive and Notify') {
            steps {
                echo '📦 Archiving test results...'
                script {
                    // Archive all reports
                    archiveArtifacts artifacts: "${env.REPORTS_DIR}/**/*"
                    
                    // Publish HTML reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.REPORTS_DIR}",
                        reportFiles: 'dashboard.html',
                        reportName: 'Test Dashboard'
                    ])
                    
                    // Calculate overall status
                    def allTestsPassed = true
                    
                    // Check RobotFramework results
                    if (fileExists("${env.ROBOT_REPORTS}/output.xml")) {
                        def robotExitCode = sh(
                            script: "grep -q 'status=\"PASS\"' ${env.ROBOT_REPORTS}/output.xml || echo 'FAILED'",
                            returnStatus: true
                        )
                        if (robotExitCode != 0) {
                            allTestsPassed = false
                            echo "❌ RobotFramework tests failed"
                        }
                    }
                    
                    // Check Selenium results
                    if (fileExists("${env.SELENIUM_REPORTS}/selenium_results.xml")) {
                        def seleniumExitCode = sh(
                            script: "grep -q 'failures=\"0\"' ${env.SELENIUM_REPORTS}/selenium_results.xml && grep -q 'errors=\"0\"' ${env.SELENIUM_REPORTS}/selenium_results.xml || echo 'FAILED'",
                            returnStatus: true
                        )
                        if (seleniumExitCode != 0) {
                            allTestsPassed = false
                            echo "❌ Selenium tests failed"
                        }
                    }
                    
                    // Check Playwright results
                    if (fileExists("${env.PLAYWRIGHT_REPORTS}/playwright_results.xml")) {
                        def playwrightExitCode = sh(
                            script: "grep -q 'failures=\"0\"' ${env.PLAYWRIGHT_REPORTS}/playwright_results.xml && grep -q 'errors=\"0\"' ${env.PLAYWRIGHT_REPORTS}/playwright_results.xml || echo 'FAILED'",
                            returnStatus: true
                        )
                        if (playwrightExitCode != 0) {
                            allTestsPassed = false
                            echo "❌ Playwright tests failed"
                        }
                    }
                    
                    env.BUILD_STATUS = allTestsPassed ? 'SUCCESS' : 'FAILURE'
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up temporary files...'
            sh '''
            # Clean virtual environment
            rm -rf venv || true
            
            # Clean node_modules
            rm -rf playwright_tests/node_modules || true
            '''
            
            echo "🏁 Pipeline completed with status: ${env.BUILD_STATUS}"
        }
        
        success {
            echo '✅ All tests completed successfully!'
            script {
                // Send success notification
                emailext(
                    subject: "✅ Test Automation PASSED - Build #${env.BUILD_NUMBER}",
                    body: """
                    <h2>🎉 All Tests Passed Successfully!</h2>
                    <h3>Build Information:</h3>
                    <ul>
                        <li><strong>Build Number:</strong> ${env.BUILD_NUMBER}</li>
                        <li><strong>Status:</strong> ✅ PASSED</li>
                        <li><strong>Browser:</strong> ${params.BROWSER}</li>
                        <li><strong>Base URL:</strong> ${params.BASE_URL}</li>
                        <li><strong>Headless Mode:</strong> ${params.HEADLESS}</li>
                    </ul>
                    
                    <h3>📊 Test Reports:</h3>
                    <ul>
                        <li><a href="${env.BUILD_URL}Test_Dashboard/">Test Dashboard</a></li>
                        <li><a href="${env.BUILD_URL}artifact/${env.REPORTS_DIR}/robotframework/robot_report.html">RobotFramework Report</a></li>
                        <li><a href="${env.BUILD_URL}artifact/${env.REPORTS_DIR}/selenium/selenium_report.html">Selenium Report</a></li>
                        <li><a href="${env.BUILD_URL}artifact/${env.PLAYWRIGHT_REPORTS}/playwright-report/index.html">Playwright Report</a></li>
                    </ul>
                    
                    <p>All test frameworks executed successfully!</p>
                    """,
                    to: 'slimihoussem1@gmail.com',
                    mimeType: 'text/html'
                )
            }
        }
        
        failure {
            echo '❌ Some tests failed!'
            script {
                // Send failure notification
                emailext(
                    subject: "❌ Test Automation FAILED - Build #${env.BUILD_NUMBER}",
                    body: """
                    <h2>⚠️ Test Automation Failed</h2>
                    <h3>Build Information:</h3>
                    <ul>
                        <li><strong>Build Number:</strong> ${env.BUILD_NUMBER}</li>
                        <li><strong>Status:</strong> ❌ FAILED</li>
                        <li><strong>Browser:</strong> ${params.BROWSER}</li>
                        <li><strong>Base URL:</strong> ${params.BASE_URL}</li>
                        <li><strong>Headless Mode:</strong> ${params.HEADLESS}</li>
                    </ul>
                    
                    <h3>🔗 Quick Links:</h3>
                    <ul>
                        <li><a href="${env.BUILD_URL}Test_Dashboard/">Test Dashboard</a></li>
                        <li><a href="${env.BUILD_URL}console">Console Output</a></li>
                        <li><a href="${env.BUILD_URL}artifact/${env.REPORTS_DIR}/SUMMARY.md">Summary Report</a></li>
                    </ul>
                    
                    <h3>📋 Failed Tests:</h3>
                    <p>Check the individual test reports for details:</p>
                    <ul>
                        <li><a href="${env.BUILD_URL}artifact/${env.REPORTS_DIR}/robotframework/robot_report.html">RobotFramework</a></li>
                        <li><a href="${env.BUILD_URL}artifact/${env.REPORTS_DIR}/selenium/selenium_report.html">Selenium</a></li>
                        <li><a href="${env.BUILD_URL}artifact/${env.PLAYWRIGHT_REPORTS}/playwright-report/index.html">Playwright</a></li>
                    </ul>
                    """,
                    to: 'slimihoussem.com',
                    mimeType: 'text/html'
                )
            }
        }
    }
}