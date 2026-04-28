export const STRUCTURE_TYPES = {
  categories: [
    {
      label: "Protection de l'enfance",
      options: [
        'MECS', 'Foyer de l\'enfance', 'Pouponnière', 'Service AEMO', 'Service AED',
        'Placement à domicile', 'Village d\'enfants', 'Lieu de vie et d\'accueil',
        'Service de suite', 'Service jeunes majeurs',
      ],
    },
    {
      label: 'Handicap enfant / adulte',
      options: [
        'IME', 'IEM', 'ITEP', 'SESSAD', 'EEAP', 'MAS', 'FAM',
        'Foyer d\'hébergement', 'Foyer de vie', 'ESAT', 'SAVS', 'SAMSAH',
        'Habitat inclusif', 'Dispositif emploi accompagné',
      ],
    },
    {
      label: 'Personnes âgées',
      options: ['EHPAD', 'Résidence autonomie', 'Accueil de jour', 'Plateforme de répit', 'SSIAD', 'SPASAD', 'SAAD'],
    },
    {
      label: 'Inclusion sociale / insertion / précarité',
      options: [
        'CHRS', 'CADA', 'HUDA', 'Pension de famille', 'Résidence sociale',
        'Mission locale', 'Service d\'insertion', 'Accueil de jour', 'Maraude', 'Chantier d\'insertion',
      ],
    },
    {
      label: 'Addictologie / santé mentale',
      options: ['CSAPA', 'CAARUD', 'CMP', 'Hôpital de jour', 'GEM', 'Service de réhabilitation psychosociale'],
    },
    {
      label: 'Fonctions support / structures transversales',
      options: [
        'Association gestionnaire', 'Siège social', 'Pôle ressource',
        'Organisme de formation', 'Service qualité', 'Service RH', 'Dispositif transversal',
      ],
    },
  ],
};

export function getStructureTypeCategories() {
  return STRUCTURE_TYPES.categories;
}
