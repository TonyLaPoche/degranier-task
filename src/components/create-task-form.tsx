"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, X, CheckSquare, Plus, Trash2 } from "lucide-react"

interface User {
  id: string
  name: string | null
  email: string
}

interface CreateTaskFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateTaskForm({ onSuccess, onCancel }: CreateTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("TODO")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState("")
  const [allowComments, setAllowComments] = useState(true)

  // États pour les checklists
  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState("")

  useEffect(() => {
    // Récupérer la liste des clients
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/firebase/users")
      if (response.ok) {
        const allUsers = await response.json()
        // Filtrer seulement les clients
        const clientUsers = allUsers.filter((user: User & { role: string }) => user.role === 'CLIENT')
        setClients(clientUsers)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  // Fonctions pour gérer les checklists
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems(prev => [...prev, newChecklistItem.trim()])
      setNewChecklistItem("")
    }
  }

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleChecklistKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddChecklistItem()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!title.trim()) {
      setError("Le titre est requis")
      setIsLoading(false)
      return
    }

    if (selectedClients.length === 0) {
      setError("Au moins un client doit être sélectionné")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/firebase/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          clientIds: selectedClients,
          allowComments,
          checklists: checklistItems.length > 0 ? checklistItems : undefined,
        }),
      })

      if (response.ok) {
        const taskData = await response.json()
        onSuccess?.()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la création de la tâche")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Créer un nouveau projet</CardTitle>
            <CardDescription>
              Assignez ce projet à un ou plusieurs clients
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du projet"
                required
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée du projet"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={status} onValueChange={setStatus}>
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
              <Select value={priority} onValueChange={setPriority}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d&apos;échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Clients assignés *</Label>
            {isLoadingClients ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Chargement des clients...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun client trouvé</p>
                ) : (
                  clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={client.id}
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => handleClientToggle(client.id)}
                      />
                      <label
                        htmlFor={client.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {client.name || client.email}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
            {selectedClients.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} sélectionné{selectedClients.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowComments"
                checked={allowComments}
                onCheckedChange={(checked) => setAllowComments(checked as boolean)}
              />
              <label
                htmlFor="allowComments"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Autoriser les commentaires des clients
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Si activé, les clients pourront laisser des commentaires et répondre aux discussions sur ce projet
            </p>
          </div>

          {/* Section Checklist */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
              <Label>Liste de tâches (optionnel)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Ajoutez des éléments à cocher pour organiser le travail sur ce projet
            </p>

            {/* Ajouter un nouvel élément */}
            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle tâche..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={handleChecklistKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddChecklistItem}
                disabled={!newChecklistItem.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Liste des éléments de checklist */}
            {checklistItems.length > 0 && (
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    <CheckSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm">{item}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  {checklistItems.length} élément{checklistItems.length > 1 ? 's' : ''} dans la liste
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le projet"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
