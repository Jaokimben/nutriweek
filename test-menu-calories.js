/**
 * Script Playwright pour tester les calories de tous les plats
 * Remplit le questionnaire et capture les logs détaillés de calcul
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capturer TOUS les logs console
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({
      type: msg.type(),
      text: text
    });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  try {
    console.log('🚀 Ouverture de l\'application...');
    await page.goto('https://5173-i3apeogi3krbe5bmmtels-5185f4aa.sandbox.novita.ai', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('\n📝 Remplissage du questionnaire...\n');

    // Étape 1: Objectif (perte de poids)
    console.log('Étape 1: Sélection objectif...');
    await page.waitForSelector('.option-card', { timeout: 10000 });
    await page.click('.option-card:has-text("Perdre du poids")');
    await page.waitForTimeout(1000);

    // Étape 2: Informations générales (taille, poids, âge, genre, tour de taille)
    console.log('Étape 2: Informations générales...');
    await page.waitForSelector('input[placeholder="170"]', { timeout: 10000 });
    await page.fill('input[placeholder="170"]', '175'); // taille
    await page.fill('input[placeholder="70"]', '80'); // poids
    await page.fill('input[placeholder="30"]', '30'); // âge
    await page.click('.radio-label:has-text("Homme")'); // genre homme
    await page.fill('input[placeholder="85"]', '85'); // tour de taille
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(1000);

    // Étape 3: Nombre de repas
    console.log('Étape 3: Nombre de repas...');
    await page.waitForSelector('.option-card', { timeout: 10000 });
    await page.click('.option-card:has-text("Trois repas")');
    await page.waitForTimeout(1000);

    // Étape 4: Capacité digestive (peut skip)
    console.log('Étape 4: Capacité digestive...');
    await page.waitForSelector('button:has-text("Suivant")', { timeout: 10000 });
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(1000);

    // Étape 5: Intolérances
    console.log('Étape 5: Intolérances...');
    await page.waitForSelector('.checkbox-list', { timeout: 10000 });
    // Ne rien sélectionner (aucune intolérance)
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(1000);

    // Étape 6: Morphotype
    console.log('Étape 6: Morphotype...');
    await page.waitForSelector('.morphotype-card', { timeout: 10000 });
    await page.click('.morphotype-card:has-text("Mésomorphe")');
    await page.waitForTimeout(1000);

    // Étape 7: Activité physique
    console.log('Étape 7: Activité physique...');
    await page.waitForSelector('.option-card', { timeout: 10000 });
    await page.click('.option-card:has-text("Sédentaire")');
    await page.waitForTimeout(1000);
    
    console.log('\n⏳ Génération du menu en cours...\n');
    
    // Attendre que le composant WeeklyMenu soit visible
    await page.waitForSelector('.weekly-menu', { timeout: 15000 });
    
    console.log('\n✅ Menu généré ! Attente de tous les logs...\n');
    
    // Attendre que les meal-cards apparaissent
    await page.waitForSelector('.meal-card', { timeout: 10000 });
    
    // Attendre encore pour capturer tous les logs et que tous les repas se chargent
    await page.waitForTimeout(5000);

    console.log('\n' + '='.repeat(80));
    console.log('📊 ANALYSE DES CALORIES DE TOUS LES PLATS');
    console.log('='.repeat(80) + '\n');

    // Analyser les logs pour extraire les détails nutritionnels
    const nutritionLogs = consoleLogs.filter(log => 
      log.text.includes('📊 Détail nutritionnel') || 
      log.text.includes('Calcul nutrition pour') ||
      log.text.includes('CIQUAL') ||
      log.text.includes('calories')
    );

    if (nutritionLogs.length === 0) {
      console.log('⚠️  ATTENTION: Aucun log de calcul nutritionnel trouvé!');
      console.log('Les logs détaillés ne sont peut-être pas activés dans ciqualParser.js');
    } else {
      console.log(`\n✅ ${nutritionLogs.length} logs nutritionnels capturés\n`);
      nutritionLogs.forEach(log => console.log(log.text));
    }

    // Extraire les cartes de repas visibles
    console.log('\n' + '='.repeat(80));
    console.log('🍽️  VÉRIFICATION DES CALORIES AFFICHÉES DANS L\'UI');
    console.log('='.repeat(80) + '\n');

    const meals = await page.$$('.meal-card');
    console.log(`📋 Nombre de repas trouvés: ${meals.length}\n`);

    const highCalorieMeals = [];

    for (let i = 0; i < Math.min(meals.length, 21); i++) { // Limite à 21 repas (7 jours x 3 repas)
      const meal = meals[i];
      try {
        const mealName = await meal.$eval('h4', el => el.textContent.trim());
        const mealCalories = await meal.$eval('.meal-calories', el => el.textContent.trim());
        
        // Essayer de récupérer les macros si disponibles
        let macros = '';
        try {
          const macroElements = await meal.$$('.macro-item');
          if (macroElements.length > 0) {
            const macroTexts = await Promise.all(
              macroElements.map(el => el.textContent())
            );
            macros = ' | ' + macroTexts.join(' ');
          }
        } catch (e) {
          // Pas de macros disponibles
        }

        console.log(`${i + 1}. ${mealName}: ${mealCalories}${macros}`);
        
        // Alerter si calories > 800 kcal
        const calorieValue = parseInt(mealCalories.match(/\d+/)?.[0] || 0);
        if (calorieValue > 800) {
          console.log(`   ⚠️  ATTENTION: Calories élevées (${calorieValue} kcal)`);
          highCalorieMeals.push({ name: mealName, calories: calorieValue, macros });
        }
      } catch (e) {
        console.log(`${i + 1}. [Erreur de lecture du repas]`);
      }
    }

    // Rapport des plats à calories élevées
    if (highCalorieMeals.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  PLATS AVEC CALORIES ÉLEVÉES (>800 kcal)');
      console.log('='.repeat(80) + '\n');
      highCalorieMeals.forEach((meal, idx) => {
        console.log(`${idx + 1}. ${meal.name}: ${meal.calories} kcal ${meal.macros}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('📈 RÉSUMÉ');
    console.log('='.repeat(80) + '\n');

    // Afficher tous les logs console pour analyse
    console.log('TOUS LES LOGS CONSOLE:');
    console.log(JSON.stringify(consoleLogs, null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
})();
