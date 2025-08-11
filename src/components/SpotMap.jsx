import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function SpotMap() {
  const mapRef = useRef(null);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    // Init map alleen één keer
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([52.2, 5.3], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    fetch("/data/spots_with_wind_top50.json")
      .then((res) => res.json())
      .then((data) => setSpots(data));
  }, []);

  useEffect(() => {
    if (!mapRef.current || spots.length === 0) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    spots.forEach((spot) => {
      const marker = L.marker([spot.latitude, spot.longitude])
        .addTo(mapRef.current)
        .bindPopup(
          `<b>${spot.name}</b><br/><button id="goto-${spot.spotId}" class="spot-button">Bekijk spot</button>`
        );

      // Use a more reliable approach for handling popup button clicks
      marker.on("popupopen", () => {
        setTimeout(() => {
          const button = document.getElementById(`goto-${spot.spotId}`);
          if (button) {
            button.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Navigating to spot: ${spot.spotId}`);
              window.location.href = `/${spot.spotId}`;
            });
          }
        }, 100);
      });
    });
  }, [spots]);

  return <div id="map" className="h-[500px] w-full rounded-xl shadow" />;
}

