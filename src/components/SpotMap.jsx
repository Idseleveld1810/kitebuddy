import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import spots from '../data/spots_with_wind_top50.json';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SpotMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([52.3676, 4.9041], 8);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each spot
    spots.forEach((spot) => {
      const marker = L.marker([spot.latitude, spot.longitude])
        .addTo(map)
        .bindPopup(`
          <div class="text-center p-2">
            <h3 class="font-semibold text-lg mb-2">${spot.name}</h3>
            <button 
              class="spot-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 min-h-[44px] min-w-[44px]"
              onclick="window.location.href='/${spot.spotId}'"
            >
              Bekijk voorspelling
            </button>
          </div>
        `, {
          closeButton: true,
          closeOnClick: false,
          className: 'custom-popup'
        });

      // Ensure proper touch handling
      marker.on('click', (e) => {
        e.originalEvent.stopPropagation();
      });

      // Handle popup open to ensure button is clickable
      marker.on('popupopen', () => {
        setTimeout(() => {
          const button = document.querySelector('.spot-button');
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/${spot.spotId}`;
            });
          }
        }, 100);
      });
    });

    // Mobile-specific optimizations
    if ('ontouchstart' in window) {
      // Disable double-tap zoom on mobile
      map.doubleClickZoom.disable();
      
      // Increase tap tolerance for better mobile interaction
      map.options.tap = true;
      map.options.tapTolerance = 15;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 sm:h-80 md:h-96 rounded-lg sm:rounded-xl shadow-sm border border-cyan-100"
      style={{ zIndex: 1 }}
    />
  );
};

export default SpotMap;

