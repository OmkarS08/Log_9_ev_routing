import React, { useEffect, useRef } from 'react';
import { createMap } from '@tomtom-international/web-sdk-maps';

function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = createMap({
      key: 'JHhb49jDg7S4twUUdeWsjUZcsinUW0Mc',
      container: mapRef.current,
      center: [0, 0],
      zoom: 10
    });
  }, []);

  return (
    <div ref={mapRef} id="map"></div>
  );
}

export default Map;
