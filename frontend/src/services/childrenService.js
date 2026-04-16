import mockdb from '../data/mockdb.json';

export async function getChildren() {
  // Simule un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockdb.children;
}

export function formatChildName(child) {
  return `${child.firstName} ${child.lastName}`;
}
