# 📘 Class Diagram - Academic Management System

This UML class diagram represents the structure of an Academic Management System. It defines the main entities, their attributes, and basic operations (CRUD).

## 🧱 Main Entities

* **Users**: Handles user authentication, password recovery, and profile management.
* **Students**: Linked to a class. Includes personal and academic information.
* **Teachers**: Connected to users and subjects. Each teacher is assigned to a subject.
* **Courses**: Groups subjects and is linked to rooms.
* **Subjects**: Belong to courses and are taught by teachers.
* **Classes**: Represent groups of students and are assigned to rooms.
* **Rooms**: Assigned to classes and courses.
* **Documents**: Linked to students, teachers, classes, rooms, and courses.
* **Notifications**: Sent to users, with read status tracking.

## ⚙️ Common Methods

Each entity contains basic methods such as:

* `add()` / `register()`
* `update()`
* `delete()`
* `viewA()` (view one)
* `viewAll()` (view all)

