import { EndpointConfig, endpoints } from "../types/apiConfig";
import { useApiQuery, useApiMutation } from "../services/apiClient";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  Class,
  Course,
  Notification,
  Room,
  Student,
  Subject,
  Teacher,
} from "@/types/interfaces";

/* 
  ================================================================================
  SobreCarga e Implementação do createApiHook
  ================================================================================
*/

// Sobrecargas para endpoints GET
export function createApiHook<T, U = unknown>(
  endpoint: { method: "GET"; path: string },
  onSuccessCallback?: () => void
): (enabled?: boolean) => UseQueryResult<T, Error>;

// Sobrecargas para endpoints que não são GET (POST, PUT, DELETE, etc.)
export function createApiHook<T, U = unknown>(
  endpoint: Exclude<EndpointConfig, { method: "GET" }>,
  onSuccessCallback?: () => void
): () => UseMutationResult<T, Error, U>;

// Implementação: retorna um hook baseado no método do endpoint
export function createApiHook<
  T,
  U extends Record<string, any> | FormData = Record<string, any>
>(endpoint: EndpointConfig, onSuccessCallback?: () => void) {
  if (endpoint.method === "GET") {
    return function useDynamicQuery(
      enabled: boolean = true
    ): UseQueryResult<T, Error> {
      return useApiQuery<T>([endpoint.path], endpoint.path, enabled);
    };
  } else {
    return function useDynamicMutation(): ReturnType<
      typeof useApiMutation<T, U>
    > {
      return useApiMutation<T, U>(
        endpoint.method,
        endpoint.path,
        onSuccessCallback
      );
    };
  }
}

/*
  ================================================================================
  Endpoints de USUÁRIO
  ================================================================================
*/

// Register a new user (POST /api/users/register)
export const useRegisterUser = createApiHook<
  { code: number; message: string },
  {
    email: string;
    name: string;
    telephone: string;
    password: string;
    code: string;
  }
>(endpoints.users.register);

// Authenticate user (POST /api/users/authenticate)
export const useAuthenticateUser = createApiHook<
  {
    code: number;
    message: string;
    accessToken: string;
    idUser: number;
    userRole: number;
  },
  { email: string; password: string }
>(endpoints.users.authenticate);

// Receive authentication code (POST /api/users/receive-code)
export const useReceiveCode = createApiHook<
  { code: number; message: string },
  { email: string }
>(endpoints.users.receiveCode);

// Recover password (POST /api/users/recover-password)
export const useRecoverPassword = createApiHook<
  { code: number; message: string },
  { email: string; code: string; newPassword: string }
>(endpoints.users.recoverPassword);

// Get all users (GET /api/users)
export const useGetAll = createApiHook<
  {
    idUser: number;
    email: string;
    telephone: string;
    password: string;
    role: number;
    name: string;
    createdIn: string;
    path: string;
    photo: string;
    updatedIn: string;
    status: boolean;
    token: string;
  }[]
>(endpoints.users.getAll);

// View user information (GET /api/users/view-a)
export const useGetUser = createApiHook<{
  idUser: number;
  email: string;
  telephone: string;
  password: string;
  role: number;
  name: string;
  createdIn: string;
  path: string;
  photo: string;
  updatedIn: string;
  status: boolean;
  token: string;
}>(endpoints.users.viewAll);

// Upload user photo (PATCH /api/users/upload-photo)
export const useUploadPhoto = createApiHook<
  {
    code: number;
    message: string;
    result: { url: string };
  },
  FormData
>(endpoints.users.uploadPhoto);

// Edit user password (PATCH /api/users/password-edit)
export const useEditPassword = createApiHook<
  {
    code: number;
    message: string;
    result: {
      token: string;
      type: number;
    };
  },
  { newPassword: string; oldPassword: string }
>(endpoints.users.passwordEdit);

// Change user email (PATCH /api/users/change-email)
export const useChangeEmail = createApiHook<
  { code: number; message: string },
  { newEmail: string; code: string; password: string }
>(endpoints.users.changeEmail);

// Update user information (PUT /api/users/update)
export const useUpdateUser = createApiHook<
  { code: number; message: string },
  {
    name: string;
    telephone: string;
    status: boolean;
  }
>(endpoints.users.update);

// Delete user account (DELETE /api/users)
export const useDeleteUser = createApiHook<
  { code: number; message: string },
  { idUser: number }
>(endpoints.users.delete);

/*
  ================================================================================
  Endpoints de NOTIFICAÇÕES
  ================================================================================
*/

// List all notifications (GET /api/notifications)
export const useListNotifications = createApiHook<Notification[]>(
  endpoints.notifications.list
);

// Get specific notification (GET /api/notifications/{idNotification})
export const useGetNotification = createApiHook<
  Notification,
  { idNotification: number }
>(endpoints.notifications.getById);

// Delete notification (DELETE /api/notifications/{idNotification})
export const useDeleteNotification = createApiHook<
  { message: string },
  { idNotification: number }
>(endpoints.notifications.delete);

// Mark notification as read (PATCH /api/notifications/{idNotification}/read)
export const useReadNotification = createApiHook<
  { message: string },
  { idNotification: number }
>(endpoints.notifications.read);

/*
  ================================================================================
  Endpoints de DOCUMENTOS
  ================================================================================
*/

// Add a new document (POST /api/documents/add)
export const useAddDocument = createApiHook<
  { code: number; message: string },
  FormData
>(endpoints.documents.add);

// Delete a document (DELETE /api/documents)
export const useDeleteDocument = createApiHook<
  { code: number; message: string },
  { idDocument: number }
>(endpoints.documents.delete);

