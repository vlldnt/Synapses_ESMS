import { useState, useEffect } from 'react';
import { authFetch } from '../services/authServices';

const basename = import.meta.env.VITE_BASENAME || '/synapses';
const API_URL = `${basename}/api`;

let _cache = null;
let _promise = null;

async function fetchModels() {
  if (_cache !== null) return _cache;
  if (_promise) return _promise;

  _promise = authFetch(`${API_URL}/ai/models`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      _cache = data.data ?? [];
      return _cache;
    })
    .catch(() => [])
    .finally(() => { _promise = null; });

  return _promise;
}

export function useModels() {
  const [models, setModels] = useState(_cache ?? []);
  const [isLoading, setIsLoading] = useState(!_cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (_cache !== null) {
      setIsLoading(false);
      return;
    }

    fetchModels()
      .then((list) => setModels(list))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const getModelName = (id) => {
    const m = models.find((m) => m.id === id);
    if (!m) return id.split('/').pop() ?? id;
    return m.name.replace(/^[^:]+:\s*/, '').trim();
  };

  return { models, isLoading, error, getModelName };
}
