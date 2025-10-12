#!/usr/bin/env node

/**
 * Script de vérification pré-déploiement - Checkout Refonte 2025
 * 
 * Vérifie que toutes les dépendances et configurations sont en place
 * avant d'utiliser le nouveau checkout.
 * 
 * Usage:
 *   node verify-checkout-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration du nouveau checkout...\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Vérifier package.json pour dépendances
console.log('📦 Vérification des dépendances NPM...');
try {
  const packageJsonPath = path.join(__dirname, 'apps', 'main-app', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['clsx', 'tailwind-merge', '@stripe/react-stripe-js', '@stripe/stripe-js', 'framer-motion', 'lucide-react'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      success.push(`✅ ${dep} installé`);
    } else {
      errors.push(`❌ ${dep} manquant - Exécuter: npm install ${dep}`);
    }
  });
} catch (error) {
  errors.push(`❌ Impossible de lire package.json: ${error.message}`);
}

// 2. Vérifier fichiers composants créés
console.log('\n📁 Vérification des fichiers composants...');
const requiredFiles = [
  'apps/main-app/src/components/checkout/FloatingInput.tsx',
  'apps/main-app/src/components/checkout/ExpressPaymentSection.tsx',
  'apps/main-app/src/components/checkout/ProductSummaryHeader.tsx',
  'apps/main-app/src/components/checkout/UnifiedCheckoutForm.tsx',
  'apps/main-app/src/hooks/useValidationDebounce.ts',
  'apps/main-app/src/lib/utils.ts',
  'apps/main-app/src/pages/CommandeTempleSPA-NEW.tsx',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ ${file}`);
  } else {
    errors.push(`❌ ${file} manquant`);
  }
});

// 3. Vérifier variables d'environnement
console.log('\n🔐 Vérification des variables d\'environnement...');
const envPath = path.join(__dirname, 'apps', 'main-app', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('VITE_STRIPE_PUBLIC_KEY')) {
    success.push('✅ VITE_STRIPE_PUBLIC_KEY configuré');
  } else {
    errors.push('❌ VITE_STRIPE_PUBLIC_KEY manquant dans .env');
  }
  
  if (envContent.includes('VITE_API_BASE_URL')) {
    success.push('✅ VITE_API_BASE_URL configuré');
  } else {
    warnings.push('⚠️ VITE_API_BASE_URL manquant dans .env (optionnel)');
  }
} else {
  errors.push('❌ Fichier .env manquant dans apps/main-app/');
}

// 4. Vérifier services (existence des fichiers)
console.log('\n🔧 Vérification des services...');
const serviceFiles = [
  'apps/main-app/src/services/productOrder.service.ts',
  'apps/main-app/src/services/product.service.ts',
];

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ ${file} existe`);
    
    // Vérification simplifiée du contenu
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file.includes('productOrder.service')) {
      if (content.includes('createOrderWithPaymentIntent')) {
        success.push('  ✅ createOrderWithPaymentIntent trouvé');
      } else {
        errors.push('  ❌ createOrderWithPaymentIntent manquant');
      }
      
      if (content.includes('updateOrderCustomer')) {
        success.push('  ✅ updateOrderCustomer trouvé');
      } else {
        warnings.push('  ⚠️ updateOrderCustomer manquant (à créer)');
      }
      
      if (content.includes('validateEmail')) {
        success.push('  ✅ validateEmail trouvé');
      } else {
        warnings.push('  ⚠️ validateEmail manquant (à créer)');
      }
    }
    
    if (file.includes('product.service')) {
      if (content.includes('getProductById')) {
        success.push('  ✅ getProductById trouvé');
      } else {
        warnings.push('  ⚠️ getProductById manquant (à créer)');
      }
    }
  } else {
    errors.push(`❌ ${file} manquant`);
  }
});

// 5. Rapport final
console.log('\n' + '='.repeat(60));
console.log('📊 RAPPORT DE VÉRIFICATION');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ SUCCÈS (' + success.length + '):');
  success.forEach(s => console.log('  ' + s));
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVERTISSEMENTS (' + warnings.length + '):');
  warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
  console.log('\n❌ ERREURS (' + errors.length + '):');
  errors.forEach(e => console.log('  ' + e));
}

console.log('\n' + '='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n🎉 Configuration parfaite ! Vous êtes prêt à déployer.');
  console.log('\n📚 Prochaines étapes:');
  console.log('  1. cd apps/main-app && npm run dev');
  console.log('  2. Naviguer vers: http://localhost:5173/commande-temple-v2');
  console.log('  3. Tester le nouveau checkout');
  console.log('  4. Consulter INTEGRATION-CHECKOUT-REFONTE-2025.md pour plus de détails');
  process.exit(0);
} else if (errors.length === 0) {
  console.log('\n⚠️  Configuration OK avec avertissements mineurs.');
  console.log('Vous pouvez tester, mais certaines fonctionnalités peuvent être limitées.');
  console.log('\n📚 Consulter ACTIONS-REQUISES-CHECKOUT.md pour résoudre les avertissements.');
  process.exit(0);
} else {
  console.log('\n❌ Configuration incomplète. Corrigez les erreurs avant de continuer.');
  console.log('\n📚 Consulter ACTIONS-REQUISES-CHECKOUT.md pour les étapes manquantes.');
  process.exit(1);
}
