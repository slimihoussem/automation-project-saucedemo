pipeline {
    agent any
    options { timestamps() }

    environment {
        PLAYWRIGHT_DIR = 'reports/playwright-json'
        SELENIUM_DIR   = 'reports/selenium-json'
        ROBOT_DIR      = 'reports/robot-xml'
        GLOBAL_HTML    = 'reports/global-test-report.html'
    }

    stages {

        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Prepare Directories') {
            steps {
                bat """
                if not exist reports mkdir reports
                if not exist ${PLAYWRIGHT_DIR} mkdir ${PLAYWRIGHT_DIR}
                if not exist ${SELENIUM_DIR} mkdir ${SELENIUM_DIR}
                if not exist ${ROBOT_DIR} mkdir ${ROBOT_DIR}
                """
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Node & Playwright') {
                    steps {
                        bat 'npm install'
                        bat 'npx playwright install'
                    }
                }
                stage('Python Dependencies') {
                    steps {
                        bat 'py -m pip install --upgrade pip'
                        bat 'py -m pip install -r requirements.txt pytest-json-report robotframework selenium'
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Playwright') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            npx playwright test playwright_tests/paiement_process.spec.ts --reporter=json:${PLAYWRIGHT_DIR}/paiement.json
                            npx playwright test playwright_tests/product-filter.spec.ts --reporter=json:${PLAYWRIGHT_DIR}/product-filter.json
                            """
                        }
                    }
                }

                stage('Selenium') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat """
                            py -m pytest selenium_tests/TestSauceDemo.py --json-report --json-report-file=${SELENIUM_DIR}/test1.json
                            py -m pytest selenium_tests/Tests_Check_Products.py --json-report --json-report-file=${SELENIUM_DIR}/test2.json
                            """
                        }
                    }
                }

                stage('Robot') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            bat "py -m robot --output ${ROBOT_DIR}/robot_output.xml robot_tests"
                        }
                    }
                }
            }
        }

        stage('Generate Global HTML') {
            steps {
                echo "Generating global HTML report..."
                bat """
                py - <<END
import os, json, xml.etree.ElementTree as ET
html = '<html><head><title>Global Test Report</title><style>body{font-family:Arial;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #333;padding:8px;text-align:left;}th{background:#eee;}.pass{background:#c6efce;}.fail{background:#ffc7ce;}</style></head><body><h1>Global Test Report</h1><table><tr><th>Framework</th><th>Test Name</th><th>Status</th></tr>'
for d,framework in [('${PLAYWRIGHT_DIR}','Playwright'),('${SELENIUM_DIR}','Selenium')]:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith('.json'):
                data = json.load(open(os.path.join(d,f)))
                for t in data.get('suites', []) if framework=='Playwright' else data.get('tests', []):
                    if framework=='Playwright':
                        for test in t.get('tests', []):
                            status = 'pass' if test['status']=='passed' else 'fail'
                            html += f"<tr><td>{framework}</td><td>{test['title']}</td><td class='{status}'>{status.upper()}</td></tr>"
                    else:
                        status = 'pass' if t['outcome']=='passed' else 'fail'
                        html += f"<tr><td>{framework}</td><td>{t['nodeid']}</td><td class='{status}'>{status.upper()}</td></tr>"
robot_dir = '${ROBOT_DIR}'
if os.path.exists(robot_dir):
    for f in os.listdir(robot_dir):
        if f.endswith('.xml'):
            tree = ET.parse(os.path.join(robot_dir,f))
            for test in tree.findall('.//test'):
                s = test.find('status').attrib.get('status')
                cls = 'pass' if s=='PASS' else 'fail'
                html += f"<tr><td>Robot</td><td>{test.attrib.get('name')}</td><td class='{cls}'>{s}</td></tr>"
html += '</table></body></html>'
with open('${GLOBAL_HTML}','w',encoding='utf-8') as o: o.write(html)
END
                """
            }
        }

        stage('Archive Report') {
            steps {
                archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Open ${GLOBAL_HTML} for full test report."
        }
    }
}
