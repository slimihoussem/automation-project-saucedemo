pipeline {
    agent any

    // This enables GitHub  webhook triggering
    triggers {
        // For GitHub webhooks
        githubPush()
        
        // Optional: Also poll for safety
        pollSCM('H/5 * * * *')
    }

    // Environment variables available via webhook
    environment {
        GIT_BRANCH = env.BRANCH_NAME ?: 'main'
        GIT_COMMIT = sh(script: 'git rev-parse HEAD', returnStd: true).trim()
        GIT_AUTHOR = sh(script: 'git log -1 --pretty=format:"%an"', returnStd: true).trim()
    }

    stages {
        stage('Checkout & Setup') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/slimihoussem/automation-project-saucedemo/',
                        credentialsId: 'github_cred'
                    ]],
                    extensions: [
                        // Clean workspace before checkout
                        [$class: 'CleanBeforeCheckout'],
                        // Checkout to subdirectory if needed
                        [$class: 'RelativeTargetDirectory', relativeTargetDir: 'src']
                    ]
                ])
                
                dir('src') {
                    bat '''
                        echo "📦 Installing dependencies..."
                        npm ci
                        
                        echo "🎭 Installing Playwright browsers..."
                        npx playwright install --with-deps chromium
                    '''
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                dir('src') {
                    bat '''
                        echo "🧪 Running tests on saucedemo.com..."
                        npx playwright test --reporter=html --output=../playwright-report --project=chromium
                    '''
                }
            }
        }

        stage('Publish Results') {
            steps {
                archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                
                // Optional: Generate simple test summary
                bat '''
                    echo "📊 Test Execution Summary" > test-summary.txt
                    echo "=========================" >> test-summary.txt
                    echo "Build: ${env.BUILD_NUMBER}" >> test-summary.txt
                    echo "Trigger: GitHub Webhook" >> test-summary.txt
                    echo "Branch: ${env.GIT_BRANCH}" >> test-summary.txt
                    echo "Commit: ${env.GIT_COMMIT}" >> test-summary.txt
                    echo "Author: ${env.GIT_AUTHOR}" >> test-summary.txt
                    echo "Report: playwright-report/index.html" >> test-summary.txt
                '''
                archiveArtifacts artifacts: 'test-summary.txt'
            }
        }
    }

    post {
        always {
            echo "🔔 Build triggered by GitHub webhook"
            echo "📌 Branch: ${env.GIT_BRANCH}"
            echo "📌 Commit: ${env.GIT_COMMIT}"
            echo "📌 Author: ${env.GIT_AUTHOR}"
            
            // Cleanup
            bat '''
                rmdir /s /q src 2>nul || echo "Cleanup done"
                del /f /q test-summary.txt 2>nul || echo "File deleted"
            '''
        }
        success {
            echo "✅ All tests passed! ✅"
            // You can add Slack/Email notifications here
        }
        failure {
            echo "❌ Tests failed! ❌"
        }
        changed {
            echo "🔄 Build status changed!"
        }
    }
}
