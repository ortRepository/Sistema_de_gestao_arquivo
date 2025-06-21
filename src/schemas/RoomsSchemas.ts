import { z } from "zod";

class RoomsSchema {
  // Base room schema
  static room = z.object({
    idRoom: z.number().int().optional(),
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
  static roomInput = z.object({
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

  static idRoom = z.object({
    idRoom: z.number({
      required_error: "The 'idRoom' field is required.",
      invalid_type_error: "The 'idRoom' field must be a number."
    }).int().optional()
  });

  static token = z.object({
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    }).nonempty("Token cannot be empty.")
  });

  static rooms = z.array(this.room);
}

export default RoomsSchema;