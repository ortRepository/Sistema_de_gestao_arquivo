import React, { createContext, useContext, useState, ReactNode } from "react";

// Interface para dados completos de localização
interface LocationData {
  displayName: string;
  latitude: number;
  longitude: number;
  address?: {
    city?: string;
    country?: string;
    state?: string;
  };
}

interface LocationContextData {
  location: LocationData | null;
  error: string | null;
  isLoading: boolean;
  updateLocation: (coords?: {
    latitude: number;
    longitude: number;
  }) => Promise<LocationData>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextData | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );

      if (!response.ok) throw new Error("Erro na resposta da API");

      const data = await response.json();
      return {
        displayName: data.display_name,
        address: {
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
        },
      };
    } catch (err) {
      console.error("Erro no geocoding:", err);
      return { displayName: "Localização desconhecida" };
    }
  };
  // No LocationContext, adapte updateLocation:
  const updateLocation = async (coords?: {
    latitude: number;
    longitude: number;
  }): Promise<LocationData> => {
    setIsLoading(true);
    setError(null);

    const { latitude, longitude } =
      coords ??
      (
        await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 1000 * 60 * 5,
          })
        )
      ).coords;

    try {
      const locationDetails = await fetchLocationName(latitude, longitude);
      const newLocation: LocationData = {
        displayName: locationDetails.displayName,
        latitude,
        longitude,
        address: locationDetails.address,
      };
      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      setError("Erro ao obter detalhes da localização");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        error,
        isLoading,
        updateLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Hook customizado com verificação de contexto
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation deve ser usado dentro de um LocationProvider");
  }
  return context;
};
