import React, { useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import { Upload } from "lucide-react";

interface DynamicImportModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: T[]) => void;
  title?: string;
  accept?: string;
  parseFile: (text: string, fileType: string, csvType?: string) => T[];
}

const DynamicImportModal = <T,>({
  isOpen,
  onClose,
  onImport,
  title = "Importar dados",
  accept = ".csv,.xml,.xlsx",
  parseFile,
}: DynamicImportModalProps<T>) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [csvType, setCsvType] = useState<string>("utf-8");

  const csvOptions = [
    { value: "utf-8", label: "CSV UTF-8 (delimitado por vírgulas)" },
    { value: "comma", label: "CSV (separado por vírgula)" },
    { value: "macintosh", label: "CSV (Macintosh)" },
    { value: "ms-dos", label: "CSV (MS-DOS)" },
  ];

  const hasCsvFile = files.some((file) => file.name.endsWith(".csv"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) =>
      accept.split(",").some((ext) => file.name.endsWith(ext))
    );

    if (validFiles.length !== selectedFiles.length) {
      setError(
        `Apenas arquivos ${accept
          .replace(/\./g, "")
          .toUpperCase()} são permitidos.`
      );
    } else {
      setError("");
    }
    setFiles(validFiles);
  };

  const handleCsvTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCsvType(e.target.value);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Nenhum arquivo selecionado.");
      return;
    }

    const allImportedData: T[] = [];

    for (const file of files) {
      try {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const importedData = parseFile(
          text,
          file.type,
          file.name.endsWith(".csv") ? csvType : undefined
        );
        allImportedData.push(...importedData);
      } catch (err) {
        setError(`Erro ao processar ${file.name}. Verifique o formato.`);
        return;
      }
    }

    if (allImportedData.length === 0) {
      setError("Nenhum dado válido encontrado nos arquivos.");
      return;
    }

    onImport(allImportedData);
    setFiles([]);
    setCsvType("utf-8");
  };

  return (
    <DynamicModal
      title={title}
      isOpen={isOpen}
      onClose={() => {
        setFiles([]);
        setError("");
        setCsvType("utf-8");
        onClose();
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecione arquivos ({accept.replace(/\./g, "").toUpperCase()})
          </label>
          <input
            type="file"
            accept={accept}
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {files.length} arquivo(s) selecionado(s)
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        {hasCsvFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de CSV
            </label>
            <select
              value={csvType}
              onChange={handleCsvTypeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              {csvOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          variant="secondary"
          onClick={() => {
            setFiles([]);
            setError("");
            setCsvType("utf-8");
            onClose();
          }}
          className="w-full md:w-auto"
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto flex items-center gap-2"
          disabled={files.length === 0}
        >
          <Upload size={16} /> Importar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default DynamicImportModal;
