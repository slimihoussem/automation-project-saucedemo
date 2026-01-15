pipeline {
    agent any

    stages {

        stage('Run Playwright Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Playwright tests...'
                    bat 'npx playwright test --reporter=html,junit --output=playwright-report'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                    junit 'playwright-report/junit-results.xml'
                }
            }
        }

        stage('Run Selenium Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Selenium tests...'
                    bat '''
                    cd selenium_tests
                    py TestConnexionError.py > ../test-results/selenium_results/output.txt 2>&1
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results/selenium_results/**', allowEmptyArchive: true
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Robot Framework tests...'
                    bat '''
                    cd robot_tests
                    py -m robot --outputdir ../test-results/robot_results .
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'test-results/robot_results/**', allowEmptyArchive: true
                    junit 'test-results/robot_results/output.xml'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Check archived artifacts for details.'
        }
    }
}
