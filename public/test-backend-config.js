/**
 * Script de test pour vérifier la configuration backend
 * À exécuter dans la console du navigateur (F12)
 */

console.log('🧪 TEST CONFIGURATION BACKEND');
console.log('='.repeat(60));

// 1. Vérifier les variables d'environnement Vite
console.log('\n📊 Variables d'environnement:');
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

// 2. Test de l'API
console.log('\n🌐 Test API Backend...');
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
console.log('URL utilisée:', backendUrl);

// Test Health
fetch(`${backendUrl}/api/health`)
  .then(r => r.json())
  .then(data => {
    console.log('✅ Health check:', data);
  })
  .catch(err => {
    console.error('❌ Health check échoué:', err);
  });

// Test Files
fetch(`${backendUrl}/api/files`)
  .then(r => r.json())
  .then(data => {
    console.log('✅ Files API:', data);
    if (data.files) {
      console.log('📁 Fichiers détectés:');
      Object.keys(data.files).forEach(key => {
        console.log(`  - ${key}:`, data.files[key].current?.originalName || 'N/A');
      });
    }
  })
  .catch(err => {
    console.error('❌ Files API échoué:', err);
  });

console.log('\n' + '='.repeat(60));
console.log('✅ Script de test chargé. Vérifiez les résultats ci-dessus.');
