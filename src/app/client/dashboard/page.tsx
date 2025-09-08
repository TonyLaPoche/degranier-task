"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckSquare, Clock, AlertCircle } from "lucide-react"
import TaskComments from "@/components/task-comments"

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "CLIENT") {
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

  const handleCommentAdded = () => {
    fetchTasks() // Rafraîchir les tâches pour voir le nouveau commentaire
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "CLIENT") {
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

        {/* Tasks List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Projets en cours</CardTitle>
              <CardDescription>
                Suivez l&apos;avancement de vos collaborations avec Aurore De Granier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Chargement de vos projets...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun projet assigné pour le moment</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{task.title}</h3>
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
                                <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                              )}
                              <span>Dernière mise à jour: {new Date(task.updatedAt).toLocaleDateString('fr-FR')}</span>
                            </div>

                            {task.comments.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-medium mb-2">Discussion récente</h5>
                                <div className="space-y-1">
                                  {task.comments.slice(-2).map((comment) => (
                                    <div key={comment.id} className="text-xs text-muted-foreground">
                                      <span className="font-medium">
                                        {comment.author.name || comment.author.email}
                                        {comment.author.role === "ADMIN" ? " (Aurore)" : ""}
                                      </span>
                                      {" "}
                                      <span className="text-xs">
                                        {new Date(comment.createdAt).toLocaleString('fr-FR')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section commentaires pour chaque projet */}
                      <TaskComments
                        taskId={task.id}
                        taskStatus={task.status}
                        comments={task.comments}
                        onCommentAdded={handleCommentAdded}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>
                Informations de contact avec Aurore De Granier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Horaires de contact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi:</span>
                      <span>9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi:</span>
                      <span>10h00 - 16h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche:</span>
                      <span>Fermé</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Réseaux sociaux</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">LinkedIn:</span>
                      <a href="#" className="text-primary hover:text-primary/80 underline text-sm">
                        /aurore-de-granier
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Twitter:</span>
                      <a href="#" className="text-primary hover:text-primary/80 underline text-sm">
                        @AuroreDG
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Instagram:</span>
                      <a href="#" className="text-primary hover:text-primary/80 underline text-sm">
                        @aurore.degranier
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
