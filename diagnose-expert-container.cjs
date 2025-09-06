#!/usr/bin/env node

/**
 * Script de diagnostic expert - Pour conteneur de production
 * Utilise les mêmes modules que l'API backend
 */

// Import des modules depuis le répertoire backend
const mongoose = require('/app/apps/api-backend/node_modules/mongoose');
const bcrypt = require('/app/apps/api-backend/node_modules/bcrypt');

// Configuration exactement identique au modèle backend
const expertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['expert', 'admin'],
    default: 'expert'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'experts'
});

expertSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

expertSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

async function diagnoseExpert() {
  console.log('🔍 DIAGNOSTIC EXPERT - CONTENEUR PRODUCTION');
  console.log('='.repeat(60));
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.log('❌ MONGODB_URI non trouvé dans l\'environnement');
      console.log('Variables d\'environnement disponibles:');
      Object.keys(process.env).sort().forEach(key => {
        if (key.includes('MONGO') || key.includes('DB')) {
          console.log(`   ${key}=${process.env[key]}`);
        }
      });
      return;
    }
    
    console.log('🔌 Connexion MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    const Expert = mongoose.model('Expert', expertSchema);
    
    // Recherche de l'expert
    console.log('');
    console.log('👤 Recherche expert@oraclelumira.com...');
    const expert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    
    if (!expert) {
      console.log('❌ Expert non trouvé!');
      console.log('');
      console.log('🔧 Création de l\'expert...');
      
      const newExpert = new Expert({
        email: 'expert@oraclelumira.com',
        password: 'Lumira2025L',
        name: 'Oracle Expert',
        role: 'expert',
        isActive: true
      });
      
      await newExpert.save();
      console.log('✅ Expert créé avec succès!');
      
      // Test du mot de passe créé
      const testExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
      const passwordWorks = await testExpert.comparePassword('Lumira2025L');
      console.log('🔐 Test mot de passe:', passwordWorks ? '✅ OK' : '❌ ERREUR');
      
    } else {
      console.log('✅ Expert trouvé');
      console.log('   Nom:', expert.name);
      console.log('   Email:', expert.email);
      console.log('   Rôle:', expert.role);
      console.log('   Actif:', expert.isActive);
      console.log('   Créé:', expert.createdAt);
      
      // Test du mot de passe
      console.log('');
      console.log('🔐 Test du mot de passe "Lumira2025L"...');
      const isValid = await expert.comparePassword('Lumira2025L');
      
      if (isValid) {
        console.log('✅ Mot de passe correct!');
        console.log('');
        console.log('🎯 DIAGNOSTIC: Authentification DB OK');
        console.log('   Si le login échoue encore, vérifiez:');
        console.log('   - Route /api/expert/login');
        console.log('   - Logs PM2: pm2 logs');
        console.log('   - Logs nginx: /var/log/nginx/');
      } else {
        console.log('❌ Mot de passe incorrect!');
        console.log('');
        console.log('🔧 Correction du mot de passe...');
        
        // Mise à jour directe avec bcrypt
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash('Lumira2025L', salt);
        
        await Expert.updateOne(
          { _id: expert._id },
          { password: newHash }
        );
        
        console.log('✅ Mot de passe mis à jour!');
        
        // Vérification
        const updatedExpert = await Expert.findById(expert._id);
        const works = await updatedExpert.comparePassword('Lumira2025L');
        console.log('🔐 Vérification:', works ? '✅ OK' : '❌ ERREUR');
      }
    }
    
    // Statistiques finales
    console.log('');
    console.log('📊 RÉSUMÉ DIAGNOSTIC');
    console.log('-'.repeat(30));
    const finalExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    const finalCheck = await finalExpert.comparePassword('Lumira2025L');
    
    console.log('Base de données:', '✅ Connexion OK');
    console.log('Expert existe:', finalExpert ? '✅ Oui' : '❌ Non');
    console.log('Email correct:', finalExpert?.email === 'expert@oraclelumira.com' ? '✅ Oui' : '❌ Non');
    console.log('Mot de passe:', finalCheck ? '✅ OK' : '❌ KO');
    console.log('Compte actif:', finalExpert?.isActive ? '✅ Oui' : '❌ Non');
    
    console.log('');
    if (finalExpert && finalCheck && finalExpert.isActive) {
      console.log('🎉 SUCCÈS! Expert prêt pour connexion');
      console.log('');
      console.log('🔍 Si problème persiste, commandes de debug:');
      console.log('   pm2 logs           # Logs API backend');
      console.log('   curl localhost:3001/api/health  # Test API');
      console.log('   nginx -t           # Test config nginx');
    } else {
      console.log('❌ PROBLÈME DÉTECTÉ - Réexécuter le script');
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('👋 Diagnostic terminé');
  }
}

diagnoseExpert();
