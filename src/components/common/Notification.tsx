import { Bell } from "lucide-react";
import { useState, useEffect, useCallback, JSX } from "react";
import { useListNotifications, useGetUser } from "@/hooks/DynamicApiHooks";
interface Notification {
  idNotification: number;
  title: string;
  description: string;
  createdIn: string;
  read: boolean;
  idUser: number;
  updatedIn: string;
}

type ChannelType = "push";

interface SettingItem {
  type: "Push";
  description: string;
  enabled: boolean;
  icon: JSX.Element;
}

export const NotificationsSection = () => {
  // Initialize push notification setting from localStorage
  const rawPushValue = localStorage.getItem("pushNotificationEnabled");
  let initialPushEnabled = false;

  if (rawPushValue !== null && rawPushValue !== "undefined") {
    try {
      initialPushEnabled = JSON.parse(rawPushValue);
    } catch (e) {
      initialPushEnabled = false;
    }
  }

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      type: "Push",
      description: "Notificações no dispositivo",
      enabled: initialPushEnabled,
      icon: <Bell className="w-8 h-8" />,
    },
  ]);

  const { data: notificationsFromApi = [] } = useListNotifications();
  const { data: userData } = useGetUser();
  const [sentMap, setSentMap] = useState<Record<number, ChannelType[]>>({});

  // Sync push setting with localStorage
  useEffect(() => {
    const pushSetting = settings[0].enabled;
    localStorage.setItem(
      "pushNotificationEnabled",
      JSON.stringify(pushSetting)
    );
  }, [settings]);

  // Request permission for push notifications on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Toggle push notification setting
  const handleToggle = () => {
    setSettings((prev) => [{ ...prev[0], enabled: !prev[0].enabled }]);
  };

  const enabledTypes: ChannelType[] = settings[0].enabled ? ["push"] : [];

  // Send push notification
  const sendPushNotification = useCallback((notification: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.description,
      });
    }
  }, []);

  // Send notification to channel
  const sendToChannel = useCallback(
    (notification: Notification, channel: ChannelType) => {
      if (channel === "push") {
        sendPushNotification(notification);
      }
    },
    [sendPushNotification]
  );

  // Handle notifications
  useEffect(() => {
    if (notificationsFromApi.length === 0 || enabledTypes.length === 0) return;

    notificationsFromApi.forEach((notif) => {
      if (notif.read || notif.idUser !== userData?.idUser) return;

      enabledTypes.forEach((channel) => {
        const alreadySent =
          sentMap[notif.idNotification]?.includes(channel) ?? false;
        if (!alreadySent) {
          sendToChannel(notif, channel);
          setSentMap((prev) => {
            const prevArr = prev[notif.idNotification] ?? [];
            return {
              ...prev,
              [notif.idNotification]: [...prevArr, channel],
            };
          });
        }
      });
    });
  }, [notificationsFromApi, enabledTypes, sendToChannel, sentMap, userData]);

  return (
    <div className=" p-6 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 ">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 ">
        Configurações de Notificações
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 h-auto md:h-44 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4D6BFE] to-[#4D6BFE]" />

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4D6BFE]/10 rounded-lg text-[#4D6BFE]">
                {settings[0].icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notificações no Dispositivo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {settings[0].description}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-14 h-7 rounded-full p-1 transition-all duration-300 ${
                settings[0].enabled
                  ? "bg-gradient-to-r from-[#4D6BFE] to-[#4D6BFE]"
                  : "bg-gray-300 dark:bg-gray-500"
              }`}
              aria-label={
                settings[0].enabled
                  ? "Desativar notificações"
                  : "Ativar notificações"
              }
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  settings[0].enabled ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Image */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-[#4D6BFE]/10 rounded-full blur-2xl" />
            <svg
              className="w-full h-full text-[#4D6BFE] dark:text-[#4D6BFE]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-[#4D6BFE]/20 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
