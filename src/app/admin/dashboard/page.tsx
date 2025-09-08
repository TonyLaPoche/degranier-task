"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, CheckSquare, Clock, AlertCircle, Plus, Calendar, User } from "lucide-react"
import CreateTaskForm from "@/components/create-task-form"
import TaskDetails from "@/components/task-details"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
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
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

    fetchTasks()
  }, [session, status, router])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
              <p className="text-muted-foreground">Bienvenue, {session.user.name}</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 ce mois</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">8 en retard</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Terminés</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">Ce trimestre</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projets Urgents</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">À traiter</p>
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
                onUpdate={fetchTasks}
                onClose={() => setSelectedTask(null)}
              />
            ) : showCreateForm ? (
              <CreateTaskForm
                onSuccess={() => {
                  setShowCreateForm(false)
                  fetchTasks()
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
                      <h3 className="text-lg font-medium">Projets Récentes</h3>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Projet
                      </Button>
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
                        {tasks.map((task) => (
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
                                    <span>{task.clients.length} client{task.clients.length > 1 ? 's' : ''}</span>
                                  </div>
                                  <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>

                                {task.clients.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.clients.map((client) => (
                                      <Badge key={client.user.id} variant="outline" className="text-xs">
                                        {client.user.name || client.user.email}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {task.history.length > 0 && (
                                  <div className="mt-3 pt-3 border-t">
                                    <h5 className="text-sm font-medium mb-2">Historique récent</h5>
                                    <div className="space-y-1">
                                      {task.history.slice(0, 3).map((entry) => (
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
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Clients</CardTitle>
                <CardDescription>
                  Gérez vos clients et leurs informations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Liste des Clients</h3>
                    <Button>Nouveau Client</Button>
                  </div>

                  <div className="space-y-3">
                    {/* Placeholder pour les clients */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Marie Dupont</p>
                        <p className="text-sm text-muted-foreground">marie@example.com</p>
                      </div>
                      <Badge>Actif</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Jean Martin</p>
                        <p className="text-sm text-muted-foreground">jean@example.com</p>
                      </div>
                      <Badge>Actif</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Réseaux Sociaux</CardTitle>
                <CardDescription>
                  Gérez vos profils et liens vers les réseaux sociaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Section en développement - Configuration des réseaux sociaux à venir
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Horaires de Contact</CardTitle>
                <CardDescription>
                  Définissez vos horaires de disponibilité téléphonique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Section en développement - Configuration des horaires à venir
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
