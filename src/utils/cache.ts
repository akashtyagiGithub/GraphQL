import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache items for 1 hour (3600 seconds)

export const getCachedData = (key: string) => {
  return cache.get(key);
};

export const setCachedData = (key: string, value: any) => {
  cache.set(key, value);
};

export const clearCachedData = (key: string) => {
  cache.del(key);
};
