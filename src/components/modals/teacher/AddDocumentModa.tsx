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

  const [status, setStatus] = useState("true");
  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState<string>("");
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

  const entityTypeOptions: Option[] = [
    { value: "subject", label: "Disciplina" },
    { value: "class", label: "Turma" },
    { value: "student", label: "Aluno" },
    { value: "course", label: "Curso" },
    { value: "teacher", label: "Professor" },
    { value: "room", label: "Sala" },
  ];

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

  const getEntityOptions = () => {
    switch (entityType) {
      case "subject":
        return subjectOptions;
      case "class":
        return classOptions;
      case "student":
        return studentOptions;
      case "course":
        return courseOptions;
      case "teacher":
        return teacherOptions;
      case "room":
        return roomOptions;
      default:
        return [];
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSizeMB = 6;
    if (f.size > maxSizeMB * 1024 * 1024) {
      setErrors((err) => ({ ...err, file: `Arquivo excede ${maxSizeMB}MB` }));
      return;
    }
    if (
      !["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(
        f.type
      )
    ) {
      setErrors((err) => ({
        ...err,
        file: "Formato não suportado (PDF, PNG, JPG ou JPEG)",
      }));
      return;
    }
    setFile(f);
    setErrors((prev) => ({ ...prev, file: undefined }));
    console.log("Selected file:", { name: f.name, size: f.size, type: f.type });

    if (f.type.startsWith("image/")) {
      setIsPdf(false);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    } else if (f.type === "application/pdf") {
      setIsPdf(true);
      setPreviewUrl(null);
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
      setStatus("true");
      setEntityType("");
      setEntityId("");
      setErrors({});
      setPreviewUrl(null);
      setIsPdf(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsLoading(true);
    const errs: Partial<Record<string, string>> = {};
    if (!description) errs.description = "Preencha a descrição";
    if (!file) errs.file = "Envie um documento";
    if (!entityType) errs.entityType = "Selecione o tipo de entidade";
    if (!entityId) errs.entityId = "Selecione uma entidade";

    setErrors(errs);
    if (Object.keys(errs).length) {
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    if (entityType && entityId) {
      let fieldKey = "";
      switch (entityType) {
        case "class":
          fieldKey = "idClass";
          break;
        case "subject":
          fieldKey = "idSubject";
          break;
        case "student":
          fieldKey = "idStudent";
          break;
        case "course":
          fieldKey = "idCourse";
          break;
        case "teacher":
          fieldKey = "idTeacher";
          break;
        case "room":
          fieldKey = "idRoom";
          break;
        default:
          console.warn("Tipo de entidade não reconhecido:", entityType);
      }

      if (fieldKey) {
        formData.append(fieldKey, String(entityId));
      }
    }

    formData.append("status", String(status));
    formData.append("file", file as Blob);

    for (const [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        value instanceof Blob
          ? { name: value.name, size: value.size, type: value.type }
          : value
      );
    }

    try {
      await addDocument(formData, {
        onSuccess: () => {
          setFile(null);
          setPreviewUrl(null);
          setIsPdf(false);
          setIsLoading(false);
          onClose();
        },
        onError: (error: any) => {
          console.error("Add document error:", error);
          let errorMessages: Partial<Record<string, string>> = {};

          if (error.response?.data?.details) {
            error.response.data.details.forEach(
              (err: { name: string; error: string }) => {
                errorMessages[err.name] = err.error;
              }
            );
          } else if (error.response?.data?.message) {
            errorMessages.submit = error.response.data.message;
          } else {
            errorMessages.submit =
              error.response?.data?.error ||
              error.message ||
              "Erro ao adicionar documento";
          }

          setErrors(errorMessages);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrors({ submit: "Erro inesperado ao adicionar documento" });
      setIsLoading(false);
    }
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

        <SearchableSelect
          label="Status"
          value={status}
          onChange={(val) => setStatus(val || "true")}
          options={statusOptions}
          error={errors.status || ""}
        />
        <SearchableSelect
          label="Tipo de Entidade"
          value={entityType}
          onChange={(val) => {
            setEntityType(val || "");
            setEntityId("");
          }}
          options={entityTypeOptions}
          error={errors.entityType || ""}
        />
        {entityType && (
          <SearchableSelect
            label={
              entityTypeOptions.find((opt) => opt.value === entityType)
                ?.label || "Entidade"
            }
            value={entityId}
            onChange={(val) => setEntityId(val || "")}
            options={getEntityOptions()}
            error={errors.entityId || ""}
          />
        )}
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
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800"
                  >
                    <span>Selecione um arquivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="application/pdf,image/png,image/jpeg,image/jpg"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Suporta PDF, PNG, JPG e JPEG, até 6MB
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
        {errors.submit && (
          <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
        )}
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
