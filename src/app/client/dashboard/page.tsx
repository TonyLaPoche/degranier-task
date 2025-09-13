"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckSquare, Clock, AlertCircle, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ClientProjectCard from "@/components/client-project-card"
import ClientContactInfo from "@/components/client-contact-info"

interface TaskComment {
  id: string
  content: string
  isFromClient: boolean
  createdAt: Date
  author: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  allowComments?: boolean
  createdAt: Date
  updatedAt: Date
  history: Array<{
    id: string
    field: string
    oldValue: string | null
    newValue: string | null
    createdAt: Date
    changedBy: {
      id: string
      name: string | null
      email: string
    }
  }>
  comments: TaskComment[]
}

export default function ClientDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user || user.role !== "CLIENT") {
      router.push("/auth/signin")
      return
    }

    fetchTasks()
  }, [user, loading, router])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/firebase/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const handleCommentAdded = () => {
    fetchTasks() // Rafraîchir les tâches pour voir le nouveau commentaire
  }

  // Fonction de filtrage et tri des tâches
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks]

    // Filtre par statut
    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter)
    }

    // Filtre par priorité
    if (priorityFilter !== "all") {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter)
    }

    // Tri des tâches
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case "due_date":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "status":
          return a.status.localeCompare(b.status)
        case "priority":
          const priorityOrder = { "URGENT": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 }
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        default:
          return 0
      }
    })

    return filteredTasks
  }

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setSortBy("recent")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== "CLIENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mes Projets</h1>
              <p className="text-muted-foreground">Bienvenue, {user.displayName || user.email}</p>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter(t => t.status !== 'COMPLETED').length}</div>
              <p className="text-xs text-muted-foreground">En cours de réalisation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Terminés</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'COMPLETED').length}</div>
              <p className="text-xs text-muted-foreground">Ce trimestre</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Urgents</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.filter(t => t.priority === 'URGENT').length}</div>
              <p className="text-xs text-muted-foreground">À traiter en priorité</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Mes Projets
                    <Badge variant="secondary" className="ml-2">
                      {getFilteredAndSortedTasks().length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Suivez l&apos;avancement de vos collaborations avec Aurore De Granier
                  </CardDescription>
                </div>

                {/* Bouton pour afficher/masquer les filtres */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {(statusFilter !== "all" || priorityFilter !== "all" || sortBy !== "recent") && (
                    <Badge variant="secondary" className="ml-1">
                      {(statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0) + (sortBy !== "recent" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Barre de filtres */}
              {showFilters && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtre par statut */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Statut</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
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
                    </div>

                    {/* Filtre par priorité */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priorité</label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
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
                    </div>

                    {/* Tri */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trier par</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Plus récent</SelectItem>
                          <SelectItem value="oldest">Plus ancien</SelectItem>
                          <SelectItem value="due_date">Échéance</SelectItem>
                          <SelectItem value="title">Titre (A-Z)</SelectItem>
                          <SelectItem value="status">Statut</SelectItem>
                          <SelectItem value="priority">Priorité</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bouton de réinitialisation */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="w-full"
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {isLoadingTasks ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Chargement de vos projets...</span>
                  </div>
                ) : getFilteredAndSortedTasks().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {tasks.length === 0 ? "Aucun projet assigné" : "Aucun projet trouvé"}
                      </h3>
                      <p className="text-muted-foreground">
                        {tasks.length === 0
                          ? "Vous n'avez pas encore de projet assigné. Aurore vous contactera bientôt !"
                          : "Aucun projet ne correspond à vos critères de filtrage."
                        }
                      </p>
                      {tasks.length > 0 && (
                        <Button variant="outline" onClick={resetFilters} className="mt-4">
                          Voir tous les projets
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredAndSortedTasks().map((task) => (
                      <ClientProjectCard
                        key={task.id}
                        task={task}
                        onCommentAdded={handleCommentAdded}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <ClientContactInfo />
        </div>
      </main>
    </div>
  )
}
