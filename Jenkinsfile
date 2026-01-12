      // Python virtualenv
        VENV = "${WORKSPACE}/venv"
    }

    stages {

        stage('Checkout') {
            steps {
                echo " ~D Checkout du code source"
                checkout scm
            }
        }

        stage('Setup Python & Install Requirements') {
            steps {
                echo " ~M Création du virtualenv Python et installation des dépendances"
                sh """
                    python3 -m venv ${VENV}
                    source ${VENV}/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                """
            }
        }

        stage('Install Node & Playwright') {
            steps {
                echo "⚙️ Installation des dépendances Node.js et Playwright"
                sh """
                    npm install
                    npx playwright install
                """
            }
        }

        stage('Run Playwright Tests') {
            steps {
                echo " M-- Exécution des tests Playwright"
                sh """
                    npx playwright test --reporter=html --output=reports/playwright
                """
            }
        }

        stage('Publish Report') {
            steps {
                echo " ~D Publication du rapport HTML"
                publishHTML([
                    rep
