import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => setCoords({ lat: latitude, lng: longitude }),
      (err) => setError(err.message)
    );
  }, []);

  return { coords, error };
};

export default useGeolocation;
