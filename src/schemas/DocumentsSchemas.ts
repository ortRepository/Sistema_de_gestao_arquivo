import { z } from 'zod';
import ClassesSchema from './ClassesSchemas';
import CoursesSchema from './CoursesSchemas';
import RoomsSchema from './RoomsSchemas';
import StudentsSchema from './StudentsSchemas';
import SubjectsSchema from './SubjectsSchemas';
import TeachersSchemas from './TeachersSchemas';

class DocumentsSchemas {
  // Schema for a single document
  static document = z.object({
    idDocument: z.number({
      required_error: "The 'idDocument' field is required.",
      invalid_type_error: "The 'idDocument' field must be a number."
    }).int(),
    description: z.string({
      required_error: "The 'description' field is required.",
      invalid_type_error: "The 'description' field must be a string."
    }).max(255),
    urlLink: z.string({
      required_error: "The 'urlLink' field is required.",
      invalid_type_error: "The 'urlLink' field must be a string."
    }).max(255),
    path: z.string({
      required_error: "The 'path' field is required.",
      invalid_type_error: "The 'path' field must be a string."
    }).max(255).optional().nullable(),
    createdIn: z.date({
      required_error: "The 'createdIn' field is required.",
      invalid_type_error: "The 'createdIn' field must be a date."
    }).nullable(),
    updatedIn: z.date().nullable().optional(),
    status: z.boolean({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    idClass: z.number({
      invalid_type_error: "The 'idClasse' field must be a number."
    }).int().optional().nullable(),
    idSubject: z.number({
      invalid_type_error: "The 'idSubject' field must be a number."
    }).int().optional().nullable(),
    idStudent: z.number({
      invalid_type_error: "The 'idStudent' field must be a number."
    }).int().optional().nullable(),
    idCourse: z.number({
      invalid_type_error: "The 'idCourse' field must be a number."
    }).int().optional().nullable(),
    idTeacher: z.number({
      invalid_type_error: "The 'idTeacher' field must be a number."
    }).int().optional().nullable(),
    idRoom: z.number({
      invalid_type_error: "The 'idRoom' field must be a number."
    }).int().optional().nullable(),
    class: ClassesSchema.class.nullable(),
    course: CoursesSchema.course.nullable(),
    room: RoomsSchema.room.nullable(),
    student: StudentsSchema.student.nullable(),
    subject: SubjectsSchema.subject.nullable(),
    teacher: TeachersSchemas.teacher.nullable()
  });

  // Schema for adding a document
  static addDocument = z.object({
    description: z.string({
      required_error: "The 'description' field is required.",
      invalid_type_error: "The 'description' field must be a string."
    }).nonempty("Description cannot be empty.").max(255),
    idSubject: z.string({
      invalid_type_error: "The 'idSubject' field must be a number."
    }).optional(),
    status: z.string({
      required_error: "The 'status' field is required.",
      invalid_type_error: "The 'status' field must be a boolean."
    }),
    idClass: z.string({
      invalid_type_error: "The 'idClasse' field must be a number."
    }).optional(),
    idStudent: z.string({
      invalid_type_error: "The 'idStudent' field must be a number."
    }).optional(),
    idCourse: z.string({
      invalid_type_error: "The 'idCourse' field must be a number."
    }).optional(),
    idTeacher: z.string({
      invalid_type_error: "The 'idTeacher' field must be a number."
    }).optional(),
    idRoom: z.string({
      invalid_type_error: "The 'idRoom' field must be a number."
    }).optional(),
    file:z.any().optional()
  }).refine((data) => data.idClass || data.idStudent || data.idCourse || data.idTeacher || data.idRoom, {
    message: "At least one of 'idClasse', 'idStudent', 'idCourse', 'idTeacher', or 'idRoom' must be provided.",
  }).nullable();

  // Schema for deleting a document
  static deleteDocument = z.object({
    idDocument: z.number({
      required_error: "The 'idDocument' field is required.",
      invalid_type_error: "The 'idDocument' field must be a number."
    }).int().positive("ID Document must be a positive integer"),
  });

  // Schema for viewing a single document by specific criteria
  static viewDocumentById = z.object({
    idDocument: z.string({
      required_error: "The 'idDocument' field is required.",
      invalid_type_error: "The 'idDocument' field must be a string."
    }).nonempty("Document ID cannot be empty.").regex(/^\d+$/, "Document ID must be a valid number."),
  });

  static viewDocumentByClasse = z.object({
    idClass: z.string({
      required_error: "The 'idClass' field is required.",
      invalid_type_error: "The 'idClass' field must be a string."
    }).nonempty("Class ID cannot be empty.").regex(/^\d+$/, "Class ID must be a valid number."),
  });

  static viewDocumentBySubject = z.object({
    idSubject: z.string({
      required_error: "The 'idSubject' field is required.",
      invalid_type_error: "The 'idSubject' field must be a string."
    }).nonempty("Subject ID cannot be empty.").regex(/^\d+$/, "idSubject ID must be a valid number."),
  });

  static viewDocumentByStudent = z.object({
    idStudent: z.string({
      required_error: "The 'idStudent' field is required.",
      invalid_type_error: "The 'idStudent' field must be a string."
    }).nonempty("Student ID cannot be empty.").regex(/^\d+$/, "Student ID must be a valid number."),
  });

  static viewDocumentByCourse = z.object({
    idCourse: z.string({
      required_error: "The 'idCourse' field is required.",
      invalid_type_error: "The 'idCourse' field must be a string."
    }).nonempty("Course ID cannot be empty.").regex(/^\d+$/, "Course ID must be a valid number."),
  });

  static viewDocumentByTeacher = z.object({
    idTeacher: z.string({
      required_error: "The 'idTeacher' field is required.",
      invalid_type_error: "The 'idTeacher' field must be a string."
    }).nonempty("Teacher ID cannot be empty.").regex(/^\d+$/, "Teacher ID must be a valid number."),
  });

  static viewDocumentByRoom = z.object({
    idRoom: z.string({
      required_error: "The 'idRoom' field is required.",
      invalid_type_error: "The 'idRoom' field must be a string."
    }).nonempty("Room ID cannot be empty.").regex(/^\d+$/, "Room ID must be a valid number."),
  });

  // Schema for token validation
  static token = z.object({
    token: z.string({
      required_error: "The 'token' field is required.",
      invalid_type_error: "The 'token' field must be a string."
    }).nonempty("Token cannot be empty."),
  });

  static idQuerys = z.object({
    idRoom: z.string({
      required_error: "The 'idRoom' field is required.",
      invalid_type_error: "The 'idRoom' field must be a string."
    }).nonempty("Room ID cannot be empty.").regex(/^\d+$/, "Room ID must be a valid number.").optional(),
    idTeacher: z.string({
      required_error: "The 'idTeacher' field is required.",
      invalid_type_error: "The 'idTeacher' field must be a string."
    }).nonempty("Teacher ID cannot be empty.").regex(/^\d+$/, "Teacher ID must be a valid number.").optional(),
    idCourse: z.string({
      required_error: "The 'idCourse' field is required.",
      invalid_type_error: "The 'idCourse' field must be a string."
    }).nonempty("Course ID cannot be empty.").regex(/^\d+$/, "Course ID must be a valid number.").optional(),
    idStudent: z.string({
      required_error: "The 'idStudent' field is required.",
      invalid_type_error: "The 'idStudent' field must be a string."
    }).nonempty("Student ID cannot be empty.").regex(/^\d+$/, "Student ID must be a valid number.").optional(),
    idClass: z.string({
      required_error: "The 'idClasse' field is required.",
      invalid_type_error: "The 'idClasse' field must be a string."
    }).nonempty("Class ID cannot be empty.").regex(/^\d+$/, "Class ID must be a valid number.").optional(),
    idSubject: z.string({
      required_error: "The 'idSubject' field is required.",
      invalid_type_error: "The 'idSubject' field must be a string."
    }).nonempty("Subject ID cannot be empty.").regex(/^\d+$/, "idSubject ID must be a valid number.").optional(),
  })

  // Response schema for success messages
  static successResponse = z.object({
    message: z.string({
      required_error: "The 'message' field is required.",
      invalid_type_error: "The 'message' field must be a string."
    }).nonempty("Message cannot be empty."),
  });

  // Response schema for an array of documents
  static documents = z.array(this.document);
}

export default DocumentsSchemas;