const dataUrl = new URL('../data/dashboardCards.json', import.meta.url);

// Loads dashboard cards data
export async function loadCards() {
  try {
    const response = await fetch(dataUrl);

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Impossible de charger les articles:', error);
    return [];
  }
}
