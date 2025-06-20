
# 📘 Entity Relationship Diagram (ERD) – Academic Management System

This ERD represents the database structure of an academic management system designed to handle operations within a school or institution.

## 🗃️ Main Entities and Relationships

* **Users**: Core entity that includes login info, roles, and personal data. Linked to teachers and notifications.
* **Students**: Connected to a class (`Classes`) and optionally related to documents.
* **Teachers**: Linked to subjects, users (accounts), and documents.
* **Classes**: Assigned to rooms and have many students and documents.
* **Courses**: Group multiple subjects, rooms, and classes.
* **Subjects**: Belong to a course and are taught by teachers.
* **Rooms**: Used by classes and related to documents.
* **Documents**: Can be associated with students, teachers, classes, courses, and rooms.
* **Notifications**: Sent to users, with read status.

## 🔗 Diagram Highlights

* All main entities include timestamps (`createdIn`, `updatedIn`) and status fields for soft deletion or activation.
* Strong use of **foreign keys** to maintain referential integrity between entities.
* Designed for scalability and integration with academic workflows (e.g., assigning subjects to courses, documents to rooms, etc.).

