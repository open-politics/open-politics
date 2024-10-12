import { useState, useEffect } from 'react';

const useEntityImage = (entityName: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityName) return;

    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(entityName)}`);
        const data = await response.json();
        if (data.thumbnail && data.thumbnail.source) {
          setImageUrl(data.thumbnail.source);
        } else {
          setImageUrl(null);
        }
      } catch (err) {
        setError('Failed to fetch image');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [entityName]);

  return { imageUrl, loading, error };
};

export default useEntityImage;