export type SphereKey = 'spiritualPath' | 'rawDraws' | 'synthesis' | 'conversations' | 'tools' | 'extras';

export const sphereLabels: Record<SphereKey, string> = {
  spiritualPath: 'Chemin spirituel',
  rawDraws: 'Tirages bruts',
  synthesis: 'Synthèse',
  conversations: 'Conversations',
  tools: 'Outils',
  extras: 'Extras',
};

export const labels = {
  path: 'Cheminement Spirituel',
  draws: 'Tirages Bruts',
  synthesis: 'Synthèse par Catégories',
  chat: "Conversations avec l'Oracle",
  tools: 'Outils Thérapeutiques',
  ctaNext: 'Explorer le prochain portail',
  emptyPath: 'Aucun enseignement pour l’instant',
  emptyDraws: 'Aucun tirage reçu',
  emptyConv: 'Aucune conversation',
  emptyTools: 'Aucun outil',
};

export default sphereLabels;
