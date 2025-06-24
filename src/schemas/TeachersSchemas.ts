import { z } from 'zod';
import DocumentsSchemas from './DocumentsSchemas';

class TeachersSchemas {
  // Schema for a single teacher
  static teacher = z.object({
    idTeacher: z.number({
      required_error: "The 'idTeacher' field is required.",
      invalid_type_error: "The 'idTeacher' field must be a number."
    }).int(),
    function: z.string({
      required_error: "The 'function' field is required.",
      invalid_type_error: "The 'function' field must be a string."
    }).max(255),
    photo: z.string({
      invalid_type_error: "The 'photo' field must be a string."
    }).max(255).optional().nullable(),
    path: z.string({
      invalid_type_error: "The 'path' field must be a string."
    }).max(255).optional().nullable(),
    idUser: z.number({
      required_error: "The 'idUser' field is required.",
      invalid_type_error: "The 'idUser' field must be a number."
    }).int(),
    createdIn: z.date({
      required_error: "The 'createdIn' field is required.",
      invalid_type_error: "The 'createdIn' field must be a date."
    }).nullable(),
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty.").max(255),
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).email("Invalid email format.").max(255),
  });

  // Schema for adding a teacher
  static addTeacher = z.object({
    name: z.string({
      required_error: "The 'name' field is required.",
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty.").max(255),
    email: z.string({
      required_error: "The 'email' field is required.",
      invalid_type_error: "The 'email' field must be a string."
    }).email("Invalid email format.").max(255),
    telephone: z.string({
      required_error: "The 'telephone' field is required.",
      invalid_type_error: "The 'telephone' field must be a string."
    }).nonempty("Telephone cannot be empty.").max(45),
    role: z.number({
      required_error: "The 'role' field is required.",
      invalid_type_error: "The 'role' field must be a number."
    }),
    function: z.string({
      required_error: "The 'function' field is required.",
      invalid_type_error: "The 'function' field must be a string."
    }).nonempty("Function cannot be empty.").max(255),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    // documents: z.array(DocumentsSchemas.document),
  });

  // Schema for editing a teacher
  static editTeacher = z.object({
    idTeacher: z.number({
      required_error: "The 'idTeacher' field is required.",
      invalid_type_error: "The 'idTeacher' field must be a number."
    }).int().positive("ID Teacher must be a positive integer"),
    name: z.string({
      invalid_type_error: "The 'name' field must be a string."
    }).nonempty("Name cannot be empty.").max(255).optional(),
 
    telephone: z.string({
      invalid_type_error: "The 'telephone' field must be a string."
    }).nonempty("Telephone cannot be empty.").max(45).optional(),
    role: z.number({
      invalid_type_error: "The 'role' field must be a number."
    }).optional(),
    function: z.string({
      invalid_type_error: "The 'function' field must be a string."
    }).nonempty("Function cannot be empty.").max(255).optional(),
    status: z.boolean({
      invalid_type_error: "The 'status' field must be a boolean."
    }).optional(),
  });

  // Schema for deleting a teacher
  static deleteTeacher = z.object({
    idTeacher: z.number({
      required_error: "The 'idTeacher' field is required.",
      invalid_type_error: "The 'idTeacher' field must be a number."
    }).int().positive("ID Teacher must be a positive integer"),
  });

  // Schema for viewing a single teacher
  static viewTeacher = z.object({
    idTeacher: z.string({
      required_error: "The 'idTeacher' field is required.",
      invalid_type_error: "The 'idTeacher' field must be a string."
    }).nonempty("Teacher ID cannot be empty.").regex(/^\d+$/, "Teacher ID must be a valid number."),
  });

  // Schema for viewing all teachers
  static viewAllTeachers = z.object({
    idCourse: z.number({
      required_error: "The 'idCourse' field is required.",
      invalid_type_error: "The 'idCourse' field must be a number."
    }),
  });

  // Schema for token validation
  static token = z.object({
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    }).nonempty("Token cannot be empty."),
  });

  // Response schema for success messages
  static successResponse = z.object({
    message: z.string({
      required_error: "The 'message' field is required.",
      invalid_type_error: "The 'message' field must be a string."
    }).nonempty("Message cannot be empty."),
  });

  // Response schema for an array of teachers
  static teachers = z.array(this.teacher);
}

export default TeachersSchemas;