// View all documents (GET /api/documents)
export const useListDocuments = createApiHook<
  Document[],
  {
    idStudent?: number;
    idCourse?: number;
    idTeacher?: number;
    idRoom?: number;
  }
>(endpoints.documents.list);

// View a single document (GET /api/documents/{idDocument})
export const useGetDocument = createApiHook<Document, { idDocument: number }>(
  endpoints.documents.getById
);

/*
  ================================================================================
  Endpoints de CLASSES
  ================================================================================
*/

// Add a new class (POST /api/classes)
export const useAddClass = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean; idRoom: number }
>(endpoints.classes.create);

// Delete a class (DELETE /api/classes)
export const useDeleteClass = createApiHook<
  { code: number; message: string },
  { idClass: number }
>(endpoints.classes.delete);

// Edit a class (PUT /api/classes)
export const useUpdateClass = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean; idRoom: number }
>(endpoints.classes.update);

// View all classes (GET /api/classes)
export const useListClasses = createApiHook<Class[]>(endpoints.classes.list);

// View a specific class (GET /api/classes/view-a)
export const useGetClass = createApiHook<Class, { idClass: number }>(
  endpoints.classes.viewAll
);

/*
  ================================================================================
  Endpoints de CURSOS
  ================================================================================
*/

// Add a new course (POST /api/courses)
export const useAddCourse = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean }
>(endpoints.courses.create);

// Delete a course (DELETE /api/courses)
export const useDeleteCourse = createApiHook<
  { code: number; message: string },
  { idCourse: number }
>(endpoints.courses.delete);

// Edit a course (PUT /api/courses)
export const useUpdateCourse = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean }
>(endpoints.courses.update);

// View all courses (GET /api/courses)
export const useListCourses = createApiHook<Course[]>(endpoints.courses.list);

// View a specific course (GET /api/courses/view-a)
export const useGetCourse = createApiHook<Course>(endpoints.courses.viewAll);

/*
  ================================================================================
  Endpoints de SALAS
  ================================================================================
*/

// Add a new room (POST /api/rooms)
export const useAddRoom = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean; idCourse: number }
>(endpoints.rooms.create);

// Update a room (PUT /api/rooms)
export const useUpdateRoom = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean; idCourse: number }
>(endpoints.rooms.update);

// Delete a room (DELETE /api/rooms)
export const useDeleteRoom = createApiHook<
  { code: number; message: string },
  { idRoom: number }
>(endpoints.rooms.delete);

// View all rooms (GET /api/rooms)
export const useListRooms = createApiHook<Room[]>(endpoints.rooms.list);

// View a specific room (GET /api/rooms/view-a)
export const useGetRoom = createApiHook<Room>(endpoints.rooms.viewAll);

/*
  ================================================================================
  Endpoints de ESTUDANTES
  ================================================================================
*/

// Register a new student (POST /api/students)
export const useAddStudent = createApiHook<
  { code: number; message: string },
  {
    name: string;
    biNumber: string;
    room: string;
    dateOfBirth: string;
    photo: string;
    status: boolean;
    idClass: number;
  }
>(endpoints.students.create);

// Update a student (PUT /api/students)
export const useUpdateStudent = createApiHook<
  { code: number; message: string },
  {
    name: string;
    biNumber: string;
    room: string;
    dateOfBirth: string;
    photo: string;
    status: boolean;
    idClass: number;
  }
>(endpoints.students.update);

// Delete a student (DELETE /api/students)
export const useDeleteStudent = createApiHook<
  { code: number; message: string },
  { idStudent: number }
>(endpoints.students.delete);

// View all students (GET /api/students)
export const useListStudents = createApiHook<Student[]>(
  endpoints.students.list
);

// View a specific student (GET /api/students/view-a)
export const useGetStudent = createApiHook<Student>(endpoints.students.viewAll);

/*
  ================================================================================
  Endpoints de DISCIPLINAS
  ================================================================================
*/

// Register a new subject (POST /api/subjects)
export const useAddSubject = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean; idCourse: number }
>(endpoints.subjects.create);

// Delete a subject (DELETE /api/subjects)
export const useDeleteSubject = createApiHook<
  { code: number; message: string },
  { idSubject: number }
>(endpoints.subjects.delete);

// Update a subject (PUT /api/subjects)
export const useUpdateSubject = createApiHook<
  { code: number; message: string },
  { name: string; status: boolean; idCourse: number }
>(endpoints.subjects.update);

// View all subjects (GET /api/subjects)
export const useListSubjects = createApiHook<Subject[]>(
  endpoints.subjects.list
);

// View a specific subject (GET /api/subjects/view-a)
export const useGetSubject = createApiHook<Subject>(endpoints.subjects.viewAll);

/*
  ================================================================================
  Endpoints de PROFESSORES
  ================================================================================
*/

// Add a new teacher (POST /api/teachers)
export const useAddTeacher = createApiHook<
  { code: number; message: string },
  {
    name: string;
    email: string;
    telephone: string;
    role: number;
    function: string;
    photo: string;
    path: string;
    status: boolean;
  }
>(endpoints.teachers.create);

// Delete a teacher (DELETE /api/teachers)
export const useDeleteTeacher = createApiHook<
  { code: number; message: string },
  { idTeacher: number }
>(endpoints.teachers.delete);

// View all teachers (GET /api/teachers)
export const useListTeachers = createApiHook<Teacher[]>(
  endpoints.teachers.list
);

// View a specific teacher (GET /api/teachers/view-a)
export const useGetTeacher = createApiHook<Teacher, { idTeacher: number }>(
  endpoints.teachers.viewAll
);
