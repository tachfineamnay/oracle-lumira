import React from 'react';
import { motion } from 'framer-motion';
import { Download, Play, Calendar, Star } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const mockHistory = [
  {
    id: '1',
    title: 'Lecture Niveau 2',
    date: '2024-03-15',
    status: 'completed',
    level: 2
  },
  {
    id: '2', 
    title: 'Consultation',
    date: '2024-03-10',
    status: 'completed',
    level: 1
  }
];

const History: React.FC = () => {
  return (
    <div className=\"p-8 space-y-8\">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className=\"text-center\"
      >
        <h1 className=\"text-3xl font-playfair italic text-mystical-gold mb-4\">
          Historique Spirituel
        </h1>
        <p className=\"text-white/70\">
          Votre parcours et contenus spirituels
        </p>
      </motion.div>

      <div className=\"space-y-4\">
        {mockHistory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className=\"p-6 bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 border-mystical-gold/30\">
              <div className=\"flex items-center gap-3 mb-3\">
                <Star className=\"w-5 h-5 text-mystical-gold\" />
                <h3 className=\"text-xl text-white\">{item.title}</h3>
              </div>
              
              <div className=\"flex items-center gap-3 text-sm text-white/70 mb-4\">
                <Calendar className=\"w-4 h-4\" />
                <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                <span className=\"bg-mystical-gold/20 text-mystical-gold px-2 py-1 rounded-full\">
                  Niveau {item.level}
                </span>
              </div>
              
              <div className=\"flex gap-3\">
                <button className=\"flex items-center gap-2 px-4 py-2 rounded-lg bg-mystical-gold/20 hover:bg-mystical-gold/30 text-mystical-gold transition-colors\">
                  <Download className=\"w-4 h-4\" />
                  PDF
                </button>
                <button className=\"flex items-center gap-2 px-4 py-2 rounded-lg bg-mystical-purple/20 hover:bg-mystical-purple/30 text-mystical-purple transition-colors\">
                  <Play className=\"w-4 h-4\" />
                  Audio
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default History;