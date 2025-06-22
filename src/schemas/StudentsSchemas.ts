import type { plainToClassFromExist } from "class-transformer/types";
import { z } from "zod";

class StudentsSchema {
  // Base student schema
  static student = z.object({
    idStudent: z.number().int().optional(),
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty."),
    biNumber: z.string({
      required_error: "The 'biNumber' field is required.",
      invalid_type_error: "The 'biNumber' field must be a string."
    }).nonempty("BI number cannot be empty."),
    room: z.string({
      required_error: "The 'room' field is required.",
      invalid_type_error: "The 'room' field must be a string."
    }).nonempty("Room cannot be empty."),
    plainToClassFromExist: z.string({
      required_error: "The 'class' field is required.",
      invalid_type_error: "The 'class' field must be a string."
    }).nonempty("Class cannot be empty."),
    dateOfBirth: z.date({
      required_error: "The 'dateOfBirth' field is required.",
      invalid_type_error: "The 'dateOfBirth' field must be a date."
    }),
    photo: z.string({
      required_error: "The 'photo' field is required.",
      invalid_type_error: "The 'photo' field must be a string."
    }).nonempty("Photo cannot be empty.").optional(),
    createdIn: z.date({
      required_error: "The 'createdIn' field is required.",
      invalid_type_error: "The 'createdIn' field must be a date."
    }),
    updatedIn: z.date().nullable().optional(),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    idClass: z.number({
      required_error: "The 'idClass' field is required.",
      invalid_type_error: "The 'idClass' field must be a number."
    }).int(),
  });

  // Operation-specific schemas
  static studentInput = z.object({
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty."),
    biNumber: z.string({
      required_error: "The 'biNumber' field is required.",
      invalid_type_error: "The 'biNumber' field must be a string."
    }).nonempty("BI number cannot be empty."),
    room: z.string({
      required_error: "The 'room' field is required.",
      invalid_type_error: "The 'room' field must be a string."
    }).nonempty("Room cannot be empty."),
    
    dateOfBirth: z.date({
      required_error: "The 'dateOfBirth' field is required.",
      invalid_type_error: "The 'dateOfBirth' field must be a date."
    }),
    photo: z.string({
      required_error: "The 'photo' field is required.",
      invalid_type_error: "The 'photo' field must be a string."
    }).nonempty("Photo cannot be empty.").optional(),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    idClass: z.number({
      required_error: "The 'idClass' field is required.",
      invalid_type_error: "The 'idClass' field must be a number."
    }).int(),
  });

  static idStudent = z.object({
    idStudent: z.number({
      required_error: "The 'idStudent' field is required.",
      invalid_type_error: "The 'idStudent' field must be a number."
    }).int().optional()
  });

  static token = z.object({
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    }).nonempty("Token cannot be empty.")
  });

  static students = z.array(this.student);
}

export default StudentsSchema;