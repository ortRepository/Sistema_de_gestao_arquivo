import React, { useState, useEffect } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { Timeline } from "@/types/interfaces";
import { z } from "zod";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useCreateTimeline, useUpdateTimeline } from "@/hooks/DynamicApiHooks";
import { timelineSchema } from "@/types/type";

type TimelineForm = z.infer<typeof timelineSchema>;

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: Timeline | null;
  onSave: (timeline: Timeline) => void;
}

const ScheduleModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  timeline,
}) => {
  const [form, setForm] = useState<TimelineForm>({
    idTimeline: undefined,
    yearOfApplication: "",
    mapCreationDate: "",
    mapCompletionDate: "",
    mapCostAdditionDate: "",
    completionDateAdditionOfMapCost: "",
    mapCorrectionStartDate: "",
    endDateOfMapCorrection: "",
    mapExecutionStartDate: "",
    mapExecutionEndDate: "",
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TimelineForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Hooks for API mutations
  const { mutateAsync: createTimeline } = useCreateTimeline();
  const { mutateAsync: updateTimeline } = useUpdateTimeline();

  useEffect(() => {
    if (timeline) {
      setForm({
        idTimeline: timeline.idTimeline,
        yearOfApplication: timeline.yearOfApplication?.split("T")[0] ?? "",
        mapCreationDate: timeline.mapCreationDate?.split("T")[0] ?? "",
        mapCompletionDate: timeline.mapCompletionDate?.split("T")[0] ?? "",
        mapCostAdditionDate: timeline.mapCostAdditionDate?.split("T")[0] ?? "",
        completionDateAdditionOfMapCost:
          timeline.completionDateAdditionOfMapCost?.split("T")[0] ?? "",
        mapCorrectionStartDate:
          timeline.mapCorrectionStartDate?.split("T")[0] ?? "",
        endDateOfMapCorrection:
          timeline.endDateOfMapCorrection?.split("T")[0] ?? "",
        mapExecutionStartDate:
          timeline.mapExecutionStartDate?.split("T")[0] ?? "",
        mapExecutionEndDate: timeline.mapExecutionEndDate?.split("T")[0] ?? "",
      });
    } else {
      setForm({
        idTimeline: undefined,
        yearOfApplication: "",
        mapCreationDate: "",
        mapCompletionDate: "",
        mapCostAdditionDate: "",
        completionDateAdditionOfMapCost: "",
        mapCorrectionStartDate: "",
        endDateOfMapCorrection: "",
        mapExecutionStartDate: "",
        mapExecutionEndDate: "",
      });
    }
    setFieldErrors({});
    setStatusMessage(null);
  }, [timeline, isOpen]);

  const handleClose = () => {
    setForm({
      idTimeline: undefined,
      yearOfApplication: "",
      mapCreationDate: "",
      mapCompletionDate: "",
      mapCostAdditionDate: "",
      completionDateAdditionOfMapCost: "",
      mapCorrectionStartDate: "",
      endDateOfMapCorrection: "",
      mapExecutionStartDate: "",
      mapExecutionEndDate: "",
    });
    setStatusMessage(null);
    setIsLoading(false);
    setFieldErrors({});
    onClose();
  };

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    // Validate with Zod
    const result = timelineSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors;
      setFieldErrors(errors as Partial<Record<keyof TimelineForm, string>>);
      return;
    }

    // Convert dates to ISO date-time format
    const formattedForm = {
      ...form,
      yearOfApplication: `${form.yearOfApplication}T00:00:00.000Z`,
      mapCreationDate: `${form.mapCreationDate}T00:00:00.000Z`,
      mapCompletionDate: `${form.mapCompletionDate}T00:00:00.000Z`,
      mapCostAdditionDate: `${form.mapCostAdditionDate}T00:00:00.000Z`,
      completionDateAdditionOfMapCost: `${form.completionDateAdditionOfMapCost}T00:00:00.000Z`,
      mapCorrectionStartDate: `${form.mapCorrectionStartDate}T00:00:00.000Z`,
      endDateOfMapCorrection: `${form.endDateOfMapCorrection}T00:00:00.000Z`,
      mapExecutionStartDate: `${form.mapExecutionStartDate}T00:00:00.000Z`,
      mapExecutionEndDate: `${form.mapExecutionEndDate}T00:00:00.000Z`,
    };

    setIsLoading(true);
    try {
      let response: any;
      if (form.idTimeline) {
        response = await updateTimeline({
          idTimeline: form.idTimeline,
          yearOfApplication: formattedForm.yearOfApplication,
          mapCreationDate: formattedForm.mapCreationDate,
          mapCompletionDate: formattedForm.mapCompletionDate,
          mapCostAdditionDate: formattedForm.mapCostAdditionDate,
          completionDateAdditionOfMapCost:
            formattedForm.completionDateAdditionOfMapCost,
          mapCorrectionStartDate: formattedForm.mapCorrectionStartDate,
          endDateOfMapCorrection: formattedForm.endDateOfMapCorrection,
          mapExecutionStartDate: formattedForm.mapExecutionStartDate,
          mapExecutionEndDate: formattedForm.mapExecutionEndDate,
        });

        if (response.message === "Timeline updated successfully") {
          setStatusMessage({
            text: "Cronograma atualizado com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(onClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao actualizar Cronograma. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      } else {
        // Create new timeline
        response = await createTimeline(formattedForm);
        console.log(response);
        if (response.message === "Timeline saved successfully") {
          setStatusMessage({
            text: "Cronograma cadastrado com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao salvar Cronograma. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      setStatusMessage({
        text: "Erro desconhecido. Tente novamente mais tarde.",
        type: "error",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={timeline ? "Editar cronograma" : "Cadastrar cronograma"}
      isOpen={isOpen}
      onClose={timeline ? onClose : handleClose}
    >
      {statusMessage && (
        <div
          className={`${
            statusMessage.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          } border-t-4 mb-4 p-4 rounded-lg shadow-md`}
        >
          <p
            className={`${
              statusMessage.type === "success"
                ? "text-green-700"
                : "text-red-700"
            } text-sm flex items-center gap-2`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {statusMessage.text}
          </p>
        </div>
      )}
      <div className="space-y-4 overflow-y-auto max-h-[55vh]">
        <ComponentInput
          label="Ano de Aplicação"
          name="yearOfApplication"
          type="date"
          placeholder="Selecione o ano de aplicação"
          value={form.yearOfApplication}
          onChange={handleChange}
          error={fieldErrors.yearOfApplication}
          required
        />
        <ComponentInput
          label="Data de Criação"
          name="mapCreationDate"
          type="date"
          value={form.mapCreationDate}
          onChange={handleChange}
          error={fieldErrors.mapCreationDate}
          required
        />
        <ComponentInput
          label="Data de Conclusão"
          name="mapCompletionDate"
          type="date"
          value={form.mapCompletionDate}
          onChange={handleChange}
          error={fieldErrors.mapCompletionDate}
          required
        />
        <ComponentInput
          label="Data de Adição de Custos"
          name="mapCostAdditionDate"
          type="date"
          value={form.mapCostAdditionDate}
          onChange={handleChange}
          error={fieldErrors.mapCostAdditionDate}
          required
        />
        <ComponentInput
          label="Data de Conclusão de Adição de Custos"
          name="completionDateAdditionOfMapCost"
          type="date"
          value={form.completionDateAdditionOfMapCost}
          onChange={handleChange}
          error={fieldErrors.completionDateAdditionOfMapCost}
          required
        />
        <ComponentInput
          label="Data de Início de Correção"
          name="mapCorrectionStartDate"
          type="date"
          value={form.mapCorrectionStartDate}
          onChange={handleChange}
          error={fieldErrors.mapCorrectionStartDate}
          required
        />
        <ComponentInput
          label="Data de Fim de Correção"
          name="endDateOfMapCorrection"
          type="date"
          value={form.endDateOfMapCorrection}
          onChange={handleChange}
          error={fieldErrors.endDateOfMapCorrection}
          required
        />
        <ComponentInput
          label="Data de Início de Execução"
          name="mapExecutionStartDate"
          type="date"
          value={form.mapExecutionStartDate}
          onChange={handleChange}
          error={fieldErrors.mapExecutionStartDate}
          required
        />
        <ComponentInput
          label="Data de Fim de Execução"
          name="mapExecutionEndDate"
          type="date"
          value={form.mapExecutionEndDate}
          onChange={handleChange}
          error={fieldErrors.mapExecutionEndDate}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          variant="secondary"
          onClick={timeline ? onClose : handleClose}
          className="w-full md:w-auto"
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {timeline ? "Salvar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ScheduleModal;
