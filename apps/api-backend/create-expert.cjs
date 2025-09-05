const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Reproduire le schéma Expert exactement comme dans Expert.ts
const expertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before saving (identique à Expert.ts)
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

// Compare password method (identique à Expert.ts)
expertSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes (identiques à Expert.ts)
expertSchema.index({ email: 1 });
expertSchema.index({ isActive: 1 });
expertSchema.index({ createdAt: -1 });

const Expert = mongoose.model('Expert', expertSchema);

async function createExpert() {
  try {
    // Connexion à MongoDB avec l'URI de production
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oraclelumira';
    console.log('🔌 Tentative de connexion à:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'expert existe déjà
    console.log('🔍 Recherche de l\'expert avec email: expert@oraclelumira.com');
    const existingExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    
    if (existingExpert) {
      console.log('👤 Expert existant trouvé:', {
        id: existingExpert._id,
        email: existingExpert.email,
        name: existingExpert.name,
        isActive: existingExpert.isActive,
        createdAt: existingExpert.createdAt
      });

      // Tester le mot de passe actuel
      console.log('🔑 Test du mot de passe "Lumira2025L"...');
      const isValidPassword = await existingExpert.comparePassword('Lumira2025L');
      console.log('🔑 Résultat du test:', isValidPassword ? '✅ VALIDE' : '❌ INVALIDE');
      
      if (!isValidPassword) {
        console.log('🔄 Mise à jour du mot de passe avec "Lumira2025L"...');
        existingExpert.password = 'Lumira2025L';
        await existingExpert.save();
        console.log('✅ Mot de passe mis à jour et sauvegardé');
        
        // Re-récupérer l'expert pour tester
        const updatedExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
        const testAfterUpdate = await updatedExpert.comparePassword('Lumira2025L');
        console.log('🧪 Test après mise à jour:', testAfterUpdate ? '✅ OK' : '❌ ÉCHEC');
      }
    } else {
      // Créer un nouvel expert
      console.log('🆕 Aucun expert trouvé. Création d\'un nouvel expert...');
      const newExpert = new Expert({
        email: 'expert@oraclelumira.com',
        password: 'Lumira2025L',
        name: 'Expert Oracle Lumira',
        isActive: true
      });

      await newExpert.save();
      console.log('✅ Expert créé avec succès:', {
        id: newExpert._id,
        email: newExpert.email,
        name: newExpert.name
      });
    }

    // Test final de connexion complète
    console.log('🧪 Test final de la procédure de login complète...');
    const expert = await Expert.findOne({ email: 'expert@oraclelumira.com', isActive: true });
    if (expert) {
      console.log('👤 Expert trouvé pour login:', {
        id: expert._id,
        email: expert.email,
        isActive: expert.isActive
      });
      
      const finalTest = await expert.comparePassword('Lumira2025L');
      console.log('🧪 Test final de connexion:', finalTest ? '✅ OK - Login devrait marcher' : '❌ ÉCHEC - Problème avec le mot de passe');
      
      if (finalTest) {
        console.log('🎉 SUCCÈS! L\'expert peut maintenant se connecter avec:');
        console.log('   📧 Email: expert@oraclelumira.com');
        console.log('   🔑 Mot de passe: Lumira2025L');
      }
    } else {
      console.log('❌ Aucun expert actif trouvé - problème de création');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

createExpert();
