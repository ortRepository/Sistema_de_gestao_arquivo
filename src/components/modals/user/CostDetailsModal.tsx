import { X, Info } from "lucide-react";
import DynamicModal from "@/components/common/DynamicModal";
import { BudgetCost, CostHistory, CostComment } from "@/types/interfaces";
import ComponetButton from "@/components/common/button";

interface CostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cost: BudgetCost;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

export function CostDetailsModal({
  isOpen,
  onClose,
  cost,
  formatCurrency,
  formatDate,
}: CostDetailsModalProps) {
  return (
    <DynamicModal 
      title="Detalhes do Custo" 
      isOpen={isOpen} 
      onClose={onClose}

    >
      <div className="space-y-8 p-6 overflow-y-auto max-h-[60vh] bg-gray-50 dark:bg-gray-900 rounded-lg transition-all duration-300">
        {/* Cost Details */}
        <div className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" /> Informações Gerais
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Valor</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{formatCurrency(cost.value)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Justificação</p>
              <p className="text-base text-gray-700 dark:text-gray-200">{cost.justification || "Nenhuma"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Conta</p>
              <p className="text-base text-gray-700 dark:text-gray-200">
                {cost.accountName || "N/A"} <span className="text-gray-500">({cost.accountDescription || "Sem descrição"})</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Centro de Custo</p>
              <p className="text-base text-gray-700 dark:text-gray-200">
                {cost.costCenterName || "N/A"} <span className="text-gray-500">({cost.costCenterDescription || "Sem descrição"})</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Criado em</p>
              <p className="text-base text-gray-700 dark:text-gray-200">{formatDate(cost.createdIn)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Atualizado em</p>
              <p className="text-base text-gray-700 dark:text-gray-200">{formatDate(cost.updatedIn)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Status de Aprovação</p>
              <p className={`text-base font-medium ${cost.approval ? 'text-green-600' : 'text-red-600'}`}>
                {cost.approval ? "Aprovado" : "Não Aprovado"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Alerta</p>
              <p className="text-base text-gray-700 dark:text-gray-200">{cost.alert || "Nenhum"}</p>
            </div>
          </div>
        </div>

        {/* Cost History */}
        <div className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" /> Histórico
          </h4>
          {cost.histories.length > 0 ? (
            <div className="overflow-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="py-3 px-6 font-semibold">ID Histórico</th>
                    <th className="py-3 px-6 font-semibold">Descrição</th>
                    <th className="py-3 px-6 font-semibold">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {cost.histories.map((history: CostHistory) => (
                    <tr
                      key={history.idCostHistories}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="py-3 px-6 text-gray-700 dark:text-gray-200">#{history.idCostHistories}</td>
                      <td className="py-3 px-6 text-gray-700 dark:text-gray-200">{history.description}</td>
                      <td className="py-3 px-6 text-gray-700 dark:text-gray-200">{formatDate(history.createdIn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum histórico encontrado.</p>
          )}
        </div>

        {/* Cost Comments */}
        <div className="space-y-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" /> Comentários
          </h4>
          {cost.comments.length > 0 ? (
            <div className="space-y-4">
              {cost.comments.map((comment: CostComment) => (
                <div
                  key={comment.idCommentsCost}
                  className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-150 hover:shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {comment.currentEntityName} • {formatDate(comment.receivedIn)}
                    </p>
                    <p className={`text-sm font-medium ${comment.approval ? 'text-green-600' : 'text-red-600'}`}>
                      {comment.approval ? 'Aprovado' : 'Não Aprovado'}
                    </p>
                  </div>
                  <p className="text-base text-gray-700 dark:text-gray-200">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum comentário encontrado.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 px-6 pb-4">
        <ComponetButton
          variant="secondary"
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
}