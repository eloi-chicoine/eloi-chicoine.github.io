// Infos qui ne changent pas selon la langue.
export const profil = {
  nom: 'Eloi Chicoine',
  email: 'eloichicoine1@gmail.com',
  telephone: '06 88 40 05 56',
  telephoneLien: '+33688400556',
  linkedin: 'https://www.linkedin.com/in/eloi-chicoine-199198389/',
  cv: 'cv/eloi-chicoine-cv.pdf', // dans public/
};

// Les clés (design, video…) renvoient aux titres dans panels.tools des fichiers de traduction.
export const outils = {
  design: ['Photoshop', 'Illustrator', 'Affinity', 'Figma'],
  video: ['DaVinci Resolve', 'FL Studio', 'Stop Motion Studio'],
  web: ['HTML / CSS', 'JavaScript', 'VS Code'],
  orga: ['Trello', 'Google Workspace'],
} as const;
