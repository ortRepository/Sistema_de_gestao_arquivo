import { FastifyInstance } from "fastify";

import type { FastifyTypedInstance } from "../types/fastify_types";

import { userRoutes } from "./UsersRoutes";
import { notificationsRoutes } from "./NotificationsRoutes";
import { documentsRoutes } from "./DocumentsRoutes";
import { classRoutes} from "./ClassRoutes";
import { courseRoutes } from "./CourseRoutes";
import { roomRoutes } from "./RoomRoutes";
import { studentRoutes } from "./StudentRoutes";
import { subjectRoutes } from "./SubjectRoutes";
import { teacherRoutes } from "./TeacherRoutes";



export async function routes(app:FastifyTypedInstance) {
userRoutes(app)
notificationsRoutes(app)
documentsRoutes(app)
classRoutes(app)
courseRoutes(app)
roomRoutes(app)
studentRoutes(app)
subjectRoutes(app)
teacherRoutes(app)

  


}