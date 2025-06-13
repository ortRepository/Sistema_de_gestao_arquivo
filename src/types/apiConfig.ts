export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
}

export const endpoints = {
  departments: {
    list: { method: "GET" as const, path: "/departments" },
    create: { method: "POST" as const, path: "/departments" },
    update: { method: "PUT" as const, path: "/departments" },
    getById: { method: "GET" as const, path: "/departments/{idDepartment}" },
    delete: { method: "DELETE" as const, path: "/departments/{idDepartment}" },
  },

  directions: {
    list: { method: "GET" as const, path: "/directions" },
    create: { method: "POST" as const, path: "/directions" },
    update: { method: "PUT" as const, path: "/directions" },
    getById: { method: "GET" as const, path: "/directions/{idDirection}" },
    delete: { method: "DELETE" as const, path: "/directions/{idDirection}" },
  },

  settings: {
    update: { method: "PUT" as const, path: "/settings" },
    get: { method: "GET" as const, path: "/settings" },
  },
  notifications: {
    list: { method: "GET" as const, path: "/notifications" },
    getById: {
      method: "GET" as const,
      path: "/notifications/{idNotification}",
    },
    delete: {
      method: "DELETE" as const,
      path: "/notifications/{idNotification}",
    },
    read: { method: "PATCH" as const, path: "/notifications/{idNotification}" },
  },
  users: {
    getAll: { method: "GET" as const, path: "/users" },
    useGetAll: { method: "GET" as const, path: "/users/view" },
    update: { method: "PUT" as const, path: "/users/{idUser}" },
    delete: { method: "DELETE" as const, path: "/users/{idUser}" },
    updatePassword: {
      method: "PUT" as const,
      path: "/users/{idUser}/password",
    },
    changePassword: { method: "PUT" as const, path: "/users/change-password" },
    changeEmail: { method: "PUT" as const, path: "/users/change-email" },
    updatePasswordWithCode: {
      method: "POST" as const,
      path: "/users/update-password-with-code",
    },
    receiveCode: { method: "POST" as const, path: "/users/request-code" },
    recoverPassword: {
      method: "POST" as const,
      path: "/users/recover-password",
    },
    authenticate: { method: "POST" as const, path: "/users/authenticate" },
    passwordEdit: { method: "POST" as const, path: "/users/password-edit" },
    uploadPhoto: { method: "POST" as const, path: "/users/upload" },
  },

};
