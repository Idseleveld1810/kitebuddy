import { useState, useEffect } from "react";

export default function SearchBar() {
  const [spots, setSpots] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    fetch("/data/spots_with_wind_top50.json")
      .then((res) => res.json())
      .then((data) => setSpots(data));
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const filtered = spots.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setSelectedIndex(-1);
  }, [query, spots]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      window.location.href = `/${results[selectedIndex].spotId}`;
    }
  };

  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Zoek kitespot..."
        className="w-full p-2 rounded border"
      />
      {results.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {results.map((spot, idx) => (
            <li
              key={spot.spotId}
              onClick={() => (window.location.href = `/${spot.spotId}`)}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                idx === selectedIndex ? "bg-gray-200" : ""
              }`}
            >
              {spot.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
