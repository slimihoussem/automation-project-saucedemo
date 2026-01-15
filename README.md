# automation-project-saucedemo
Projet d'automatisation de tests pour Saucedemo.com
# 🧪 Automation Testing Project – Saucedemo


A multi-technology QA automation framework designed to test the core functionalities of the Saucedemo web application. In addition to technical automation skills, this project emphasizes **team collaboration, documentation quality, presentation skills, and effective communication**. These aspects reflect real-world QA environments where testers must clearly communicate their work, results, and risks to different stakeholders such as developers, QA leads, product owners, and non-technical business teams. The project demonstrates modern test automation practices using Playwright, Selenium, and Robot Framework, integrated into a CI/CD pipeline with Jenkins and test management via JIRA XRAY.




---

## 📌 Project Objectives

- Automate critical user workflows on Saucedemo.com
- Demonstrate proficiency in multiple automation tools
- Apply clean project structure and GitHub best practices
- Enable local and CI execution of automated tests
- Generate clear and actionable test reports

---

## 🛠 Tech Stack

- Playwright (JavaScript) – Modern end-to-end testing  
- Selenium (Python) – UI automation  
- Robot Framework – Keyword-driven testing  
- Jenkins – Continuous Integration  
- Git & GitHub – Version control  
- JIRA XRAY – Test case management  

---

## 📂 Project Structure

automation-project-saucedemo/
├── playwright_tests/        # Playwright E2E tests (JavaScript)
├── selenium_tests/          # Selenium tests (Python)
├── robot_tests/             # Robot Framework tests
├── jenkins/                 # Jenkins pipeline configuration
├── reports/                 # Generated test reports
├── .gitignore
├── requirements.txt         # Python dependencies
├── package.json             # Node.js dependencies
└── README.md

---

## ✅ Test Coverage

| Technology | Test Description |
|------------|------------------|
| Playwright | Product filtering & sorting |
| Playwright | Complete checkout process |
| Selenium (Python) | Login error handling |
| Selenium (Python) | Product navigation & validation |
| Robot Framework | Burger menu navigation |

---

## ⚙️ Prerequisites

- Git  
- Node.js v18+  
- Python 3.10+  
- pip  
- Google Chrome  
- (Optional) Jenkins with Java JDK 11+  

---

## 🚀 Installation

Clone the repository:

git clone https://github.com/your-username/automation-project-saucedemo.git  
cd automation-project-saucedemo  

Install Python dependencies:

pip install -r requirements.txt  

Install Playwright dependencies:

cd playwright_tests  
npm install  
npx playwright install  

---

## ▶️ Running the Tests

### Playwright

cd playwright_tests  
npx playwright test  
npx playwright show-report  

### Selenium (Python)

cd selenium_tests  
python -m pytest  

### Robot Framework

cd robot_tests  
robot --outputdir ../reports robot_tests.robot  

---

## 📊 Reports

Test reports are generated in the reports/ directory:
- Playwright HTML report
- Robot Framework report.html and log.html
- Selenium execution output

---

## 🔐 Test Credentials

standard_user / secret_sauce  
problem_user / secret_sauce  
locked_out_user / secret_sauce  

---

## 🔄 CI/CD (Jenkins)

The Jenkins pipeline performs:
1. Source code checkout  
2. Dependency installation (Node.js and Python)  
3. Execution of Robot Framework tests  
4. Execution of Playwright tests  
5. Execution of Selenium tests  
6. Publishing of HTML test reports  

---

## 📈 Improvements & Next Steps

- Parallel execution of tests
- Externalized test data management
- Dockerized test execution
- Automated XRAY result import
- Cross-browser test support

---

## 👤 Author

QA Automation Project – Saucedemo  
Advanced Test Automation Assessment