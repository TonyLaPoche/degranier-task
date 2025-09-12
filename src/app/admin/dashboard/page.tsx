"use client"

import { useAuth } from "@/hooks/useAuth.tsx"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, CheckSquare, Clock, AlertCircle, Plus, Calendar, User, Search, Filter, X, Trash2, Edit } from "lucide-react"
import CreateTaskForm from "@/components/create-task-form"
import TaskDetails from "@/components/task-details"
import ClientManagement from "@/components/client-management"
import SocialMediaManager from "@/components/social-media-manager"
import ContactHoursManager from "@/components/contact-hours-manager"

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

interface Client {
  id: string
  name: string | null
  email: string
  role: string
  category?: {
    id: string
    name: string
    color: string
  } | null
  projectCount: number
  createdAt: Date
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
  clients: Array<{
    user: {
      id: string
      name: string | null
      email: string
    }
  }>
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

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])

  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [showFilters, setShowFilters] = useState(false)

  // États pour les statistiques
  const [stats, setStats] = useState({
    totalClients: 0,
    newClientsThisMonth: 0,
    activeProjects: 0,
    overdueProjects: 0,
    completedProjects: 0,
    completedThisQuarter: 0,
    urgentProjects: 0,
    urgentToHandle: 0,
  })

  useEffect(() => {
    if (loading) return

    if (!user || user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchTasks()
    fetchClients()
  }, [user, loading, router]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fonction pour calculer les statistiques
  const calculateStats = (tasksData: Task[], clientsData: Client[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)

    // Statistiques clients
    const totalClients = clientsData.length
    const newClientsThisMonth = clientsData.filter(client =>
      new Date(client.createdAt) >= startOfMonth
    ).length

    // Statistiques projets
    const activeProjects = tasksData.filter(task => task.status === "IN_PROGRESS").length
    const overdueProjects = tasksData.filter(task =>
      task.status !== "COMPLETED" &&
      task.dueDate &&
      new Date(task.dueDate) < now
    ).length
    const completedProjects = tasksData.filter(task => task.status === "COMPLETED").length
    const completedThisQuarter = tasksData.filter(task =>
      task.status === "COMPLETED" &&
      new Date(task.createdAt) >= startOfQuarter
    ).length
    const urgentProjects = tasksData.filter(task => task.priority === "URGENT").length
    const urgentToHandle = tasksData.filter(task =>
      task.priority === "URGENT" &&
      task.status !== "COMPLETED"
    ).length

    setStats({
      totalClients,
      newClientsThisMonth,
      activeProjects,
      overdueProjects,
      completedProjects,
      completedThisQuarter,
      urgentProjects,
      urgentToHandle,
    })
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/firebase/users")
      if (response.ok) {
        const allUsers = await response.json()
        // Filtrer seulement les clients
        const clientUsers = allUsers.filter((user: any) => user.role === 'CLIENT')
        setClients(clientUsers)
        // Calculer les stats si on a déjà les tâches
        if (!isLoadingTasks && tasks.length >= 0) {
          calculateStats(tasks, clientUsers)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/firebase/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        // Calculer les stats si on a déjà les clients
        if (clients.length >= 0) {
          calculateStats(data, clients)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Fonction pour rafraîchir les données après une opération
  const refreshData = async () => {
    await Promise.all([fetchTasks(), fetchClients()])
  }

  // Fonction de filtrage et tri des tâches
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks]

    // Recherche par titre ou nom de client
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filteredTasks = filteredTasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(searchLower)
        const clientMatch = task.clientIds?.some(clientId => {
          const client = clients.find(c => c.id === clientId)
          return client && (
            client.name?.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower)
          )
        }) || false
        return titleMatch || clientMatch
      })
    }

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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "due_date":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filteredTasks
  }

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setSortBy("recent")
  }

  // Fonction pour supprimer une tâche
  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${taskTitle}" ?\n\nCette action est irréversible.`)) {
      return
    }

    try {
      const response = await fetch(`/api/firebase/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Actualiser les données après suppression
        await Promise.all([fetchTasks(), fetchClients()])
      } else {
        alert("Erreur lors de la suppression du projet")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      alert("Erreur lors de la suppression du projet")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.newClientsThisMonth > 0 ? `+${stats.newClientsThisMonth} ce mois` : 'Aucun nouveau ce mois'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueProjects > 0 ? `${stats.overdueProjects} en retard` : 'Aucun en retard'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Terminés</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedThisQuarter} ce trimestre
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Urgents</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.urgentProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.urgentToHandle} à traiter
                </p>
              </CardContent>
            </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tasks">Gestion des Tâches</TabsTrigger>
            <TabsTrigger value="clients">Gestion des Clients</TabsTrigger>
            <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
            <TabsTrigger value="contact">Horaires de Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {selectedTask ? (
              <TaskDetails
                task={selectedTask}
                clients={clients}
                onUpdate={refreshData}
                onClose={() => setSelectedTask(null)}
              />
            ) : showCreateForm ? (
              <CreateTaskForm
                onSuccess={() => {
                  setShowCreateForm(false)
                  refreshData()
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Projets</CardTitle>
                  <CardDescription>
                    Créez, modifiez et suivez l&apos;avancement de vos projets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Gestion des Projets</h3>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Projet
                      </Button>
                    </div>


                    {/* Barre de recherche et filtres */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Barre de recherche */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher par titre ou client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
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

                      {/* Filtres étendus */}
                      {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
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
                      )}

                      {/* Compteurs de résultats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {getFilteredAndSortedTasks().length} projet{getFilteredAndSortedTasks().length > 1 ? 's' : ''} trouvé{getFilteredAndSortedTasks().length > 1 ? 's' : ''}
                          {tasks.length !== getFilteredAndSortedTasks().length && (
                            <span className="text-muted-foreground"> (sur {tasks.length} au total)</span>
                          )}
                        </span>
                        {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || sortBy !== "recent") && (
                          <Button variant="link" onClick={resetFilters} className="p-0 h-auto text-sm">
                            Effacer tous les filtres
                          </Button>
                        )}
                      </div>
                    </div>

                    {isLoadingTasks ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Chargement des projets...</span>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Aucun projet trouvé</p>
                        <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Créer votre premier projet
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getFilteredAndSortedTasks().map((task) => (
                          <div
                            key={task.id}
                            className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{task.title}</h4>
                                  <Badge
                                    variant={
                                      task.status === "TODO" ? "outline" :
                                      task.status === "IN_PROGRESS" ? "secondary" :
                                      task.status === "REVIEW" ? "default" :
                                      "default"
                                    }
                                  >
                                    {task.status === "TODO" ? "À faire" :
                                     task.status === "IN_PROGRESS" ? "En cours" :
                                     task.status === "REVIEW" ? "En révision" :
                                     "Terminée"}
                                  </Badge>
                                  <Badge
                                    variant={
                                      task.priority === "LOW" ? "outline" :
                                      task.priority === "MEDIUM" ? "secondary" :
                                      task.priority === "HIGH" ? "destructive" :
                                      "destructive"
                                    }
                                  >
                                    {task.priority === "LOW" ? "Basse" :
                                     task.priority === "MEDIUM" ? "Moyenne" :
                                     task.priority === "HIGH" ? "Haute" :
                                     "Urgente"}
                                  </Badge>
                                </div>

                                {task.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>{task.clientIds?.length || 0} client{(task.clientIds?.length || 0) > 1 ? 's' : ''}</span>
                                  </div>
                                  <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>

                                {(task.clientIds?.length || 0) > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.clientIds.map((clientId) => {
                                      const client = clients.find(c => c.id === clientId)
                                      return (
                                        <Badge key={clientId} variant="outline" className="text-xs">
                                          {client ? (client.name || client.email) : 'Client inconnu'}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                )}

                                {task.history?.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <h5 className="text-sm font-medium mb-2">Historique récent</h5>
                                    <div className="space-y-1">
                                      {task.history?.slice(0, 3).map((entry) => (
                                        <div key={entry.id} className="text-xs text-muted-foreground">
                                          <span className="font-medium">
                                            {entry.changedBy.name || entry.changedBy.email}
                                          </span>
                                          {" "}
                                          {entry.field === "created" ? "a créé la tâche" :
                                           entry.field === "title" ? "a modifié le titre" :
                                           entry.field === "description" ? "a modifié la description" :
                                           entry.field === "status" ? `a changé le statut à ${entry.newValue}` :
                                           entry.field === "priority" ? `a changé la priorité à ${entry.newValue}` :
                                           "a fait une modification"}
                                          {" "}
                                          <span className="text-xs">
                                            {new Date(entry.createdAt).toLocaleString('fr-FR')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Boutons d'actions */}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedTask(task)
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Modifier
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteTask(task.id, task.title)
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      </div>
                    )}
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialMediaManager />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactHoursManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
