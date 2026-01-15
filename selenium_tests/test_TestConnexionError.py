import json
import time
import os
from datetime import datetime
import xml.etree.ElementTree as ET

# ==============================================
# CONSTANTES DE CONFIGURATION
# ==============================================
CHROME_PORTABLE_PATH = r'C:\Chrome_Sources\chrome-win64\chrome.exe'
CHROME_DRIVER_PATH = r'C:\Chrome_Sources\chromedriver-win64\chromedriver.exe'
URL = "https://www.saucedemo.com/"

# ==============================================
# FUNCTIONS
# ==============================================

def charger_donnees(json_path="selenium_tests/ConnexionError.json"):
    """Charge les données de test depuis le fichier JSON"""
    with open(json_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def afficher_introduction():
    """Affiche l'introduction du programme"""
    print("\n" + "=" * 60)
    print("🚀 SELENIUM AUTOMATED TESTS - SAUCEDEMO")
    print("=" * 60)
    print(f"URL: {URL}")
    print(f"Chrome portable exists: {os.path.exists(CHROME_PORTABLE_PATH)}")
    print(f"ChromeDriver exists: {os.path.exists(CHROME_DRIVER_PATH)}")
    print("\n⏳ Démarrage dans 2 secondes...")
    time.sleep(2)

def save_junit_xml(resultats, output_file="reports/selenium/selenium-results.xml"):
    """Crée un fichier JUnit XML pour Jenkins"""
    testsuites = ET.Element("testsuites")
    testsuite = ET.SubElement(testsuites, "testsuite", {
        "name": "Selenium Custom Tests",
        "tests": str(len(resultats)),
        "failures": str(sum(not r["resultat"] for r in resultats)),
        "errors": "0",
        "skipped": "0"
    })
    
    for r in resultats:
        testcase = ET.SubElement(testsuite, "testcase", {
            "classname": "Selenium",
            "name": r["cas"],
            "time": f"{r['duree']:.2f}"
        })
        if not r["resultat"]:
            failure = ET.SubElement(testcase, "failure")
            failure.text = r["details"]
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    tree = ET.ElementTree(testsuites)
    tree.write(output_file, encoding="utf-8", xml_declaration=True)
    print(f"\n✅ JUnit XML saved to {output_file}")

def run_tests():
    """Exécute tous les tests de connexion"""
    afficher_introduction()
    
    # Charger données
    try:
        data = charger_donnees()
        scenarios = data["scenarios"]
    except Exception as e:
        print(f"❌ Erreur chargement JSON: {e}")
        return
    
    total_tests = len(scenarios)
    tests_reussis = 0
    resultats_detailles = []

    print("\n" + "=" * 60)
    print("EXÉCUTION DES TESTS")
    print("=" * 60)

    use_portable = os.path.exists(CHROME_PORTABLE_PATH) and os.path.exists(CHROME_DRIVER_PATH)

    for i, scenario in enumerate(scenarios, 1):
        # Importer les fonctions
        from selenium_tests.FunctionSauceDemo import ouvrir_chrome, fermer_chrome, aller_site, executer_scenario
        
        print(f"\n📌 Test {i}/{total_tests} : {scenario['cas']}")
        driver = ouvrir_chrome(use_portable=use_portable)
        aller_site(driver)

        debut_test = time.time()
        resultat, details = executer_scenario(driver, scenario)
        duree_test = time.time() - debut_test

        statut = "✅" if resultat else "❌"
        if resultat: tests_reussis += 1

        resultats_detailles.append({
            "numero": i,
            "cas": scenario["cas"],
            "resultat": resultat,
            "statut": statut,
            "details": details,
            "duree": duree_test
        })

        fermer_chrome(driver)
        time.sleep(0.5)

    # Affichage console détaillé
    print("\n" + "=" * 60)
    print("RÉSUMÉ DES TESTS")
    print("=" * 60)
    for r in resultats_detailles:
        print(f"{r['statut']} Test {r['numero']}: {r['cas']} ({r['duree']:.2f}s) - {r['details']}")

    # Statistiques
    tests_echoues = total_tests - tests_reussis
    taux_reussite = (tests_reussis / total_tests * 100) if total_tests else 0
    temps_total = sum(r["duree"] for r in resultats_detailles)

    print("\n" + "=" * 40)
    print(f"📋 Total tests : {total_tests}")
    print(f"✅ Tests réussis: {tests_reussis}")
    print(f"❌ Tests échoués: {tests_echoues}")
    print(f"📊 Taux de réussite: {taux_reussite:.1f}%")
    print(f"⏱️  Temps total: {temps_total:.2f}s")
    print("=" * 40)

    save_junit_xml(resultats_detailles)

def main():
    try:
        run_tests()
    except KeyboardInterrupt:
        print("⏹️ Tests interrompus par l'utilisateur")
    except Exception as e:
        print(f"🔥 ERREUR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("👋 Selenium tests finished.")

if __name__ == "__main__":
    main()
