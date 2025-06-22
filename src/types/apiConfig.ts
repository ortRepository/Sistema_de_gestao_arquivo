export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
}

export const endpoints = {
  settings: {
    update: { method: "PUT" as const, path: "/settings" },
    get: { method: "GET" as const, path: "/settings" },
  },
  notifications: {
    list: { method: "GET" as const, path: "/api/notifications" },
    getById: {
      method: "GET" as const,
      path: "/api/notifications/{idNotification}",
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/notifications/{idNotification}",
    },
    read: {
      method: "PATCH" as const,
      path: "/api/notifications/{idNotification}/read",
    },
  },
  users: {
    getAll: { method: "GET" as const, path: "/api/users" },
    viewAll: { method: "GET" as const, path: "/api/users/view-a" },
    update: { method: "PUT" as const, path: "/api/users/update" },
    delete: { method: "DELETE" as const, path: "/api/users" },
    register: { method: "POST" as const, path: "/api/users/register" },
    authenticate: { method: "POST" as const, path: "/api/users/authenticate" },
    receiveCode: { method: "POST" as const, path: "/api/users/receive-code" },
    recoverPassword: {
      method: "POST" as const,
      path: "/api/users/recover-password",
    },
    changeEmail: { method: "PATCH" as const, path: "/api/users/change-email" },
    passwordEdit: {
      method: "PATCH" as const,
      path: "/api/users/password-edit",
    },
    uploadPhoto: { method: "PATCH" as const, path: "/api/users/upload-photo" },
    updatePassword: {
      method: "PUT" as const,
      path: "/api/users/{idUser}/password",
    },
    changePassword: {
      method: "PUT" as const,
      path: "/api/users/change-password",
    },
    updatePasswordWithCode: {
      method: "POST" as const,
      path: "/users/update-password-with-code",
    },
    upload: { method: "POST" as const, path: "/users/upload" },
  },
  documents: {
    add: { method: "POST" as const, path: "/api/documents/add" },
    delete: { method: "DELETE" as const, path: "/api/documents" },
    list: { method: "GET" as const, path: "/api/documents" },
    getById: { method: "GET" as const, path: "/api/documents/{idDocument}" },
  },
  classes: {
    create: { method: "POST" as const, path: "/api/classes" },
    update: { method: "PUT" as const, path: "/api/classes" },
    delete: { method: "DELETE" as const, path: "/api/classes" },
    list: { method: "GET" as const, path: "/api/classes" },
    viewAll: { method: "GET" as const, path: "/api/classes/view-a" },
  },
  courses: {
    create: { method: "POST" as const, path: "/api/courses" },
    update: { method: "PUT" as const, path: "/api/courses" },
    delete: { method: "DELETE" as const, path: "/api/courses" },
    list: { method: "GET" as const, path: "/api/courses" },
    viewAll: { method: "GET" as const, path: "/api/courses/view-a" },
  },
  rooms: {
    create: { method: "POST" as const, path: "/api/rooms" },
    update: { method: "PUT" as const, path: "/api/rooms" },
    delete: { method: "DELETE" as const, path: "/api/rooms" },
    list: { method: "GET" as const, path: "/api/rooms" },
    viewAll: { method: "GET" as const, path: "/api/rooms/view-a" },
  },
  students: {
    create: { method: "POST" as const, path: "/api/students" },
    update: { method: "PUT" as const, path: "/api/students" },
    delete: { method: "DELETE" as const, path: "/api/students" },
    list: { method: "GET" as const, path: "/api/students" },
    viewAll: { method: "GET" as const, path: "/api/students/view-a" },
  },
  subjects: {
    create: { method: "POST" as const, path: "/api/subjects" },
    update: { method: "PUT" as const, path: "/api/subjects" },
    delete: { method: "DELETE" as const, path: "/api/subjects" },
    list: { method: "GET" as const, path: "/api/subjects" },
    viewAll: { method: "GET" as const, path: "/api/subjects/view-a" },
  },
  teachers: {
    create: { method: "POST" as const, path: "/api/teachers" },
    delete: { method: "DELETE" as const, path: "/api/teachers" },
    list: { method: "GET" as const, path: "/api/teachers" },
    viewAll: { method: "GET" as const, path: "/api/teachers/view-a" },
  },
};
