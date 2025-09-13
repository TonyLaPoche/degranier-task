import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  clientIds: string[]
  checklists?: { id: string; title: string; isCompleted: boolean; order: number }[]
  history?: { id: string; action: string; timestamp: string; userId: string }[]
}

interface TaskFiltersSectionProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  priorityFilter: string
  setPriorityFilter: (priority: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  resetFilters: () => void
  getFilteredAndSortedTasks: () => Task[]
}

export default function TaskFiltersSection({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  resetFilters,
  getFilteredAndSortedTasks
}: TaskFiltersSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par titre ou nom de client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtre par statut */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="TODO">À faire</SelectItem>
            <SelectItem value="IN_PROGRESS">En cours</SelectItem>
            <SelectItem value="REVIEW">En révision</SelectItem>
            <SelectItem value="COMPLETED">Terminé</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtre par priorité */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les priorités" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les priorités</SelectItem>
            <SelectItem value="LOW">Basse</SelectItem>
            <SelectItem value="MEDIUM">Moyenne</SelectItem>
            <SelectItem value="HIGH">Haute</SelectItem>
            <SelectItem value="URGENT">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Tri */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récent</SelectItem>
            <SelectItem value="oldest">Plus ancien</SelectItem>
            <SelectItem value="due_date">Échéance</SelectItem>
            <SelectItem value="title">Titre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bouton de réinitialisation et compteur */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {getFilteredAndSortedTasks().length} projet{getFilteredAndSortedTasks().length > 1 ? 's' : ''} trouvé{getFilteredAndSortedTasks().length > 1 ? 's' : ''}
        </div>
        {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || sortBy !== "recent") && (
          <Button variant="link" onClick={resetFilters} className="p-0 h-auto text-sm">
            Effacer tous les filtres
          </Button>
        )}
      </div>
    </div>
  )
}
