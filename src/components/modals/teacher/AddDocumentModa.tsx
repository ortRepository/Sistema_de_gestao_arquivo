import React, { useEffect, useState, ChangeEvent } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentButton from "@/components/common/button";
import ComponentInput from "@/components/common/FormInput";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FileText } from "lucide-react";
import {
  useListClasses,
  useListSubjects,
  useListStudents,
  useListCourses,
  useListTeachers,
  useListRooms,
  useAddDocument,
} from "@/hooks/DynamicApiHooks";
import {
  Class,
  Subject,
  Student,
  Course,
  Teacher,
  Room,
} from "@/types/interfaces";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Option {
  value: string;
  label: string;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [idSubject, setIdSubject] = useState("");
  const [status, setStatus] = useState("true");
  const [idClass, setIdClass] = useState("");
  const [idStudent, setIdStudent] = useState("");
  const [idCourse, setIdCourse] = useState("");
  const [idTeacher, setIdTeacher] = useState("");
  const [idRoom, setIdRoom] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: addDocument } = useAddDocument();
  const { data: classes } = useListClasses();
  const { data: subjects } = useListSubjects();
  const { data: students } = useListStudents();
  const { data: courses } = useListCourses();
  const { data: teachers } = useListTeachers();
  const { data: rooms } = useListRooms();

  const subjectOptions: Option[] =
    subjects?.map((s: Subject) => ({
      value: s.idSubject.toString(),
      label: s.name,
    })) || [];
  const classOptions: Option[] =
    classes?.map((c: Class) => ({
      value: c.idClass.toString(),
      label: c.name,
    })) || [];
  const studentOptions: Option[] =
    students?.map((s: Student) => ({
      value: s.idStudent.toString(),
      label: s.name,
    })) || [];
  const courseOptions: Option[] =
    courses?.map((c: Course) => ({
      value: c.idCourse.toString(),
      label: c.name,
    })) || [];
  const teacherOptions: Option[] =
    teachers?.map((t: Teacher) => ({
      value: t.idTeacher.toString(),
      label: t.name,
    })) || [];
  const roomOptions: Option[] =
    rooms?.map((r: Room) => ({
      value: r.idRoom.toString(),
      label: r.name,
    })) || [];
  const statusOptions: Option[] = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSizeMB = 900;
    if (f.size > maxSizeMB * 1024 * 1024) {
      setErrors((err) => ({ ...err, file: `Arquivo excede ${maxSizeMB}MB` }));
      return;
    }
    setFile(f);
    setErrors((err) => ({ ...err, file: undefined }));

    if (f.type.startsWith("image/")) {
      setIsPdf(false);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    } else if (f.type === "application/pdf") {
      setIsPdf(true);
      setPreviewUrl(null);
    } else {
      setIsPdf(false);
      setPreviewUrl(null);
      setErrors((err) => ({
        ...err,
        file: "Formato não suportado (PDF ou imagem)",
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      setDescription("");
      setFile(null);
      setIdSubject("");
      setStatus("true");
      setIdClass("");
      setIdStudent("");
      setIdCourse("");
      setIdTeacher("");
      setIdRoom("");
      setErrors({});
      setPreviewUrl(null);
      setIsPdf(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const errs: Partial<Record<string, string>> = {};
    if (!description) errs.description = "Preencha a descrição";
    if (!file) errs.file = "Envie um arquivo";
    if (!idSubject) errs.idSubject = "Selecione uma disciplina";
    if (!status) errs.status = "Selecione o status";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("description", description);
    formData.append("idSubject", idSubject);
    formData.append("status", status);
    formData.append("file", file!);
    if (idClass) formData.append("idClass", idClass);
    if (idStudent) formData.append("idStudent", idStudent);
    if (idCourse) formData.append("idCourse", idCourse);
    if (idTeacher) formData.append("idTeacher", idTeacher);
    if (idRoom) formData.append("idRoom", idRoom);

    addDocument(formData, {
      onSuccess: () => {
        setIsLoading(false);
        onClose();
      },
      onError: () => {
        setErrors({ submit: "Erro ao adicionar documento" });
        setIsLoading(false);
      },
    });
  };

  return (
    <DynamicModal title="Adicionar Documento" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 overflow-y-auto max-h-[60vh] px-6">
        <ComponentInput
          label="Descrição do Documento"
          name="description"
          type="text"
          placeholder="Digite a descrição do documento"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description || ""}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Arquivo
          </label>
          <div
            className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
              errors.file
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } ${file ? "border-none" : ""}`}
          >
            {!file ? (
              <div className="space-y-2 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path d="M" />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer  rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800  "
                  >
                    <span>Selecione um arquivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="application/pdf,image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Suporta PDF e imagens, até 900MB
                </p>
                {errors.file && (
                  <p className="text-xs text-red-500 mt-1">{errors.file}</p>
                )}
              </div>
            ) : isPdf ? (
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-red-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {file.name}
                </p>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setIsPdf(false);
                  }}
                  className="text-xs text-red-500 mt-2"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl!}
                  alt="Prévia do arquivo"
                  className="max-h-40 rounded-lg object-contain"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setIsPdf(false);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  X
                </button>
              </div>
            )}
          </div>
        </div>

        <SearchableSelect
          label="Disciplina"
          value={idSubject}
          onChange={(val) => setIdSubject(val)}
          options={subjectOptions}
          error={errors.idSubject || ""}
        />
        <SearchableSelect
          label="Status"
          value={status}
          onChange={(val) => setStatus(val)}
          options={statusOptions}
          error={errors.status || ""}
        />
        <SearchableSelect
          label="Turma (opcional)"
          value={idClass}
          onChange={(val) => setIdClass(val)}
          options={classOptions}
          error={errors.idClass || ""}
        />
        <SearchableSelect
          label="Estudante (opcional)"
          value={idStudent}
          onChange={(val) => setIdStudent(val)}
          options={studentOptions}
          error={errors.idStudent || ""}
        />
        <SearchableSelect
          label="Curso (opcional)"
          value={idCourse}
          onChange={(val) => setIdCourse(val)}
          options={courseOptions}
          error={errors.idCourse || ""}
        />
        <SearchableSelect
          label="Professor (opcional)"
          value={idTeacher}
          onChange={(val) => setIdTeacher(val)}
          options={teacherOptions}
          error={errors.idTeacher || ""}
        />
        <SearchableSelect
          label="Sala (opcional)"
          value={idRoom}
          onChange={(val) => setIdRoom(val)}
          options={roomOptions}
          error={errors.idRoom || ""}
        />
      </div>

      <div className="flex justify-end gap-4 mt-4 px-6">
        <ComponentButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          disabled={isLoading}
          loading={isLoading}
        >
          Adicionar
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};
