pipeline {
    agent any

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Reports Directory') {
            steps {
                echo 'Preparing reports directories...'
                bat 'mkdir reports || echo reports exists'
                bat 'mkdir reports/playwright || echo reports/playwright exists'
                bat 'mkdir reports/selenium || echo reports/selenium exists'
                bat 'mkdir reports/robot || echo reports/robot exists'
            }
        }

        stage('Install Node.js Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo 'Installing Playwright browsers...'
                bat 'npx playwright install'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Playwright tests...'
                    bat 'npx playwright test --reporter=html,junit --output=reports/playwright'
                    echo 'Archiving Playwright artifacts...'
                    archiveArtifacts artifacts: 'reports/playwright/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/playwright/**/*.xml'
                }
            }
        }

        stage('Install Python Dependencies') {
            steps {
                echo 'Installing Python dependencies...'
                bat 'py -m pip install --upgrade pip'
                bat 'py -m pip install -r requirements.txt'
            }
        }

        stage('Run Selenium Test') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Selenium test: TestConnexionError.py'
                    bat 'py -m pytest selenium_tests/TestConnexionError.py --junitxml=reports/selenium/results.xml'
                    echo 'Archiving Selenium artifacts...'
                    archiveArtifacts artifacts: 'reports/selenium/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/selenium/results.xml'
                }
            }
        }

        stage('Run Robot Framework Tests') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Running Robot Framework tests...'
                    bat 'py -m robot --outputdir reports/robot robot_tests/'
                    echo 'Archiving Robot Framework artifacts...'
                    archiveArtifacts artifacts: 'reports/robot/**', allowEmptyArchive: true
                    junit allowEmptyResults: true, testResults: 'reports/robot/output.xml'
                }
            }
        }

        stage('Print Test Summary') {
            steps {
                echo '====== TEST SUMMARY ======'
                // Using Python to parse all XMLs and summarize pass/fail counts
                bat '''py - <<END
import xml.etree.ElementTree as ET
import glob

def summarize_junit(path_pattern, name):
    files = glob.glob(path_pattern, recursive=True)
    total = passed = failed = 0
    for f in files:
        tree = ET.parse(f)
        root = tree.getroot()
        for testcase in root.iter('testcase'):
            total += 1
            if testcase.find('failure') is not None:
                failed += 1
            else:
                passed += 1
    print(f"{name}: Total={total}, Passed={passed}, Failed={failed}")

summarize_junit("reports/playwright/**/*.xml", "Playwright")
summarize_junit("reports/selenium/*.xml", "Selenium")
summarize_junit("reports/robot/output.xml", "Robot Framework")
END'''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. All reports are in reports/ directory.'
        }
    }
}
