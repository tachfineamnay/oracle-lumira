const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schéma Expert
const expertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
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

// Compare password method
expertSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Expert = mongoose.model('Expert', expertSchema);

async function createExpert() {
  try {
    // Connexion à MongoDB - ajustez l'URL selon votre configuration
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oraclelumira';
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'expert existe déjà
    const existingExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    
    if (existingExpert) {
      console.log('👤 Expert existant trouvé:', {
        id: existingExpert._id,
        email: existingExpert.email,
        name: existingExpert.name,
        isActive: existingExpert.isActive,
        createdAt: existingExpert.createdAt
      });

      // Tester le mot de passe
      const isValidPassword = await existingExpert.comparePassword('Lumira2025L');
      console.log('🔑 Test du mot de passe "Lumira2025L":', isValidPassword ? '✅ VALIDE' : '❌ INVALIDE');
      
      if (!isValidPassword) {
        console.log('🔄 Mise à jour du mot de passe...');
        existingExpert.password = 'Lumira2025L';
        await existingExpert.save();
        console.log('✅ Mot de passe mis à jour');
      }
    } else {
      // Créer un nouvel expert
      console.log('🆕 Création d\'un nouvel expert...');
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

    // Test final de connexion
    const expert = await Expert.findOne({ email: 'expert@oraclelumira.com', isActive: true });
    if (expert) {
      const finalTest = await expert.comparePassword('Lumira2025L');
      console.log('🧪 Test final de connexion:', finalTest ? '✅ OK' : '❌ ÉCHEC');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

createExpert();
