import { z } from "zod";

class UserSchema {
  // Base user schema
  static user = z.object({
    idUser: z.number().int().optional(),
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).email().max(255),
    telephone: z.string({
      required_error: "The 'telephone' field is required.",
      invalid_type_error: "The 'telephone' field must be a string."
    }).max(45),
    password: z.string({
      required_error: "The 'password' field is required.",
      invalid_type_error: "The 'password' field must be a string."
    }),
    role: z.number({
      required_error: "The 'role' field is required.",
      invalid_type_error: "The 'role' field must be a number."
    }).int(),
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }),
    createdIn: z.date({
      required_error: "The 'createdIn' field is required.",
      invalid_type_error: "The 'createdIn' field must be a date."
    }),
    path: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    updatedIn: z.date().nullable().optional(),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    })
  });

  // Operation-specific schemas
  static registerUser = z.object({
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).email().max(255),
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty."),
    telephone: z.string({
      required_error: "The 'telephone' field is required.",
      invalid_type_error: "The 'telephone' field must be a string."
    }).max(45).nonempty("Telephone cannot be empty."),
    password: z.string({
      required_error: "The 'password' field is required.",
      invalid_type_error: "The 'password' field must be a string."
    }).nonempty("Password cannot be empty."),
    code: z.string({
      required_error: "The 'code' field is required.",
      invalid_type_error: "The 'code' field must be a string."
    }).nonempty("Code cannot be empty.")
  });

  static updateUser = z.object({
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty."),
    telephone: z.string({
      required_error: "The 'telephone' field is required.",
      invalid_type_error: "The 'telephone' field must be a string."
    }).max(45, "Telephone must have at most 45 characters.")
     .nonempty("Telephone cannot be empty."),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    })
  });

  static changeEmail = z.object({
    newEmail: z.string({
      required_error: "The 'newEmail' field is required.",
      invalid_type_error: "The 'newEmail' field must be a string."
    }).nonempty("New email cannot be empty."),
    code: z.string({
      required_error: "The 'code' field is required.",
      invalid_type_error: "The 'code' field must be a string."
    }).nonempty("Code cannot be empty."),
    password: z.string({
      required_error: "The 'password' field is required.",
      invalid_type_error: "The 'password' field must be a string."
    }).nonempty("Password cannot be empty.")
  });

  static receiveCode = z.object({
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).nonempty("Email cannot be empty.")
  });

  static changePassword = z.object({
    oldPassword: z.string({
      required_error: "The 'oldPassword' field is required.",
      invalid_type_error: "The 'oldPassword' field must be a string."
    }).nonempty("Old password cannot be empty."),
    newPassword: z.string({
      required_error: "The 'newPassword' field is required.",
      invalid_type_error: "The 'newPassword' field must be a string."
    }).nonempty("New password cannot be empty.")
  });

  static idUser = z.object({
    idUser: z.number({
      required_error: "The 'idUser' field is required.",
      invalid_type_error: "The 'idUser' field must be a number."
    }).int().optional()
  });

  static authenticateUser = z.object({
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).nonempty("Email cannot be empty."),
    password: z.string({
      required_error: "The 'password' field is required.",
      invalid_type_error: "The 'password' field must be a string."
    }).nonempty("Password cannot be empty.")
  });

  static authenticateResponse = z.object({
    accessToken: z.string({
      required_error: "The 'accessToken' field is required.",
      invalid_type_error: "The 'accessToken' field must be a string."
    }).nonempty("Access token cannot be empty."),
    userRole: z.number({
      required_error: "The 'userRole' field is required.",
      invalid_type_error: "The 'userRole' field must be a number."
    }).int(),
    idUser: z.number({
      required_error: "The 'idUser' field is required.",
      invalid_type_error: "The 'idUser' field must be a number."
    }).int()
  });

  static uploadPhoto = z.object({
    file: z.any({
      invalid_type_error: "The 'file' field must be a valid file."
    }).optional()
  });

  static recoveryPassword = z.object({
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).nonempty("Email cannot be empty."),
    code: z.string({
      required_error: "The 'code' field is required.",
      invalid_type_error: "The 'code' field must be a string."
    }).nonempty("Code cannot be empty."),
    newPassword: z.string({
      required_error: "The 'newPassword' field is required.",
      invalid_type_error: "The 'newPassword' field must be a string."
    }).nonempty("New password cannot be empty.")
  });

  static token = z.object({
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    }).nonempty("Token cannot be empty.")
  });

  static uploadPhotoResponse = z.object({
    url: z.string({
      required_error: "The 'url' field is required.",
      invalid_type_error: "The 'url' field must be a string."
    }).nonempty("URL cannot be empty.")
  });

  static users = z.array(this.user);
}

export default UserSchema;