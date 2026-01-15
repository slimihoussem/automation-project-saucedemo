from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time

# ==============================================
# CONSTANTES DE CONFIGURATION
# ==============================================

# Chemins pour Chrome portable et ChromeDriver
CHROME_PORTABLE_PATH = r'C:\Chrome_Sources\chrome-win64\chrome.exe'
CHROME_DRIVER_PATH = r'C:\Chrome_Sources\chromedriver-win64\chromedriver.exe'
URL = "https://www.saucedemo.com/"
UNITTEST = False

# ==============================================
# FONCTIONS
# ==============================================

def ouvrir_chrome(use_portable=False):
    """
    Ouvre un navigateur Chrome
    
    Args:
        use_portable (bool): Si True, utilise Chrome portable
    """
    if use_portable:
        try:
            # Configurer les options pour Chrome portable
            chrome_options = Options()
            chrome_options.binary_location = CHROME_PORTABLE_PATH
            
            # Désactiver le gestionnaire de mots de passe
            prefs = {
                "profile.password_manager_enabled": False,
                "credentials_enable_service": False
            }
            chrome_options.add_experimental_option("prefs", prefs)
            chrome_options.add_argument("--incognito")
            chrome_options.add_argument("--disable-extensions")
            
            service = Service(CHROME_DRIVER_PATH)
            driver = webdriver.Chrome(service=service, options=chrome_options)
            print("✅ Chrome portable ouvert")
        except Exception as e:
            print(f"❌ Erreur avec Chrome portable: {e}")
            print("⚠️  Utilisation de Chrome système par défaut")
            driver = webdriver.Chrome()
    else:
        # Utiliser Chrome système
        driver = webdriver.Chrome()
    
    driver.maximize_window()
    return driver

def fermer_chrome(driver):
    """Ferme le navigateur"""
    if driver:
        driver.quit()
        print("🔴 Navigateur fermé")

def aller_site(driver):
    """Ouvre le site saucedemo"""
    driver.get(URL)
    titre = driver.title
    print(f"📄 Page ouverte: {titre}")
    return titre

def remplir_formulaire(driver, username, password):
    """Remplit le formulaire de connexion"""
    driver.find_element(By.ID, "user-name").send_keys(username)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "login-button").click()

def verifier_message_erreur(driver, message_attendu):
    """Vérifie si le message d'erreur correspond à celui attendu"""
    try:
        element_erreur = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CLASS_NAME, "error-message-container"))
        )
        message_obtenu = element_erreur.text
        return message_attendu == message_obtenu, message_obtenu
    except:
        return False, "Aucun message d'erreur trouvé"

def tester_bouton_fermeture(driver):
    """Teste si le bouton de fermeture d'erreur fonctionne"""
    try:
        bouton_fermeture = driver.find_element(By.CLASS_NAME, "error-button")
        bouton_fermeture.click()
        
        # Vérifier que le message a disparu
        time.sleep(1)
        elements_erreur = driver.find_elements(By.CLASS_NAME, "error-message-container")
        return len(elements_erreur) == 0
    except:
        return False

def verifier_connexion_reussie(driver):
    """Vérifie si la connexion a réussi"""
    try:
        WebDriverWait(driver, 5).until(EC.url_contains("inventory"))
        return True, "Connexion réussie"
    except:
        return False, "Échec de connexion"

def executer_scenario(driver, scenario):
    """Exécute un scénario de test et retourne le résultat"""
    resultat = False
    details = ""
    
    print(f"\n🔍 Exécution du scénario: {scenario['cas']}")
    print(f"   👤 Utilisateur: '{scenario['username']}'")
    print(f"   🔒 Mot de passe: '{scenario['password']}'")
    
    # Remplir formulaire
    remplir_formulaire(driver, scenario["username"], scenario["password"])
    
    if scenario["attendu"] == "connexion_reussie":
        # Vérifier connexion réussie
        connexion_ok, message = verifier_connexion_reussie(driver)
        if connexion_ok:
            print("✅ Connexion réussie comme attendu")
            
            # Prendre capture d'écran
            try:
                driver.save_screenshot(f"test_{scenario['cas']}.png")
                print("📸 Capture d'écran sauvegardée")
            except:
                pass
                
            resultat = True
            details = "Connexion réussie"
        else:
            print("❌ Échec: La connexion aurait dû réussir")
            resultat = False
            details = "Connexion échouée alors qu'elle devait réussir"
            
    elif scenario["attendu"] == "erreur_connexion":
        # Vérifier message d'erreur
        erreur_ok, message = verifier_message_erreur(driver, scenario["message_erreur"])
        
        if erreur_ok:
            print(f"✅ Message d'erreur correct: {scenario['cas']}")
            details = f"Message d'erreur correct: {message}"
            
            # Tester bouton fermeture
            if tester_bouton_fermeture(driver):
                print("✅ Bouton de fermeture fonctionne")
                details += " + Bouton fermeture OK"
                resultat = True
            else:
                print("❌ Bouton de fermeture ne fonctionne pas")
                details += " - Bouton fermeture KO"
                resultat = False
        else:
            print(f"❌ Message d'erreur incorrect: {scenario['cas']}")
            print(f"   Attendu: {scenario['message_erreur']}")
            print(f"   Obtenu: {message}")
            resultat = False
            details = f"Message d'erreur incorrect: {message}"
    
    return resultat, details