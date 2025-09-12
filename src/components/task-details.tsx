"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Calendar, User, History, Edit, Save, X, RefreshCw, CheckSquare, Plus, Trash2 } from "lucide-react"
import { formatDateForInput, formatDateForDisplay, formatDateTimeForDisplay } from "@/lib/date-utils"
import TaskComments from "@/components/task-comments"
import { getAllowComments } from "@/lib/utils"

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

interface TaskChecklist {
  id: string
  title: string
  isCompleted: boolean
  order: number
  createdAt: Date
  updatedAt: Date
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
  clients: TaskClient[]
  history: TaskHistory[]
  comments: TaskComment[]
  checklists?: TaskChecklist[]
}

interface TaskDetailsProps {
  task: Task
  clients?: any[]
  onUpdate?: () => void
  onClose?: () => void
}

export default function TaskDetails({ task, clients = [], onUpdate, onClose }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [refreshComments, setRefreshComments] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateNote, setUpdateNote] = useState("")
  const [updateDescription, setUpdateDescription] = useState("")
  const [updateStatus, setUpdateStatus] = useState("")

  // États pour les checklists - synchronisés avec les props
  const [checklists, setChecklists] = useState<TaskChecklist[]>(task.checklists ?? task.checklistItems?.map((item: string, index: number) => ({
    id: `item-${index}`,
    text: item,
    isCompleted: false,
    order: index,
    taskId: task.id
  })) ?? [])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [isAddingChecklist, setIsAddingChecklist] = useState(false)

  // Synchroniser les états quand task change
  useEffect(() => {
    const checklistData = task.checklists ?? task.checklistItems?.map((item: string, index: number) => ({
      id: `item-${index}`,
      text: item,
      isCompleted: false,
      order: index,
      taskId: task.id
    })) ?? []
    setChecklists(checklistData)
  }, [task.checklists, task.checklistItems, task.id])

  useEffect(() => {
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditStatus(task.status)
    setEditPriority(task.priority)
    setEditDueDate(formatDateForInput(task.dueDate))
    setEditAllowComments(getAllowComments(task))
  }, [task])

  // États pour l'édition
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || "")
  const [editStatus, setEditStatus] = useState(task.status)
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editDueDate, setEditDueDate] = useState(() => formatDateForInput(task.dueDate))
  const [editAllowComments, setEditAllowComments] = useState(getAllowComments(task))

  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/firebase/tasks/${task.id}`, {
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
          allowComments: editAllowComments,
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
    setEditAllowComments(getAllowComments(task))
    setIsEditing(false)
    setError("")
  }

  const handleCommentAdded = () => {
    setRefreshComments(prev => prev + 1)
    onUpdate?.() // Rafraîchir aussi les tâches principales
  }

  // Fonctions pour gérer les checklists
  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return

    try {
      const response = await fetch(`/api/firebase/tasks/${task.id}/checklists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newChecklistItem.trim()
        }),
      })

      if (response.ok) {
        const newItem = await response.json()
        setChecklists(prev => [...prev, newItem])
        setNewChecklistItem("")
        setIsAddingChecklist(false)
        onUpdate?.()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de l'ajout")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    }
  }

  const handleToggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/firebase/tasks/${task.id}/checklists/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: !isCompleted
        }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setChecklists(prev =>
          prev.map(item =>
            item.id === itemId ? updatedItem : item
          )
        )
        onUpdate?.()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    }
  }

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/firebase/tasks/${task.id}/checklists/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setChecklists(prev => prev.filter(item => item.id !== itemId))
        onUpdate?.()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    }
  }

  const handleUpdateClick = () => {
    setUpdateNote("")
    setUpdateDescription(task.description || "")
    setUpdateStatus(task.status)
    setShowUpdateModal(true)
  }

  const handleUpdateSubmit = async () => {
    if (!updateNote.trim()) return

    setIsUpdating(true)
    setError("")

    try {
      const updates: Record<string, unknown> = {
        note: updateNote.trim(),
      }

      // Ajouter les modifications si elles sont différentes
      if (updateDescription !== (task.description || "")) {
        updates.description = updateDescription.trim() || null
      }
      if (updateStatus !== task.status) {
        updates.status = updateStatus
      }

      const response = await fetch(`/api/firebase/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setShowUpdateModal(false)
        setIsUpdating(false)
        onUpdate?.() // Rafraîchir les données
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setIsUpdating(false)
    }
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
      case "allowComments":
        return `a ${entry.newValue === "true" ? "activé" : "désactivé"} les commentaires`
      case "update":
        return `a fait une mise à jour : ${entry.newValue}`
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
                <Button
                  onClick={handleUpdateClick}
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Mettre à jour
                </Button>

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

            {/* Permissions */}
            <div className="space-y-2">
              {isEditing ? (
                <>
                  <Label>Permissions</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-allowComments"
                      checked={editAllowComments}
                      onCheckedChange={(checked) => setEditAllowComments(checked as boolean)}
                    />
                    <label
                      htmlFor="edit-allowComments"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Autoriser les commentaires des clients
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Commentaires: {getAllowComments(task) ? "Activés" : "Désactivés"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clients assignés */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Clients assignés</h3>
            <div className="space-y-2">
              {(task.clientIds?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun client assigné</p>
              ) : (
                task.clientIds?.map((clientId) => {
                  const client = clients.find(c => c.id === clientId)
                  return (
                    <div key={clientId} className="flex items-center gap-2 p-2 border rounded">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client ? (client.name || client.email) : 'Client inconnu'}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Section Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Liste de tâches
            </h3>
            {!isAddingChecklist && (
              <Button
                onClick={() => setIsAddingChecklist(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {isAddingChecklist && (
              <div className="flex gap-2 p-3 border rounded-lg bg-muted/30">
                <Input
                  placeholder="Nouvelle tâche..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddChecklistItem()
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button onClick={handleAddChecklistItem} size="sm" disabled={!newChecklistItem.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingChecklist(false)
                    setNewChecklistItem("")
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {checklists.length === 0 && !isAddingChecklist ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucune tâche dans la liste</p>
                <p className="text-xs mt-1">Ajoutez des éléments à cocher pour organiser votre travail</p>
              </div>
            ) : (
              <div className="space-y-2">
                {checklists
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                        className="mt-0.5"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {item.title}
                      </span>
                      <Button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}

            {checklists.length > 0 && (
              <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                {checklists.filter(item => item.isCompleted).length} / {checklists.length} tâches terminées
              </div>
            )}
          </div>
        </div>

        {/* Historique complet */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique complet
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(task.history?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
            ) : (
              task.history?.map((entry) => (
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

        {/* Section Commentaires */}
        <div className="mt-6">
          <TaskComments
            taskId={task.id}
            taskStatus={task.status}
            comments={task.comments || []}
            allowComments={getAllowComments(task)}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        {/* Modal de mise à jour */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Mettre à jour le projet</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUpdateModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Modifiez les informations du projet et ajoutez une note pour l&apos;historique
                </p>

                <div className="space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="update-description">Description</Label>
                    <Textarea
                      id="update-description"
                      placeholder="Description du projet..."
                      value={updateDescription}
                      onChange={(e) => setUpdateDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Statut */}
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
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

                  {/* Note obligatoire */}
                  <div className="space-y-2">
                    <Label htmlFor="update-note">Note de mise à jour *</Label>
                    <Textarea
                      id="update-note"
                      placeholder="Décrivez brièvement cette mise à jour..."
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Cette note sera ajoutée à l&apos;historique du projet
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowUpdateModal(false)}
                    disabled={isUpdating}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUpdateSubmit}
                    disabled={isUpdating || !updateNote.trim()}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Mettre à jour
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
