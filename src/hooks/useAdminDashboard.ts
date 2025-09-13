import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface ChecklistItem {
  id: string
  title: string
  isCompleted: boolean
  completed?: boolean  // Support des deux formats
  order: number
  taskId?: string
  createdAt: string | Date
  updatedAt: string | Date
}

interface HistoryItem {
  id: string
  action: string
  field?: string
  oldValue?: string | null
  newValue?: string | null
  timestamp: string
  userId: string
  createdAt?: string
}

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
  checklists?: ChecklistItem[]
  checklistItems?: ChecklistItem[]  // Ajouter support pour checklistItems aussi
  history?: HistoryItem[]
}

// Transformed task type for TaskDetails component
interface TransformedTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  clients: { user: { id: string; name: string | null; email: string } }[]
  history: { id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: Date; changedBy: { id: string; name: string | null; email: string } }[]
  comments: { id: string; content: string; isFromClient: boolean; createdAt: Date; author: { id: string; name: string | null; email: string; role: string } }[]
  checklists?: { id: string; title: string; isCompleted: boolean; order: number; createdAt: Date; updatedAt: Date }[]
  allowComments?: boolean
}

interface Client {
  id: string
  name?: string
  email: string
  role: string
  createdAt?: string
}

interface DashboardStats {
  totalClients: number
  newClientsThisMonth: number
  activeProjects: number
  overdueProjects: number
  completedProjects: number
  completedThisQuarter: number
  urgentProjects: number
  urgentToHandle: number
}

export function useAdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // États
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedTask, setSelectedTask] = useState<TransformedTask | null>(null)

  // Helper function to transform task for TaskDetails component
  const transformTaskForDetails = (task: Task): TransformedTask => {
    const taskClients = task.clientIds?.map(clientId => {
      const client = clients.find(c => c.id === clientId)
      return client ? { user: { id: client.id, name: client.name || null, email: client.email } } : null
    }).filter((client): client is NonNullable<typeof client> => client !== null) || []

    return {
      id: task.id,
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      clients: taskClients,
      history: task.history ? task.history.map(entry => ({
        id: entry.id,
        field: entry.field || entry.action || 'unknown',
        oldValue: entry.oldValue || null,
        newValue: entry.newValue || null,
        createdAt: new Date(entry.createdAt || entry.timestamp),
        changedBy: (entry as any).changedBy || { id: entry.userId, name: null, email: 'unknown@example.com' } // eslint-disable-line @typescript-eslint/no-explicit-any
      })) : [],
      comments: [], // Add empty comments array for now
      checklists: (task.checklists || task.checklistItems) ? (task.checklists || task.checklistItems || []).map(checklist => ({
        id: checklist.id,
        title: checklist.title,
        isCompleted: checklist.isCompleted || checklist.completed || false,  // Support des deux formats
        order: checklist.order,
        createdAt: checklist.createdAt instanceof Date ? checklist.createdAt : 
                  (typeof checklist.createdAt === 'string' ? new Date(checklist.createdAt) : 
                  (checklist.createdAt && typeof checklist.createdAt === 'object' && (checklist.createdAt as any).seconds ? 
                   new Date((checklist.createdAt as any).seconds * 1000) : new Date())),
        updatedAt: checklist.updatedAt instanceof Date ? checklist.updatedAt : 
                  (typeof checklist.updatedAt === 'string' ? new Date(checklist.updatedAt) : 
                  (checklist.updatedAt && typeof checklist.updatedAt === 'object' && (checklist.updatedAt as any).seconds ? 
                   new Date((checklist.updatedAt as any).seconds * 1000) : new Date()))
      })) : [],
      allowComments: true // Default to true for now
    }
  }

  // Custom setter that transforms the task
  const setSelectedTaskTransformed = (task: Task | null) => {
    if (task) {
      setSelectedTask(transformTaskForDetails(task))
    } else {
      setSelectedTask(null)
    }
  }

  // Update selected task when clients data changes
  useEffect(() => {
    if (selectedTask && clients.length > 0) {
      // Find the original task data to transform it again
      const originalTask = tasks.find(t => t.id === selectedTask.id)
      if (originalTask && JSON.stringify(selectedTask.clients) !== JSON.stringify(transformTaskForDetails(originalTask).clients)) {
        setSelectedTask(transformTaskForDetails(originalTask))
      }
    }
  })  
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Stats calculées
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    newClientsThisMonth: 0,
    activeProjects: 0,
    overdueProjects: 0,
    completedProjects: 0,
    completedThisQuarter: 0,
    urgentProjects: 0,
    urgentToHandle: 0,
  })

  // Fonctions de récupération des données
  const fetchTasks = async () => {
    try {
      // Construire l'URL avec les paramètres utilisateur pour le filtrage
      const url = new URL("/api/firebase/tasks", window.location.origin)
      if (user?.role) {
        url.searchParams.set('role', user.role)
      }
      if (user?.uid) {
        url.searchParams.set('userId', user.uid)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        return data
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/firebase/users")
      if (response.ok) {
        const allUsers = await response.json()
        const clientUsers = allUsers.filter((user: { role?: string }) => user.role === 'CLIENT')
        setClients(clientUsers)
        return clientUsers
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  // Fonction pour calculer les statistiques
  const calculateStats = (tasksData: Task[], clientsData: Client[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)

    // Statistiques clients
    const totalClients = clientsData.length
    const newClientsThisMonth = clientsData.filter(client =>
      new Date(client.createdAt || now) >= startOfMonth
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

  // Fonction de suppression de tâche
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

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setSortBy("recent")
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

  // Effet pour récupérer les données initiales
  useEffect(() => {
    if (authLoading) return

    if (!user || user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchTasks()
    fetchClients()
  }, [user, authLoading, router])

  // Effet pour calculer les stats quand les données changent
  useEffect(() => {
    if (tasks.length >= 0 && clients.length >= 0) {
      calculateStats(tasks, clients)
    }
  }, [tasks, clients])

  return {
    // États
    tasks,
    clients,
    isLoadingTasks,
    isLoadingClients,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    selectedTask: selectedTask as TransformedTask | null,
    setSelectedTask: setSelectedTaskTransformed,
    showCreateForm,
    setShowCreateForm,
    stats,

    // Fonctions
    fetchTasks,
    fetchClients,
    handleDeleteTask,
    resetFilters,
    refreshData,
    getFilteredAndSortedTasks,
  }
}
