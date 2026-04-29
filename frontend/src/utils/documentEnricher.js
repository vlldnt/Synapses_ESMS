export function getDocumentCreatorId(document) {
  return document?.creator_id || document?.educator?.id || null;
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

  const org = organizations.find((o) => o.id === creator.organization_id);

  return {
    ...document,
    educatorName: `${creator.first_name} ${creator.last_name}`,
    structureType: org?.structure_type || '—',
    companyName: org?.name || '—',
  };
}

export function enrichDocuments(documents, users = [], organizations = []) {
  return documents.map((doc) => enrichDocument(doc, users, organizations));
}

export function getEnrichedInfo(document, users = [], organizations = []) {
  const creatorId = getDocumentCreatorId(document);
  const creator = users.find((u) => u.id === creatorId);
  const org = organizations.find((o) => o.id === creator?.organization_id);

  return {
    educatorName: creator ? `${creator.first_name} ${creator.last_name}` : '-',
    structureType: org?.structure_type || '-',
    companyName: org?.name || '-',
  };
}
