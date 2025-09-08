"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, User, History, Edit, Save, X } from "lucide-react"
import { formatDateForInput, formatDateForDisplay, formatDateTimeForDisplay } from "@/lib/date-utils"

interface User {
  id: string
  name: string | null
  email: string
}

interface TaskClient {
  user: User
}

interface TaskHistory {
  id: string
  field: string
  oldValue: string | null
  newValue: string | null
  createdAt: Date
  changedBy: User
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
  clients: TaskClient[]
  history: TaskHistory[]
}

interface TaskDetailsProps {
  task: Task
  onUpdate?: () => void
  onClose?: () => void
}

export default function TaskDetails({ task, onUpdate, onClose }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // États pour l'édition
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || "")
  const [editStatus, setEditStatus] = useState(task.status)
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editDueDate, setEditDueDate] = useState(() => formatDateForInput(task.dueDate))

  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          status: editStatus,
          priority: editPriority,
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate?.()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditStatus(task.status)
    setEditPriority(task.priority)
    setEditDueDate(formatDateForInput(task.dueDate))
    setIsEditing(false)
    setError("")
  }

  const getHistoryMessage = (entry: TaskHistory) => {
    switch (entry.field) {
      case "created":
        return "a créé la tâche"
      case "title":
        return `a modifié le titre de "${entry.oldValue}" à "${entry.newValue}"`
      case "description":
        return "a modifié la description"
      case "status":
        return `a changé le statut à ${entry.newValue}`
      case "priority":
        return `a changé la priorité à ${entry.newValue}`
      case "dueDate":
        const oldDate = entry.oldValue ? new Date(entry.oldValue).toLocaleDateString('fr-FR') : "sans échéance"
        const newDate = entry.newValue ? new Date(entry.newValue).toLocaleDateString('fr-FR') : "sans échéance"
        return `a changé l'échéance de ${oldDate} à ${newDate}`
      case "clients":
        return `a modifié les clients assignés`
      default:
        return "a fait une modification"
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>
            ) : (
              <CardTitle>{task.title}</CardTitle>
            )}
            <CardDescription>
              Créée le {formatDateForDisplay(task.createdAt)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
                <Button onClick={handleSave} size="sm" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Sauvegarder
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                {onClose && (
                  <Button onClick={onClose} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations principales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations</h3>

            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              ) : (
                task.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO">À faire</SelectItem>
                          <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                          <SelectItem value="REVIEW">En révision</SelectItem>
                          <SelectItem value="COMPLETED">Terminée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priorité</Label>
                      <Select value={editPriority} onValueChange={setEditPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Basse</SelectItem>
                          <SelectItem value="MEDIUM">Moyenne</SelectItem>
                          <SelectItem value="HIGH">Haute</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Statut</Label>
                      <div className="mt-1">
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
                      </div>
                    </div>

                    <div>
                      <Label>Priorité</Label>
                      <div className="mt-1">
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
                    </div>
                  </>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Date d&apos;échéance</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>
              ) : (
                task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Échéance: {formatDateForDisplay(task.dueDate)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Clients assignés */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Clients assignés</h3>
            <div className="space-y-2">
              {task.clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun client assigné</p>
              ) : (
                task.clients.map((client) => (
                  <div key={client.user.id} className="flex items-center gap-2 p-2 border rounded">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.user.name || client.user.email}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Historique complet */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique complet
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {task.history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
            ) : (
              task.history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {entry.changedBy.name || entry.changedBy.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTimeForDisplay(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getHistoryMessage(entry)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
