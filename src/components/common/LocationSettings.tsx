import { useState } from "react";
import { useGetUser, useUpdateUser } from "@/hooks/DynamicApiHooks";
import * as LucideIcons from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

const LocationSettings = () => {
  const { data: userData, refetch } = useGetUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { location, error, updateLocation, clearLocation } = useLocation();

  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    try {
      if (location) {
        // Deactivation branch
        setIsLoading(true);
        if (userData) {
          await updateUser({
            idUser: String(userData.idUser),
            name: userData.name,
            language: userData.language || "Não disponível",
            theme: userData.theme || 0,
            location: "Localização desativada",
            subscriber: true,
          });

          clearLocation();
          setStatusMessage("Localização desativada com sucesso!");
        }
      } else {
        // Activation branch: obtain current geolocation
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 1000,
                maximumAge: 0,
              })
          );

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Update location with the obtained coordinates
          const newLocation = await updateLocation({
            latitude: lat,
            longitude: lng,
          });
          if (userData) {
            await updateUser({
              idUser: String(userData.idUser),
              name: userData.name,
              language: userData.language || "Não disponível",
              theme: userData.theme || 0,
              location: newLocation.displayName,
              subscriber: true,
            });

            setStatusMessage("Localização ativada com sucesso!");
          }
        } else {
          throw new Error("Geolocation API não disponível.");
        }
      }
      await refetch();
    } catch (error: any) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error instanceof Error) {
      switch (error.message) {
        case "Geolocation não suportada":
          return "Seu navegador não suporta geolocalização.";
        case "Permissão de localização negada":
          return "Permissão necessária. Ative nas configurações do navegador.";
        case "Tempo de resposta excedido":
          return "Tempo esgotado. Tente em área aberta.";
        default:
          return error.message || "Erro na operação de localização.";
      }
    }
    return "Erro desconhecido na operação de localização.";
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LucideIcons.MapPin className="w-7 h-7 text-[#E1B927]" />
        <h2 className="text-2xl font-medium my-4">
          Configurações de Localização
        </h2>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium flex items-center gap-2">
                <LucideIcons.Map className="w-5 h-5" />
                Status Atual
              </p>
              <p
                className={`text-sm ${
                  location ? "text-green-500" : "text-red-500"
                }`}
              >
                {location ? "Ativada" : "Desativada"}
              </p>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!location}
                onChange={handleToggle}
                disabled={isLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#E1B927]"></div>
            </label>
          </div>

          {location && (
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <LucideIcons.Navigation className="w-4 h-4" />
                <span className="font-medium">Coordenadas:</span>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
              <p className="flex items-center gap-2 truncate">
                <LucideIcons.Landmark className="w-4 h-4" />
                {location.displayName}
              </p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {(error || statusMessage) && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              statusMessage?.includes("sucesso")
                ? "bg-green-100/80 text-green-700"
                : "bg-red-100/80 text-red-700"
            }`}
          >
            <LucideIcons.AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error || statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSettings;
