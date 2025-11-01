export type SphereKey = 'spiritualPath' | 'rawDraws' | 'synthesis' | 'conversations' | 'profile' | 'extras';

export const sphereLabels: Record<SphereKey, string> = {
  spiritualPath: 'Chemin spirituel',
  rawDraws: 'Mes lectures',
  synthesis: 'Synthèse',
  conversations: 'Conversations',
  profile: 'Profil',
  extras: 'Extras',
};

export const labels = {
  spiritualPath: 'Cheminement Spirituel',
  rawDraws: 'Mes lectures',
  synthesis: 'Synthèse par Catégories',
  conversations: "Conversations avec l'Oracle",
  profile: 'Profil Spirituel',
  path: 'Cheminement Spirituel',
  draws: 'Mes lectures',
  chat: "Conversations avec l'Oracle",
  ctaNext: 'Explorer le prochain portail',
  emptyPath: 'Aucun enseignement pour l\'instant',
  emptyDraws: 'Aucun tirage reçu',
  emptyConv: 'Aucune conversation'
};

export default sphereLabels;
