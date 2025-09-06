#!/usr/bin/env node

/**
 * Script de vérification/création d'expert pour production
 * À exécuter sur le serveur ou via SSH
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Modèle Expert (reproduction exacte du modèle backend)
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

// Hash du mot de passe avant sauvegarde
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

// Méthode de comparaison des mots de passe
expertSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

async function main() {
  try {
    console.log('🚀 Vérification Expert - Mode Production');
    console.log('='.repeat(50));
    
    // Connexion à MongoDB (utilise MONGODB_URI de l'environnement)
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI non défini dans les variables d\'environnement');
      console.log('');
      console.log('💡 Solutions possibles:');
      console.log('1. Définir MONGODB_URI avant d\'exécuter:');
      console.log('   export MONGODB_URI="mongodb://votre-uri"');
      console.log('   node verify-expert-remote.cjs');
      console.log('');
      console.log('2. Ou passer l\'URI directement:');
      console.log('   MONGODB_URI="mongodb://votre-uri" node verify-expert-remote.cjs');
      process.exit(1);
    }
    
    console.log('🔌 Connexion à MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Masque les credentials
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB établie');
    
    const Expert = mongoose.model('Expert', expertSchema);
    
    // Vérification de l'expert existant
    const existingExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    
    if (existingExpert) {
      console.log('');
      console.log('👤 Expert trouvé:');
      console.log('- Email:', existingExpert.email);
      console.log('- Nom:', existingExpert.name);
      console.log('- Rôle:', existingExpert.role);
      console.log('- Actif:', existingExpert.isActive);
      console.log('- Créé le:', existingExpert.createdAt);
      
      // Test du mot de passe
      console.log('');
      console.log('🔐 Test du mot de passe "Lumira2025L"...');
      const isPasswordValid = await existingExpert.comparePassword('Lumira2025L');
      
      if (isPasswordValid) {
        console.log('✅ Mot de passe correct!');
        console.log('');
        console.log('🎯 Diagnostic: L\'expert et le mot de passe sont corrects.');
        console.log('   Le problème d\'authentification doit venir d\'ailleurs:');
        console.log('   - Vérifiez l\'API backend');
        console.log('   - Vérifiez les routes d\'authentification');
        console.log('   - Vérifiez les logs du serveur');
      } else {
        console.log('❌ Mot de passe incorrect!');
        console.log('');
        console.log('🔧 Correction en cours...');
        
        // Hash du nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Lumira2025L', salt);
        
        // Mise à jour directe
        await Expert.updateOne(
          { _id: existingExpert._id },
          { password: hashedPassword }
        );
        
        console.log('✅ Mot de passe mis à jour!');
        
        // Vérification de la mise à jour
        const updatedExpert = await Expert.findById(existingExpert._id);
        const isNewPasswordValid = await updatedExpert.comparePassword('Lumira2025L');
        
        if (isNewPasswordValid) {
          console.log('✅ Vérification: nouveau mot de passe correct!');
        } else {
          console.log('❌ Erreur: le nouveau mot de passe ne fonctionne pas!');
        }
      }
    } else {
      console.log('');
      console.log('❌ Aucun expert trouvé avec l\'email expert@oraclelumira.com');
      console.log('');
      console.log('🔧 Création de l\'expert...');
      
      const newExpert = new Expert({
        email: 'expert@oraclelumira.com',
        password: 'Lumira2025L', // Sera hashé automatiquement par le pre-save hook
        name: 'Oracle Expert',
        role: 'expert',
        isActive: true
      });
      
      await newExpert.save();
      console.log('✅ Expert créé avec succès!');
      
      // Vérification de la création
      const createdExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
      const isPasswordValid = await createdExpert.comparePassword('Lumira2025L');
      
      if (isPasswordValid) {
        console.log('✅ Vérification: mot de passe correct!');
      } else {
        console.log('❌ Erreur: le mot de passe créé ne fonctionne pas!');
      }
    }
    
    console.log('');
    console.log('📊 Résumé final:');
    const finalExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    const finalPasswordCheck = await finalExpert.comparePassword('Lumira2025L');
    
    console.log('- Expert existe:', finalExpert ? '✅' : '❌');
    console.log('- Email correct:', finalExpert?.email === 'expert@oraclelumira.com' ? '✅' : '❌');
    console.log('- Mot de passe valide:', finalPasswordCheck ? '✅' : '❌');
    console.log('- Expert actif:', finalExpert?.isActive ? '✅' : '❌');
    
    if (finalExpert && finalPasswordCheck && finalExpert.isActive) {
      console.log('');
      console.log('🎉 Succès! L\'expert devrait pouvoir se connecter maintenant.');
      console.log('');
      console.log('Si le problème persiste, vérifiez:');
      console.log('1. Les logs du serveur API backend');
      console.log('2. La route POST /api/expert/login');
      console.log('3. La configuration CORS');
      console.log('4. La connexion réseau entre frontend et backend');
    } else {
      console.log('');
      console.log('❌ Problème détecté. Réexécutez le script ou vérifiez manuellement.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Conseils pour résoudre ECONNREFUSED:');
      console.log('1. Vérifiez que MongoDB est démarré');
      console.log('2. Vérifiez l\'URI de connexion');
      console.log('3. Vérifiez les règles de firewall/sécurité');
      console.log('4. Pour un déploiement Coolify, utilisez l\'URI interne du container');
    }
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('👋 Connexion fermée. Script terminé.');
  }
}

main();
