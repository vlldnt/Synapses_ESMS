import { useState, useEffect } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

interface UseModelsResult {
  models: OpenRouterModel[];
  isLoading: boolean;
  error: string | null;
  /** Retourne le nom court d'un modèle (sans préfixe "Provider: ") */
  getModelName: (id: string) => string;
}

// ─── Cache module-level (évite de refetcher à chaque render) ───────────────

let _cache: OpenRouterModel[] | null = null;
let _promise: Promise<OpenRouterModel[]> | null = null;

async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
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
      _cache = (data.data as OpenRouterModel[]) ?? [];
      return _cache;
    })
    .finally(() => {
      _promise = null;
    });

  return _promise;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Récupère la liste des modèles OpenRouter disponibles.
 *
 * Disponible en DEV et en production si la clé API est présente.
 * Utilise un cache module-level pour ne faire qu'un seul appel réseau.
 */
export function useModels(): UseModelsResult {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
  const canFetch = Boolean(apiKey);

  const [models, setModels] = useState<OpenRouterModel[]>(_cache ?? []);
  const [isLoading, setIsLoading] = useState(canFetch && !_cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey || _cache !== null) {
      setIsLoading(false);
      return;
    }

    fetchModels(apiKey)
      .then((list) => setModels(list))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [apiKey]);

  /** Retire le préfixe "Provider: " souvent présent dans les noms OpenRouter */
  const getModelName = (id: string): string => {
    const m = models.find((m) => m.id === id);
    if (!m) return id.split('/').pop() ?? id;
    return m.name.replace(/^[^:]+:\s*/, '').trim();
  };

  return { models, isLoading, error, getModelName };
}
