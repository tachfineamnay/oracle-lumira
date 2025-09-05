import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingTemple from './pages/LandingTemple';
import CommandeTemple from './pages/CommandeTemple';
import ConfirmationTemple from './pages/ConfirmationTemple';
import DashboardSanctuaire from './pages/DashboardSanctuaire';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDesk from './expert/ExpertDesk';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingTemple />} />
        <Route path="/commande" element={<CommandeTemple />} />
        <Route path="/confirmation" element={<ConfirmationTemple />} />
        <Route path="/sanctuaire" element={<DashboardSanctuaire />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/expert" element={<ExpertDesk />} />
      </Routes>
    </Router>
  );
}

export default App;