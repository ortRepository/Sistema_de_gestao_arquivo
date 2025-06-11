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

  mails: {
    send: { method: "POST" as const, path: "/mails" },
    getById: { method: "GET" as const, path: "/mails/{idMail}" },
    delete: { method: "DELETE" as const, path: "/mails/{idMail}" },
    sent: { method: "GET" as const, path: "/mails/sent" },
    received: { method: "GET" as const, path: "/mails/received" },
  },

  accounts: {
    list: { method: "GET" as const, path: "/accounts" },
    create: { method: "POST" as const, path: "/accounts" },
    update: { method: "PUT" as const, path: "/accounts" },
    getById: { method: "GET" as const, path: "/accounts/{idAccount}" },
    delete: { method: "DELETE" as const, path: "/accounts/{idAccount}" },
  },

  budgetManagers: {
    list: { method: "GET" as const, path: "/budget-managers" },
    create: { method: "POST" as const, path: "/budget-managers" },
    update: { method: "PUT" as const, path: "/budget-managers" },
    updateLicense: { method: "PUT" as const, path: "/budget-managers/license" },
    generateLicense: {
      method: "POST" as const,
      path: "/budget-managers/generate-license",
    },
    delete: {
      method: "DELETE" as const,
      path: "/budget-managers/{idBudgetManager}",
    },
  },

  sections: {
    list: { method: "GET" as const, path: "/sections" },
    create: { method: "POST" as const, path: "/sections" },
    update: { method: "PUT" as const, path: "/sections" },
    getById: { method: "GET" as const, path: "/sections/{idSection}" },
    delete: { method: "DELETE" as const, path: "/sections/{idSection}" },
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
  budgetMaps: {
    list: { method: "GET" as const, path: "/budget-maps" },
    getById: {
      method: "GET" as const,
      path: "/budget-maps/{idBudgetMap}",
    },
    create: { method: "POST" as const, path: "/budget-maps" },
    update: { method: "PUT" as const, path: "/budget-maps" },
    delete: { method: "DELETE" as const, path: "/budget-maps" },
    forward: { method: "PATCH" as const, path: "/budget-maps" },
    listReceived: { method: "GET" as const, path: "/budget-maps/received" },
  },
  commentsMaps: {
    list: { method: "GET" as const, path: "/comments/maps" },
    getById: { method: "GET" as const, path: "/comments/maps/{idCommentsMap}" },
    create: { method: "POST" as const, path: "/comments/maps" },
    update: { method: "PUT" as const, path: "/comments/maps" },
    delete: { method: "DELETE" as const, path: "/comments/maps" },
  },
  commentsCosts: {
    create: { method: "POST" as const, path: "/comments/costs" },
    list: { method: "GET" as const, path: "/comments/costs" },
    getById: {
      method: "GET" as const,
      path: "/comments/costs/{idCommentsCost}",
    },
    update: { method: "PUT" as const, path: "/comments/costs" },
    delete: { method: "DELETE" as const, path: "/comments/costs" },
  },
  
  costCenters: {
    list: { method: "GET" as const, path: "/cost-centers" },
    create: { method: "POST" as const, path: "/cost-centers" },
    update: { method: "PUT" as const, path: "/cost-centers" },
    getById: { method: "GET" as const, path: "/cost-centers/{idCostCenter}" },
    delete: { method: "DELETE" as const, path: "/cost-centers/{idCostCenter}" },
  },
  timelines: {
    list: { method: "GET" as const, path: "/timelines" },
    create: { method: "POST" as const, path: "/timelines" },
    update: { method: "PUT" as const, path: "/timelines" },
    getById: { method: "GET" as const, path: "/timelines/{idTimeline}" },
    delete: { method: "DELETE" as const, path: "/timelines/{idTimeline}" },
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

  budgetControls: {
    list: { method: "GET" as const, path: "/budget-controls" },
    create: { method: "POST" as const, path: "/budget-controls" },
    update: { method: "PUT" as const, path: "/budget-controls" },
    delete: { method: "DELETE" as const, path: "/budget-controls" },
    getById: {
      method: "GET" as const,
      path: "/budget-controls/{idBudgetControl}",
    },
  },

  classes: {
    list: { method: "GET" as const, path: "/classes" },
    create: { method: "POST" as const, path: "/classes" },
    update: { method: "PUT" as const, path: "/classes" },
    getById: { method: "GET" as const, path: "/classes/{idClass}" },
    delete: { method: "DELETE" as const, path: "/classes/{idClass}" },
  },
  contacts: {
    create: { method: "POST" as const, path: "/contacts" },
    delete: { method: "DELETE" as const, path: "/contacts" },
    getAll: { method: "GET" as const, path: "/contacts" },
    respond: { method: "POST" as const, path: "/contacts/response" },
    getById: { method: "GET" as const, path: "/contacts/{id}" },
  },
  costs: {
    list: { method: "GET" as const, path: "/costs" },
    create: { method: "POST" as const, path: "/costs" },
    pay: { method: "POST" as const, path: "/costs/pay/{idCost}" },
    getById: { method: "GET" as const, path: "/costs/{idCost}" },
    delete: { method: "DELETE" as const, path: "/costs/{idCost}" },
  },
};
