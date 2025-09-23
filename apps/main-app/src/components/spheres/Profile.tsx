import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, Edit3, Save, X, Camera } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useAuth } from '../../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // TODO: Implement API call to update user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      location: user?.location || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl font-playfair italic text-mystical-gold mb-4">
          Votre Profil Spirituel
        </h1>
        <p className="text-white/70 font-inter">
          Personnalisez votre espace sacré et vos informations personnelles
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo de profil */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard className="p-6 text-center bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 border-mystical-gold/30">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-mystical-gold/30 to-mystical-purple/30 flex items-center justify-center border-2 border-mystical-gold/40">
                <User className="w-16 h-16 text-mystical-gold" />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-mystical-gold/80 hover:bg-mystical-gold text-mystical-abyss flex items-center justify-center transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-mystical-gold font-inter text-sm">
              Initié Spirituel
            </p>
          </GlassCard>
        </motion.div>

        {/* Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6 bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 border-mystical-gold/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-playfair italic text-mystical-gold">
                Informations Personnelles
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mystical-gold/20 hover:bg-mystical-gold/30 text-mystical-gold transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mystical-gold/80 hover:bg-mystical-gold text-mystical-abyss transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label className="block text-sm text-mystical-gold mb-2 font-inter">
                  <User className="w-4 h-4 inline mr-2" />
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50"
                  />
                ) : (
                  <p className="text-white font-inter">{formData.firstName || 'Non renseigné'}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm text-mystical-gold mb-2 font-inter">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50"
                  />
                ) : (
                  <p className="text-white font-inter">{formData.lastName || 'Non renseigné'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-mystical-gold mb-2 font-inter">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50"
                  />
                ) : (
                  <p className="text-white font-inter">{formData.email || 'Non renseigné'}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm text-mystical-gold mb-2 font-inter">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50"
                  />
                ) : (
                  <p className="text-white font-inter">{formData.phone || 'Non renseigné'}</p>
                )}
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-sm text-mystical-gold mb-2 font-inter">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de naissance
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50"
                  />
                ) : (
                  <p className="text-white font-inter">
                    {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseigné'}
                  </p>
                )}
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm text-mystical-gold mb-2 font-inter">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Localisation
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ville, Pays"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50"
                  />
                ) : (
                  <p className="text-white font-inter">{formData.location || 'Non renseigné'}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm text-mystical-gold mb-2 font-inter">
                À propos de votre parcours spirituel
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Partagez votre intention spirituelle, vos aspirations..."
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-mystical-gold/50 resize-none"
                />
              ) : (
                <p className="text-white font-inter leading-relaxed">
                  {formData.bio || 'Partagez votre intention spirituelle et vos aspirations...'}
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Statistiques spirituelles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <GlassCard className="p-6 bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 border-mystical-gold/30">
          <h2 className="text-xl font-playfair italic text-mystical-gold mb-6">
            Votre Progression Spirituelle
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mystical-gold/30 to-mystical-gold/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-mystical-gold">2</span>
              </div>
              <p className="text-white font-inter text-sm">Niveaux Complétés</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mystical-purple/30 to-mystical-purple/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-mystical-purple">5</span>
              </div>
              <p className="text-white font-inter text-sm">Lectures Reçues</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-400/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-amber-400">89</span>
              </div>
              <p className="text-white font-inter text-sm">Jours Actifs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-400/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-emerald-400">12</span>
              </div>
              <p className="text-white font-inter text-sm">Insights Débloqués</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Profile;