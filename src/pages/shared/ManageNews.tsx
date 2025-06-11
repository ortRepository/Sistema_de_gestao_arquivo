import React, { useState } from "react";
import { Heart, EllipsisVertical } from "lucide-react";
import CommentsSection from "@/components/users/regularUser/CommentsSection";
import SearchFilterBar from "@/components/common/SearchBar";
import ShowSubmenu from "@/components/common/ModalOption";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import PublicationModal from "@/components/common/PublicationModal";
import ComponetButton from "@/components/common/button";
import DashboardMenu from "@/components/ui/DashboardMenu";
import TabMenu from "@/components/common/TabMenu";
import { useGetNews } from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
type NewsType = "All" | "Titulo" | "Descrição" | "Nº de reações";

interface CommentData {
  description: string;
  id_news: number;
  created_in: string;
  id_user: number;
  name: string;
  id_comment: number;
}

interface NewsItemData {
  id_news: number;
  title: string;
  description: string;
  photo: string;
  created_in: string;
  commentable: boolean;
  id_institution: number;
  reactions: Array<{
    id_reaction: number;
    id_user: number;
    created_in: string;
    id_news: number;
  }>;
  comments: CommentData[]; // Comentários associados
}

interface FilterOption {
  value: NewsType;
  label: string;
}
// Componente para renderizar cada item de notícia (publicação)
const NewsItem: React.FC<{ item: NewsItemData }> = ({ item }) => {
  // Controle dos modais
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSave = (_data: {
    title: string;
    id_news?: number;
    description: string;
    id_institution: number;
    file: File | null;
    commentable?: boolean;
  }) => {};

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const handleOpenDeleteModal = () => {
    setIsOpenModal(false);
    setIsDeleteModalOpen(true);
  };

  const handleOpenEditModal = () => {
    setIsOpenModal(false);
    setIsEditModalOpen(true);
  };

  const handleComment = () => {};

  return (
    <div className="bg-white relative dark:bg-gray-900 dark:border-gray-900 border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      {/* Modal de Edição */}
      <PublicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        onSave={handleSave}
        initialData={{
          id_news: item.id_news,
          title: item.title,
          description: item.description,
          id_institution: item.id_institution,
          commentable: item.commentable,
          file: null,
        }}
      />

      {/* Modal de Exclusão */}
      <DeletePublicationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Publicação"
        message="Tem certeza que deseja excluir esta publicação? Essa ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Submenu de Opções */}
      <ShowSubmenu
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onDelet={handleOpenDeleteModal}
        onEdite={handleOpenEditModal}
        onComment={handleComment}
      />

      {/* Ícone de três pontinhos */}
      <div className="relative">
        <EllipsisVertical
          onClick={() => setIsOpenModal(!isOpenModal)}
          className="text-gray-500 p-1 rounded-full bg-gray-300 hover:bg-[#FF9E01] absolute right-3 top-4 w-8 h-8 cursor-pointer hover:text-white"
        />
        {/* Imagem de destaque */}
        <img
          src={item.photo}
          alt={item.title}
          className="w-full h-auto md:h-96 object-cover rounded mb-4"
        />
      </div>

      {/* Título */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
        {item.title}
      </h2>

      {/* Localização e data/hora */}
      <div className="text-sm text-gray-500 mb-4">
        <span>{item.created_in}</span>
      </div>

      {/* Conteúdo */}
      <p className="text-gray-600 mb-4 dark:text-white">{item.description}</p>

      {/* Curtidas (visualização) */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1">
          <Heart className="w-5 h-5 text-[#FF9E01] fill-current" />
          <span>{item.reactions.length} curtidas</span>
        </div>
      </div>

      {/* Comentários (visualização) */}
      <CommentsSection disableInput={true} />
    </div>
  );
};

// Componente principal com menu de "Estatísticas Gerais" e "Publicações"
const ManageNews: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetNews();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<NewsType>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Estado para alternar entre as visualizações
  const [selectedTab, setSelectedTab] = useState<
    "publicacoes" | "estatisticas"
  >("publicacoes");

  const handleCreate = (_data: {
    title: string;
    description: string;
    file: File | null;
    commentable?: boolean;
    imageFile?: string | null;
  }) => {
    setIsCreateModalOpen(false);
  };

  const filterOptions: FilterOption[] = [
    { value: "All", label: "Todos" },
    { value: "Titulo", label: "Titulo" },
    { value: "Descrição", label: "Descrição" },
  ];

  const toggleFilterDropdown = () => setIsFilterOpen(!isFilterOpen);
  const closeFilterDropdown = () => setIsFilterOpen(false);

  const filteredNews =
    data?.result.filter((item: NewsItemData) => {
      // Se não houver termo de busca, exibe todos
      if (!searchTerm.trim()) return true;

      if (filterType === "Titulo") {
        return item.title.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (filterType === "Descrição") {
        return item.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      } else if (filterType === "Nº de reações") {
        // Converte o termo para número e filtra se o tamanho das reações for igual
        const num = Number(searchTerm);
        return item.reactions.length === num;
      } else {
        // Quando "All": pesquisa em título e descrição
        return (
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }) || [];

  return (
    <div className="p-6 w-full dark:bg-gray-800">
      {/* Cabeçalho com título e menu de opções */}
      <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      {/* Se a aba selecionada for "estatisticas", exibe o dashboard */}
      {selectedTab === "estatisticas" ? (
        <DashboardMenu publications={filteredNews} />
      ) : (
        <>
          {/* Barra de pesquisa e filtro */}
          <SearchFilterBar
            title=""
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterOptions={filterOptions}
            isFilterOpen={isFilterOpen}
            toggleFilterDropdown={toggleFilterDropdown}
            closeFilterDropdown={closeFilterDropdown}
          />
          <DataStatusHandler
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
          >
            <div className="flex justify-end mb-6 mr-3">
              <ComponetButton
                variant="primary"
                className="md:w-auto w-full"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Publicar
              </ComponetButton>
            </div>

            {/* Modal de Criação */}
            <PublicationModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              mode="create"
              onSave={handleCreate}
              initialData={{
                title: "",
                id_news: 0,
                description: "",
                id_institution: 0,
                file: null,
                commentable: false,
              }}
            />

            {/* Lista de notícias */}

            <div className="overflow-y-auto h-[66vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {filteredNews.length > 0
                  ? filteredNews.map((item) => (
                      <NewsItem key={item.id_news} item={item} />
                    ))
                  : null}
              </div>
              {filteredNews.length === 0 && (
                <p className="text-gray-500 flex justify-center items-center w-full text-center dark:text-white">
                  Nenhuma notícia encontrada.
                </p>
              )}
            </div>
          </DataStatusHandler>
        </>
      )}
    </div>
  );
};

export default ManageNews;
