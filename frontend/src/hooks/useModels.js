import { useState, useEffect } from 'react';

let _cache = null;
let _promise = null;

async function fetchModels(apiKey) {
  if (_cache !== null) return _cache;
  if (_promise) return _promise;

  _promise = fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      _cache = data.data ?? [];
      return _cache;
    })
    .finally(() => {
      _promise = null;
    });

  return _promise;
}

export function useModels() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const canFetch = Boolean(apiKey);

  const [models, setModels] = useState(_cache ?? []);
  const [isLoading, setIsLoading] = useState(canFetch && !_cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiKey || _cache !== null) {
      setIsLoading(false);
      return;
    }

    fetchModels(apiKey)
      .then((list) => setModels(list))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [apiKey]);

  const getModelName = (id) => {
    const m = models.find((m) => m.id === id);
    if (!m) return id.split('/').pop() ?? id;
    return m.name.replace(/^[^:]+:\s*/, '').trim();
  };

  return { models, isLoading, error, getModelName };
}
