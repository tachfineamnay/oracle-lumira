export type SphereKey = 'spiritualPath' | 'rawDraws' | 'synthesis' | 'conversations' | 'tools' | 'profile' | 'extras';

export const sphereLabels: Record<SphereKey, string> = {
  spiritualPath: 'Chemin spirituel',
  rawDraws: 'Tirages bruts',
  synthesis: 'Synthèse',
  conversations: 'Conversations',
  tools: 'Outils',
  profile: 'Profil',
  extras: 'Extras',
};

export const labels = {
  spiritualPath: 'Cheminement Spirituel',
  rawDraws: 'Tirages Bruts',
  synthesis: 'Synthèse par Catégories',
  conversations: "Conversations avec l'Oracle",
  tools: 'Outils Thérapeutiques',
  profile: 'Profil Spirituel',
  path: 'Cheminement Spirituel',
  draws: 'Tirages Bruts',
  synthesis: 'Synthèse par Catégories',
  chat: "Conversations avec l'Oracle",
  tools: 'Outils Thérapeutiques',
  profile: 'Profil Spirituel',
  ctaNext: 'Explorer le prochain portail',
  emptyPath: 'Aucun enseignement pour l’instant',
  emptyDraws: 'Aucun tirage reçu',
  emptyConv: 'Aucune conversation',
  emptyTools: 'Aucun outil',
};

export default sphereLabels;
