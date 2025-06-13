import React, { useEffect, useState, ChangeEvent } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import ComponentInput from "@/components/common/FormInput";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FileText } from "lucide-react";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: (newDoc: {
    name: string;
    file: File;
    category: string;
    classDest: string;
    year: Date;
  }) => void;
}

// opções de exemplo
const categoryOptions = [
  { value: "Plano de Aula", label: "Plano de Aula" },
  { value: "Apostila", label: "Apostila" },
  { value: "Atividade", label: "Atividade" },
];
const classOptions = [
  { value: "10A", label: "10A" },
  { value: "10B", label: "10B" },
  { value: "11A", label: "11A" },
];

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onAddSuccess,
}) => {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [classDest, setClassDest] = useState("");
  const [year, setYear] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
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
      // tipo não suportado
      setIsPdf(false);
      setPreviewUrl(null);
      setErrors((err) => ({ ...err, file: "Formato não suportado" }));
    }
  };

  useEffect(() => {
    // cleanup do URL
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setFile(null);
      setCategory("");
      setClassDest("");
      setYear("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const errs: any = {};
    if (!name) errs.name = "Preencha o nome";
    if (!file) errs.file = "Envie um arquivo";
    if (!category) errs.category = "Selecione uma categoria";
    if (!classDest) errs.classDest = "Selecione uma turma";
    if (!year) errs.year = "Selecione o ano letivo";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onAddSuccess({
      name,
      file: file!,
      category,
      classDest,
      year: new Date(year),
    });
    onClose();
  };

  return (
    <DynamicModal title="Adicionar documento" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 overflow-y-auto max-h-[50vh] px-2">
        <ComponentInput
          label="Nome do Documento"
          name="name"
          type="text"
          placeholder="Digite o nome do documento"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name || ""}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Arquivo
          </label>
          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md 
      ${!file ? "" : "border-none"}`}
          >
            {!file ? (
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path d="M" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer font-medium text-[#4D6BFE] hover:text-[#465dd1]"
                  >
                    <span>Selecione um arquivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">
                  Suporta PDF e imagens. Máx 900MB
                </p>
                {errors.file && (
                  <p className="text-xs text-red-500">{errors.file}</p>
                )}
              </div>
            ) : isPdf ? (
              <div className="flex flex-col items-center">
                <FileText size={48} className="text-red-500 mb-2" />
                <p className="text-sm">{file.name}</p>
              </div>
            ) : (
              <img
                src={previewUrl!}
                alt="Prévia do arquivo"
                className="max-h-40 object-contain"
              />
            )}
          </div>
        </div>

        <SearchableSelect
          label="Categoria"
          value={category}
          onChange={(val) => setCategory(val)}
          options={categoryOptions}
          error={errors.category}
        />

        <SearchableSelect
          label="Turma Destinada"
          value={classDest}
          onChange={(val) => setClassDest(val)}
          options={classOptions}
          error={errors.classDest}
        />
        <ComponentInput
          label="Ano Letivo"
          name="date"
          type="date"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={errors.year || ""}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4 px-2">
        <ComponetButton variant="secondary" onClick={onClose}>
          Cancelar
        </ComponetButton>
        <ComponetButton variant="primary" onClick={handleSubmit}>
          Adicionar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};
