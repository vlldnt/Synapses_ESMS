/**
 * Enrichit un document simplifié avec les infos déduites du creatorId
 * Récupère depuis les APIs: utilisateur → organisation → structureType, companyName
 */
export function getDocumentCreatorId(document) {
  return (
    document?.creatorId ||
    document?.educatorId ||
    document?.userId ||
    document?.educator?.id ||
    null
  );
}

export function enrichDocument(document, users = [], organizations = []) {
  const creatorId = getDocumentCreatorId(document);
  const creator = users.find((u) => u.id === creatorId);
  if (!creator) {
    return {
      ...document,
      educatorName: '—',
      structureType: '—',
      companyName: '—',
    };
  }

  const org = organizations.find((o) => o.id === creator.organizationId);

  return {
    ...document,
    educatorName: `${creator.firstName} ${creator.lastName}`,
    structureType: org?.type || '—',
    companyName: org?.name || '—',
  };
}

/**
 * Batch enrichissement pour une liste de documents
 */
export function enrichDocuments(documents, users = [], organizations = []) {
  return documents.map((doc) => enrichDocument(doc, users, organizations));
}

/**
 * Récupère juste les infos enrichies (sans cloner le document entier)
 */
export function getEnrichedInfo(document, users = [], organizations = []) {
  const creatorId = getDocumentCreatorId(document);
  const creator = users.find((u) => u.id === creatorId);
  const org = organizations.find((o) => o.id === creator?.organizationId);

  return {
    educatorName: creator ? `${creator.firstName} ${creator.lastName}` : '-',
    structureType: org?.type || '-',
    companyName: org?.name || '-',
  };
}
