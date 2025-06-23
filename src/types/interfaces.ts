//----------------------------- response ---------------------------------
export interface responseapi {
  code: number;
  message: string;
  data: string;
}
//----------------------------- View user---------------------------------
export interface FormUser {
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
}

//-------------------------Notification ------------------------
export interface Notification {
  idNotification: number;
  title: string;
  description: string;
  createdIn: string;
  read: boolean;
  idUser: number;
  updatedIn: string;
}
//-------------------------Document------------------------
// Document type based on provided schema
export interface Document {
  idDocument: number;
  description: string;
  urlLink: string;
  path: string;
  createdIn: string;
  updatedIn: string;
  status: boolean;
  idClass: number;
  idSubject: number;
  idStudent: number;
  idCourse: number;
  idTeacher: number;
  idRoom: number;
}

//-------------------------Student------------------------
export interface Student {
  idStudent: number;
  name: string;
  biNumber: string;
  room: string;
  plainToClassFromExist: string;
  dateOfBirth: string;
  photo: string;
  createdIn: string;
  updatedIn: string;
  status: boolean;
  idClass: number;
}
export interface ModalStudentProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (student: Student) => void;
}

//-------------------------ClassData ------------------------
export interface Class {
  idClass: number;
  name: string;
  status: boolean;
  idRoom: number;
  createdIn: string;
  updatedIn: string;
}
export interface OptionClass {
  value: string;
  label: string;
}
export interface ModalManageClassProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
  onSave: (cls: Class) => void;
}
//-------------------------Course ------------------------
export interface OptionCourse {
  value: string;
  label: string;
}
// Course type based on provided schema
export interface Course {
  idCourse: number;
  name: string;
  status: boolean;
  createdIn: string;
  updatedIn: string;
}

export interface ModalManageCourseProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSave: (course: Course) => void;
}

//-------------------------Room ------------------------
export interface Room {
  idRoom: number;
  name: string;
  status: boolean;
  idCourse: number;
  createdIn: string;
  updatedIn: string;
}

export interface ModalManageRoomProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSave: (room: Room) => void;
}
//-------------------------Subject ------------------------
export interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectData: Subject | null;
  onSave: (subject: Subject) => void;
}

export interface Subject {
  idSubject: number;
  name: string;
  status: boolean;
  idCourse: number;
  createdIn: string;
  updatedIn: string;
  course?: string;
}
//-------------------------Teacher------------------------
export interface Teacher {
  telephone: string;
  email: string;
  name: string;
  idTeacher: number;
  function: string;
  photo: string;
  path: string;
  idUser: number;
  createdIn: string;
  status: boolean;
}
export interface TeacherRegister {
  name: string;
  email: string;
  telephone: string;
  role: number;
  function: string;
  photo: string;
  path: string;
  status: boolean;
}

export interface ModalRegisterTeacherProps {
  isOpen: boolean;
  onClose: () => void;
  teacherData: Teacher | null;
  onSave: (teacher: Teacher) => void;
  subjects: Subject[];
}
