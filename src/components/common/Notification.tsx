import { Bell, Mail } from "lucide-react";
import { useState, useEffect, useCallback, useRef, JSX } from "react";

import {
  useGetUser,
  useListNotifications,
  useUpdateUser,
} from "@/hooks/DynamicApiHooks";

export interface Notification {
  idNotification: number;
  title: string;
  description: string;
  read: boolean;
  idUser: number;
  createdIn: string;
}

type ChannelType = "email" | "push";

interface SettingItem {
  type: "Email" | "Push";
  description: string;
  enabled: boolean;
  icon: JSX.Element;
}

export const NotificationsSection = () => {
  // Initialize settings state, checking localStorage for Push setting
  const rawPushValue = localStorage.getItem("pushNotificationEnabled");
  let initialPushEnabled = false;

  if (rawPushValue !== null && rawPushValue !== "undefined") {
    try {
      initialPushEnabled = JSON.parse(rawPushValue);
    } catch (e) {
      // JSON.parse failed (maybe someone manually put invalid JSON),
      // so we just fallback to false.
      initialPushEnabled = false;
    }
  }

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      type: "Email",
      description: "Notificações por e-mail",
      enabled: false,
      icon: <Mail className="w-6 h-6" />,
    },
    {
      type: "Push",
      description: "Notificações no dispositivo",
      enabled: initialPushEnabled,
      icon: <Bell className="w-6 h-6" />,
    },
  ]);

  // If you want to keep localStorage in sync whenever "Push" toggles:
  useEffect(() => {
    const pushSetting =
      settings.find((s) => s.type === "Push")?.enabled ?? false;
    localStorage.setItem(
      "pushNotificationEnabled",
      JSON.stringify(pushSetting)
    );
  }, [settings]);

  const { data: notificationsFromApi = [] } = useListNotifications();
  const { data: userData } = useGetUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const [sentMap, setSentMap] = useState<Record<number, ChannelType[]>>({});
  const hasSyncedRef = useRef(false);
  const settingsRef = useRef(settings);

  // Update settingsRef when settings change
  useEffect(() => {
    settingsRef.current = settings;
    // Persist Push setting to localStorage whenever settings change
    const pushSetting = settings.find((item) => item.type === "Push")?.enabled;
    localStorage.setItem(
      "pushNotificationEnabled",
      JSON.stringify(pushSetting)
    );
  }, [settings]);

  // Handler for toggling switches
  const handleToggle = (index: number) => {
    setSettings((prev) => {
      const newSettings = prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      );
      return newSettings;
    });
  };

  const enabledTypes = settings
    .filter((s) => s.enabled)
    .map((s) => s.type.toLowerCase() as ChannelType);

  // Request permission for push notifications on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const sendPushNotification = useCallback((notification: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.description,
      });
    }
  }, []);

  const sendEmailNotification = useCallback((_notification: Notification) => {},
  []);

  const sendToChannel = useCallback(
    (notification: Notification, channel: ChannelType) => {
      if (channel === "push") {
        sendPushNotification(notification);
      } else if (channel === "email") {
        sendEmailNotification(notification);
      }
    },
    [sendPushNotification, sendEmailNotification]
  );

  // Sync Email setting with userData.subscriber
  useEffect(() => {
    if (
      userData &&
      typeof userData.subscriber === "boolean" &&
      !hasSyncedRef.current
    ) {
      setSettings((prev) =>
        prev.map((item) =>
          item.type === "Email"
            ? { ...item, enabled: userData.subscriber }
            : item
        )
      );
      hasSyncedRef.current = true;
    }
  }, [userData]);

  // Update subscriber status when Email setting changes
  useEffect(() => {
    if (!userData) return;

    const updateSubscriberStatus = async () => {
      const isSubscribed =
        settingsRef.current.find((item) => item.type === "Email")?.enabled ||
        false;

      try {
        const payload = {
          idUser: String(userData.idUser || 0),
          name: userData.name || "Usuário desconhecido",
          language: userData.language || "Não disponível",
          theme: userData.theme || 0,
          location: userData.location || "Não disponível",
          subscriber: isSubscribed,
        };

        await updateUser(payload);
      } catch (error) {}
    };

    const timeout = setTimeout(updateSubscriberStatus, 500);
    return () => clearTimeout(timeout);
  }, [settings, userData, updateUser]);

  // Handle notifications based on enabled channels
  useEffect(() => {
    if (notificationsFromApi.length === 0 || enabledTypes.length === 0) return;

    notificationsFromApi.forEach((notif) => {
      if (notif.read) return;

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
  }, [notificationsFromApi, enabledTypes, sendToChannel, sentMap]);

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      <div className="space-y-6">
        {settings.map((item, index) => (
          <div
            key={item.type}
            onClick={() => handleToggle(index)}
            className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-[#4D6BFE]/10 rounded-lg">{item.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{item.type}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div
                className={`ml-auto w-12 h-6 rounded-full p-1 ${
                  item.enabled ? "bg-[#4D6BFE]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                    item.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64">
          <div className="absolute inset-0 bg-[#4D6BFE]/10 rounded-full blur-3xl" />
          <div className="relative p-4 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
            <Bell className="w-12 h-12 text-[#4D6BFE] mx-auto mb-4" />
            <div className="space-y-2 text-center">
              <div className="h-2 w-full bg-gray-200 rounded-full" />
              <div className="h-2 w-3/4 bg-gray-200 rounded-full mx-auto" />
              <div className="h-4 bg-[#4D6BFE] rounded-full mt-4 w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
