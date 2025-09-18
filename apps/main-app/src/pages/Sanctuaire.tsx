import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import MandalaNav from '../components/mandala/MandalaNav';
import StarField from '../components/micro/StarField';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { labels } from '../lib/sphereLabels';

const ContextualHint: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let hint = '';
  if (path.includes('/path')) hint = labels.emptyPath;
  else if (path.includes('/draws')) hint = labels.emptyDraws;
  else if (path.includes('/synthesis')) hint = 'Explorez vos insights par catégories spirituelles';
  else if (path.includes('/chat')) hint = labels.emptyConv;
  else if (path.includes('/tools')) hint = labels.emptyTools;
  else hint = 'Naviguez dans votre sanctuaire personnel';

  return (
    <GlassCard className="p-4">
      <p className="text-sm text-white/80 italic">{hint}</p>
    </GlassCard>
  );
};

const Sanctuaire: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const progress = Math.round(((user?.level || 1) / 4) * 100);

  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <PageLayout variant="dark">
      <div className="max-w-5xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden">
          <StarField progress={progress} className="absolute inset-0" />
          <div className="relative z-10 p-6">
            <h1 className="text-2xl font-playfair italic text-mystical-gold">Bienvenue, âme lumineuse</h1>
            <p className="text-sm text-white/90 mt-1">{user?.firstName ? `Bonjour ${user.firstName}` : 'Bonjour'}</p>
          </div>
        </div>

        <MandalaNav />

        <ContextualHint />

        <GlassCard>
          <Outlet />
        </GlassCard>
      </div>
    </PageLayout>
  );
};

export default Sanctuaire;
