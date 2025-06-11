import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { useCreateNews, useGetInstitutions } from "@/hooks/DynamicApiHooks";
import ComponetButton from "@/components/common/button";
import ComponentInput from "./FormInput";
import ComponentextArea from "./FormTextArea";
import { SearchableSelect } from "./SearchableSelect";

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    id_news?: number;
    description: string;
    id_institution: number;
    file: File | null;
    commentable?: boolean;
  }) => void;
  initialData?: {
    title: string;
    id_news?: number;
    description: string;
    id_institution: number;
    file: File | null;
    commentable?: boolean;
  };
  mode?: "edit" | "create";
}

const PublicationModal: React.FC<PublicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "edit",
}) => {
  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [institutionId, setInstitutionId] = useState<string>("");
  const [commentable, setCommentable] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: instData,
    isLoading: instLoading,
    error: instError,
  } = useGetInstitutions();
  const institutions = instData?.result || [];
  const { mutateAsync: createNews } = useCreateNews();

  // Initialize form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      // setDateTime(initialData.dateTime);
      setContent(initialData.description);
      setImageFile(initialData.file);
      if (initialData.id_institution)
        setInstitutionId(String(initialData.id_institution));
      if (initialData.commentable !== undefined)
        setCommentable(initialData.commentable);
    } else if (mode === "create") {
      setTitle("");
      setContent("");
      setImageFile(null);
      setInstitutionId("");
      setCommentable(true);
      setErrors({});
    }
  }, [isOpen, initialData, mode]);

  // Clear status after timeout
  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title) errs.title = "Título é obrigatório";
    // if (!category) errs.category = "Categoria é obrigatória";
    // if (!dateTime) errs.dateTime = "Data e hora são obrigatórias";
    if (!content) errs.content = "Conteúdo é obrigatório";
    if (!institutionId) errs.institutionId = "Instituição é obrigatória";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", content);
    formData.append("id_institution", institutionId);
    formData.append("commentable", String(commentable));
    if (imageFile) formData.append("file", imageFile);

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await createNews(formData);
      console.log(response);
      setStatusMessage({
        text:
          mode === "create"
            ? "Publicação criada com sucesso!"
            : "Publicação atualizada com sucesso!",
        type: "success",
      });
      onSave({
        title,
        description: content,
        id_institution: Number(institutionId),
        file: imageFile,
        commentable,
      });
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setStatusMessage({ text: "Falha ao salvar publicação.", type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-black/30 dark:bg-gray-900/80"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-5xl p-6 md:p-8 rounded shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          {mode === "create" ? "Nova Publicação" : "Editar Publicação"}
        </h2>

        {statusMessage && (
          <div
            className={`border-t-4 mb-4 p-4 rounded ${
              statusMessage.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <p className="flex items-center gap-2 text-sm">
              {statusMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-700" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-700" />
              )}
              <span
                className={
                  statusMessage.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }
              >
                {statusMessage.text}
              </span>
            </p>
          </div>
        )}

        <div className="space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-4 flex flex-col items-center justify-center relative">
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="max-h-80 rounded mb-2"
                />
              ) : (
                <span className="text-gray-500 dark:text-gray-300 text-center">
                  Arraste ou clique para adicionar imagem
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-3">
              <ComponentInput
                label="Título"
                name="title"
                type="text"
                placeholder="Adicione um título"
                value={title}
                error={errors.title}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setTitle(e.target.value)}
                required
              />

              {/* <ComponentInput
                label="Categoria"
                name="category"
                type="text"
                placeholder="Digite a categoria"
                value={category}
                error={errors.category}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setCategory(e.target.value)}
                required
              /> */}

              {/* <ComponentInput
                label="Data e Hora"
                name="dateTime"
                type="datetime-local"
                value={dateTime}
                error={errors.dateTime}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setDateTime(e.target.value)}
                required
              /> */}
              {instLoading ? (
                <p>Carregando instituições...</p>
              ) : instError ? (
                <p className="text-red-500">Erro ao carregar instituições</p>
              ) : (
                <SearchableSelect
                  label="Instituição"
                  options={[
                    { value: "", label: "Selecione uma instituição" },
                    ...institutions.map((inst) => ({
                      value: String(inst.id_institution),
                      label: inst.name,
                    })),
                  ]}
                  value={institutionId}
                  error={errors.institutionId}
                  onChange={(value: string) => setInstitutionId(value)}
                />
              )}

              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={commentable}
                  onChange={() => setCommentable(!commentable)}
                />
                Permitir comentários
              </label>

              <ComponentextArea
                label="Conteúdo"
                name="content"
                placeholder="Adicione uma descrição"
                value={content}
                error={errors.content}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <ComponetButton variant="secondary" onClick={onClose}>
            Fechar
          </ComponetButton>
          <ComponetButton
            variant="primary"
            onClick={handleSave}
            loading={isLoading}
          >
            Publicar
          </ComponetButton>
        </div>
      </div>
    </div>
  );
};

export default PublicationModal;
