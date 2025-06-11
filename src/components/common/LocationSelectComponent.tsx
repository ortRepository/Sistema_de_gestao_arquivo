import { useState, useEffect } from "react";
import { Loader2, MapPin, ChevronDown, Crosshair } from "lucide-react";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSelectProps {
  value: string;
  onChange: (value: string, lat: string, lon: string) => void;
}

export default function LocationSelect({
  value,
  onChange,
}: LocationSelectProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      )
        .then((res) => res.json())
        .then((data: LocationSuggestion[]) => {
          setSuggestions(data.slice(0, 5)); // Limita a 5 resultados
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar localização:", error);
          setIsLoading(false);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (suggestion: LocationSuggestion) => {
    setQuery(suggestion.display_name);
    onChange(suggestion.display_name, suggestion.lat, suggestion.lon);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              const location = data.display_name;
              setQuery(location);
              onChange(location, latitude.toString(), longitude.toString());
            });
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value, "", "");
          }}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setTimeout(() => setHasFocus(false), 200)}
          placeholder="Digite seu endereço"
       className="w-full border pl-10 pr-12 border-gray-300 p-3 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF9E01]"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Usar minha localização atual"
          >
            <Crosshair className="w-5 h-5 text-gray-400" />
          </button>
          
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {(hasFocus && suggestions.length > 0) && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 
          rounded-lg shadow-lg overflow-hidden">
          <ul className="py-2 text-sm">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onMouseDown={() => handleSelect(suggestion)}
                className="px-4 py-2 hover:bg-[#FF9E01]/10 cursor-pointer 
                  transition-colors truncate"
                title={suggestion.display_name}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(hasFocus && query.length >= 3 && !isLoading && suggestions.length === 0) && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 
          rounded-lg shadow-lg p-4 text-sm text-gray-500">
          Nenhum resultado encontrado
        </div>
      )}
    </div>
  );
}