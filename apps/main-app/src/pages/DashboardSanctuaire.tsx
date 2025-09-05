import React from 'react';
import { motion } from 'framer-motion';
import { Download, Play, Share, BookOpen, Calendar, User, Crown } from 'lucide-react';

// Mock data - En production, ces données viendraient de MongoDB
const mockUser = {
  firstName: 'Sarah',
  level: 3,
  joinedAt: '2024-12-01'
};

const mockOrders = [
  {
    id: '1',
    level: 2,
    levelName: 'Lecture Intuitive',
    archetype: 'La Guérisseuse',
    color: '#C084FC',
    phrase: 'Tu portes en toi la lumière qui guérit les âmes',
    status: 'done',
    createdAt: '2024-12-15',
    pdfUrl: '/mock-reading.pdf',
    audioUrl: '/mock-audio.mp3',
    mandalaUrl: '/mock-mandala.jpg',
    upsells: {
      mandala: true,
      audio: true
    }
  },
  {
    id: '2', 
    level: 1,
    levelName: 'Lecture Simple',
    archetype: 'L\'Explorateur',
    color: '#FFD700',
    phrase: 'Ton chemin se dessine à chaque pas conscient',
    status: 'done',
    createdAt: '2024-12-01',
    pdfUrl: '/mock-reading-2.pdf'
  }
];

const DashboardSanctuaire: React.FC = () => {
  const progressPercentage = (mockUser.level / 4) * 100;

  return (
    <div className="min-h-screen bg-mystical-dark text-white">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-mystical-gold/10 to-transparent border-b border-mystical-gold/20">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-4">
                Bienvenue dans ton{' '}
                <span className="bg-gradient-to-r from-mystical-gold to-mystical-amber bg-clip-text text-transparent">
                  Sanctuaire
                </span>
              </h1>
              <div className="flex items-center gap-2 text-mystical-gold">
                <User className="w-5 h-5" />
                <span className="font-inter font-medium text-lg">{mockUser.firstName}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400">
                  Membre depuis {new Date(mockUser.joinedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            
            {/* Progress Circle */}
            <div className="relative">
              <div className="w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.2)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={314}
                    initial={{ strokeDashoffset: 314 }}
                    animate={{ strokeDashoffset: 314 - (progressPercentage / 100) * 314 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="progressGradient">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-mystical-gold">{mockUser.level}</span>
                  <span className="text-xs text-gray-400">Niveau</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        
        {/* My Readings Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-playfair italic text-3xl font-medium text-mystical-gold flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Mes Lectures
            </h2>
            <motion.button
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-mystical-gold/20 to-mystical-amber/20 border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Nouvelle lecture
            </motion.button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6 group cursor-pointer hover:border-mystical-gold/60 transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: order.color }}
                    />
                    <span className="text-sm font-medium text-mystical-gold">
                      {order.levelName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <h3 className="font-playfair italic text-xl font-medium text-white mb-2">
                  {order.archetype}
                </h3>
                <p className="text-sm text-gray-300 mb-6 italic">
                  "{order.phrase}"
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.pdfUrl && (
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-mystical-gold/20 text-mystical-gold text-xs hover:bg-mystical-gold/30 transition-colors">
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  )}
                  {order.audioUrl && (
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-mystical-purple/20 text-mystical-purple-light text-xs hover:bg-mystical-purple/30 transition-colors">
                      <Play className="w-3 h-3" />
                      Audio
                    </button>
                  )}
                  {order.mandalaUrl && (
                    <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-mystical-amber/20 text-mystical-amber text-xs hover:bg-mystical-amber/30 transition-colors">
                      <Crown className="w-3 h-3" />
                      Mandala
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'done' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status === 'done' ? 'Terminé' : 'En cours'}
                  </span>
                  
                  <button className="text-mystical-gold hover:text-mystical-gold-light transition-colors">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="font-playfair italic text-3xl font-medium text-mystical-gold mb-8 flex items-center gap-3">
            Timeline vibratoire
          </h2>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-mystical-gold via-mystical-purple to-mystical-amber"></div>
            
            {[
              { level: 1, name: 'Éveil', status: 'completed', date: '01/12/2024' },
              { level: 2, name: 'Intuition', status: 'completed', date: '15/12/2024' },
              { level: 3, name: 'Alchimie', status: 'current', date: 'Aujourd\'hui' },
              { level: 4, name: 'Intégration', status: 'locked', date: 'À venir' }
            ].map((milestone, index) => (
              <div key={index} className="relative flex items-center gap-6 mb-8">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                  milestone.status === 'completed' ? 'bg-mystical-gold border-mystical-gold text-mystical-dark' :
                  milestone.status === 'current' ? 'bg-mystical-purple border-mystical-purple text-white' :
                  'bg-transparent border-gray-600 text-gray-600'
                }`}>
                  {milestone.level}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      milestone.status === 'locked' ? 'text-gray-600' : 'text-white'
                    }`}>
                      Niveau {milestone.level} - {milestone.name}
                    </h4>
                    <span className="text-sm text-gray-400">{milestone.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-12"
        >
          <p className="font-playfair italic text-2xl md:text-3xl font-medium text-mystical-gold mb-4">
            "Le voyage vers la connaissance de soi n'a pas de fin, seulement des paliers de lumière."
          </p>
          <p className="text-gray-400">— Oracle Lumira</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSanctuaire;
