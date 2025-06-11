import Cookies from "js-cookie";

const SESSION_TIMEOUT_DAYS = 3; // Expira após 3 dias de inatividade

// Armazena a última atividade no localStorage
const setLastActivityTime = () => {
  localStorage.setItem("lastActivityTime", String(Date.now()));
};

// Verifica se a sessão expirou
const hasSessionExpired = () => {
  const lastActivity = localStorage.getItem("lastActivityTime");
  if (lastActivity) {
    const currentTime = Date.now();
    const timeDifference = currentTime - parseInt(lastActivity, 10);
    const sessionTimeout = SESSION_TIMEOUT_DAYS * 24 * 60 * 60 * 1000; // 3 dias em milissegundos

    // Se o tempo de inatividade for maior que o limite de 3 dias, a sessão expirou
    if (timeDifference > sessionTimeout) {
      clearCache();
      return true;
    }
  }
  return false;
};

export const setCache = (key: string, value: any, expiresDays: number = 7) => {
  // Se a sessão não expirou, atualize a última hora de atividade
  if (!hasSessionExpired()) {
    setLastActivityTime();
    Cookies.set(key, JSON.stringify(value), {
      expires: expiresDays,
      path: "/",
    });
  }
};

export const getCache = (key: string) => {
  if (hasSessionExpired()) {
    return null;
  }

  const value = Cookies.get(key);
  if (value) {
    try {
      setLastActivityTime(); // Atualiza a última hora de atividade sempre que houver uma leitura do cache
      return JSON.parse(value);
    } catch (error) {
      console.error(
        "Error parsing cookie value, clearing invalid cookie:",
        error
      );
      Cookies.remove(key, { path: "/" });
      return null;
    }
  }
  return null;
};

export const clearCache = () => {
  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach((key) => {
    Cookies.remove(key, { path: "/" });
  });
  localStorage.removeItem("lastActivityTime");
};
