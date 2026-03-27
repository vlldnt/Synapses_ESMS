export async function loadArticles() {
  // Try backend endpoint first, then fall back to local dev data.
  const sources = [
    '/api/dashboard/articles',
    new URL('../../devData/dashboardArticles.json', import.meta.url),
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    } catch {
      // Try next source.
    }
  }

  return [];
}
