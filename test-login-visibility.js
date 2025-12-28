// Script de test pour vérifier la visibilité des champs de login
// Utilise Playwright pour inspecter les styles CSS

const { chromium } = require('playwright');

async function testLoginVisibility() {
  console.log('🔍 Début du test de visibilité des champs de login...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Aller sur le site
    console.log('📍 Navigation vers: https://nutriweek-es33.vercel.app/');
    await page.goto('https://nutriweek-es33.vercel.app/', { waitUntil: 'networkidle' });
    
    // Attendre que le formulaire soit visible
    console.log('⏳ Attente du chargement du formulaire...');
    await page.waitForSelector('input[type="email"], input[type="password"]', { timeout: 10000 });
    
    // Trouver les inputs email et password
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (!emailInput || !passwordInput) {
      console.log('❌ Champs de formulaire non trouvés !');
      return;
    }
    
    console.log('✅ Champs de formulaire trouvés\n');
    
    // Vérifier les styles du champ email
    console.log('📧 === CHAMP EMAIL ===');
    const emailStyles = await emailInput.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        placeholder: computed.getPropertyValue('::placeholder')
      };
    });
    
    console.log('  color:', emailStyles.color);
    console.log('  backgroundColor:', emailStyles.backgroundColor);
    console.log('  border:', emailStyles.border);
    
    // Vérifier les styles du champ password
    console.log('\n🔒 === CHAMP PASSWORD ===');
    const passwordStyles = await passwordInput.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        border: computed.border
      };
    });
    
    console.log('  color:', passwordStyles.color);
    console.log('  backgroundColor:', passwordStyles.backgroundColor);
    console.log('  border:', passwordStyles.border);
    
    // Vérifier le contraste
    console.log('\n🎨 === ANALYSE DE CONTRASTE ===');
    
    function parseRGB(rgbString) {
      const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      }
      return null;
    }
    
    function calculateLuminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    function calculateContrast(rgb1, rgb2) {
      const l1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
      const l2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }
    
    const textColor = parseRGB(emailStyles.color);
    const bgColor = parseRGB(emailStyles.backgroundColor);
    
    if (textColor && bgColor) {
      const contrast = calculateContrast(textColor, bgColor);
      console.log('  Contraste calculé:', contrast.toFixed(2) + ':1');
      
      if (contrast >= 4.5) {
        console.log('  ✅ WCAG AA respecté (≥4.5:1)');
      } else if (contrast >= 3) {
        console.log('  ⚠️  Contraste faible (entre 3:1 et 4.5:1)');
      } else {
        console.log('  ❌ Contraste insuffisant (<3:1)');
      }
    }
    
    // Faire une capture d'écran
    console.log('\n📸 Capture d\'écran...');
    await page.screenshot({ path: '/home/user/webapp/test-login-visibility.png', fullPage: true });
    console.log('  Sauvegardée: /home/user/webapp/test-login-visibility.png');
    
    console.log('\n✅ Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur durant le test:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginVisibility();
