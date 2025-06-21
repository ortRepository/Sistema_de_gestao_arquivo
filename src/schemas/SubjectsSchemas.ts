import { z } from "zod";

class SubjectsSchema {
  // Base subject schema
  static subject = z.object({
    idSubject: z.number().int().optional(),
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty."),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    idCourse: z.number({
      required_error: "The 'idCourse' field is required.",
      invalid_type_error: "The 'idCourse' field must be a number."
    }).int(),
    createdIn: z.date({
      required_error: "The 'createdIn' field is required.",
      invalid_type_error: "The 'createdIn' field must be a date."
    }),
    updatedIn: z.date().nullable().optional(),
  });

  // Operation-specific schemas
  static subjectInput = z.object({
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty."),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    idCourse: z.number({
      required_error: "The 'idCourse' field is required.",
      invalid_type_error: "The 'idCourse' field must be a number."
    }).int(),
  });

  static idSubject = z.object({
    idSubject: z.number({
      required_error: "The 'idSubject' field is required.",
      invalid_type_error: "The 'idSubject' field must be a number."
    }).int().optional()
  });

  static token = z.object({
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    }).nonempty("Token cannot be empty.")
  });

  static subjects = z.array(this.subject);
}

export default SubjectsSchema;