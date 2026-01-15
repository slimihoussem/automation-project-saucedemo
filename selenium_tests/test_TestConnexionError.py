import json
import time
import sys
import os
from datetime import datetime

# ==============================================
# CONSTANTES DE CONFIGURATION
# ==============================================

# Chemins pour Chrome portable et ChromeDriver (peuvent être différents des fonctions)
CHROME_PORTABLE_PATH = r'C:\Chrome_Sources\chrome-win64\chrome.exe'
CHROME_DRIVER_PATH = r'C:\Chrome_Sources\chromedriver-win64\chromedriver.exe'
URL = "https://www.saucedemo.com/"
UNITTEST = False

def charger_donnees(json_path="ConnexionError.json"):
    """Charge les données de test depuis le fichier JSON"""
    with open(json_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def afficher_introduction():
    """Affiche l'introduction du programme"""
    print("\n" + "=" * 60)
    print("🚀 TESTS AUTOMATISÉS SAUCEDEMO - GESTION DES ERREURS")
    print("=" * 60)
    
    print("\n⚙️  CONFIGURATION:")
    print(f"   URL: {URL}")
    print(f"   Chrome portable: {os.path.exists(CHROME_PORTABLE_PATH)}")
    print(f"   ChromeDriver: {os.path.exists(CHROME_DRIVER_PATH)}")
    
    print("\n📋 TESTS INCLUS:")
    print("  1. ✅ Connexion nominale réussie")
    print("  2. ❌ Erreur - Utilisateur invalide")
    print("  3. ❌ Erreur - Sans nom d'utilisateur")
    print("  4. ❌ Erreur - Sans mot de passe")
    
    print("\n⚠️  IMPORTANT:")
    if not os.path.exists(CHROME_DRIVER_PATH):
        print("   ❌ ChromeDriver non trouvé au chemin spécifié")
        print("   💡 Solution: Téléchargez chromedriver et placez-le dans C:\\Chrome_Sources\\")
    else:
        print("   ✅ ChromeDriver trouvé")
    
    print("\n⏳ Démarrage dans 3 secondes...")
    time.sleep(3)

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
    
    # Résultats
    total_tests = len(scenarios)
    tests_reussis = 0
    resultats_detailles = []
    
    print("\n" + "=" * 60)
    print("EXÉCUTION DES TESTS")
    print("=" * 60)
    
    # Déterminer si on utilise Chrome portable ou système
    use_portable = os.path.exists(CHROME_PORTABLE_PATH) and os.path.exists(CHROME_DRIVER_PATH)
    
    for i, scenario in enumerate(scenarios, 1):
        # Importer les fonctions
        from FunctionSauceDemo import (
            ouvrir_chrome, fermer_chrome, 
            aller_site, executer_scenario
        )
        
        print(f"\n📌 Test {i}/{total_tests}")
        
        # Ouvrir navigateur
        driver = ouvrir_chrome(use_portable=use_portable)
        aller_site(driver)
        
        # Exécuter scénario
        debut_test = time.time()
        resultat, details = executer_scenario(driver, scenario)
        duree_test = time.time() - debut_test
        
        # Enregistrer résultat
        if resultat:
            tests_reussis += 1
            statut = "✅"
        else:
            statut = "❌"
        
        resultats_detailles.append({
            "numero": i,
            "cas": scenario["cas"],
            "resultat": resultat,
            "statut": statut,
            "details": details,
            "duree": duree_test
        })
        
        # Fermer navigateur
        fermer_chrome(driver)
        time.sleep(1)  # Pause entre les tests
    
    # Afficher résumé détaillé en tableau
    print("\n" + "=" * 60)
    print("RÉSUMÉ DÉTAILLÉ DES TESTS")
    print("=" * 60)
    
    print(f"\n┌{'─'*70}┐")
    print(f"│ {'N°':<3} {'SCÉNARIO':<25} {'STATUT':<10} {'DURÉE':<8} {'DÉTAILS':<20} │")
    print(f"├{'─'*70}┤")
    
    for resultat in resultats_detailles:
        # Tronquer les détails si trop longs
        details_tronques = resultat["details"][:20] + "..." if len(resultat["details"]) > 20 else resultat["details"]
        print(f"│ {resultat['numero']:<3} {resultat['cas']:<25} {resultat['statut']:<10} {resultat['duree']:.2f}s {'':<6} {details_tronques:<20} │")
    
    print(f"└{'─'*70}┘")
    
    # Calculer statistiques
    tests_echoues = total_tests - tests_reussis
    taux_reussite = (tests_reussis / total_tests * 100) if total_tests > 0 else 0
    temps_total = sum(r["duree"] for r in resultats_detailles)
    
    # Afficher tableau des statistiques
    print(f"\n┌{'─'*40}┐")
    print(f"│ 📋 TOTAL DES TESTS EXÉCUTÉS : {total_tests:2d}        │")
    print(f"│ ✅ TESTS RÉUSSIS           : {tests_reussis:2d}        │")
    print(f"│ ❌ TESTS ÉCHOUÉS           : {tests_echoues:2d}        │")
    print(f"│ 📊 TAUX DE RÉUSSITE        : {taux_reussite:6.1f}%     │")
    print(f"│ ⏱️  TEMPS TOTAL            : {temps_total:6.1f}s      │")
    print(f"└{'─'*40}┘")
    
    # Message final
    print("\n" + "=" * 60)
    print("CONCLUSION")
    print("=" * 60)
    
    if tests_reussis == total_tests:
        print("\n🎉🎉🎉 FÉLICITATIONS ! TOUS LES TESTS SONT RÉUSSIS ! 🎉🎉🎉")
    elif taux_reussite >= 80:
        print(f"\n👍 EXCELLENT ! {tests_reussis}/{total_tests} tests réussis")
    else:
        print(f"\n⚠️  {tests_echoues} test(s) échoué(s). Vérification nécessaire.")
    
    # Informations supplémentaires
    print(f"\n📅 Date d'exécution: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔧 Mode utilisé: {'Chrome portable' if use_portable else 'Chrome système'}")
    
   

def main():
    """Fonction principale"""
    try:
        run_tests()
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrompus par l'utilisateur")
    except Exception as e:
        print(f"\n🔥 ERREUR CRITIQUE: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n" + "=" * 60)
        print("👋 Programme terminé.")

if __name__ == "__main__":
    main()