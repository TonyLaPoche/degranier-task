"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, Plus, Edit, Trash2, RefreshCw, User, Calendar } from "lucide-react"
import { useSession } from "next-auth/react"

interface ClientCategory {
  id: string
  name: string
  description?: string
  color?: string
  clientCount: number
}

interface Client {
  id: string
  name: string | null
  email: string
  role: string
  category?: ClientCategory | null
  projectCount: number
  createdAt: Date
}

export default function ClientManagement() {
  const { data: session } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [categories, setCategories] = useState<ClientCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ClientCategory | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    categoryId: "none",
  })

  // Category form states
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    color: "#6b7280",
  })

  useEffect(() => {
    fetchClients()
    fetchCategories()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users?role=CLIENT")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      } else {
        setError("Erreur lors du chargement des clients")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories")
    }
  }

  const handleCreateClient = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Le nom et l'email sont requis")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          categoryId: formData.categoryId === "none" ? null : formData.categoryId || null,
        }),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: "", email: "", categoryId: "none" })
        fetchClients()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la création")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name || "",
      email: client.email,
      categoryId: client.category?.id || "none",
    })
    setShowEditModal(true)
  }

  const handleUpdateClient = async () => {
    if (!editingClient || !formData.name.trim() || !formData.email.trim()) {
      setError("Le nom et l'email sont requis")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/users/${editingClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          categoryId: formData.categoryId === "none" ? null : formData.categoryId || null,
        }),
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingClient(null)
        setFormData({ name: "", email: "", categoryId: "none" })
        fetchClients()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${clientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchClients()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion")
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryFormData.name.trim()) {
      setError("Le nom de la catégorie est requis")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim(),
          color: categoryFormData.color,
        }),
      })

      if (response.ok) {
        setShowCreateCategoryModal(false)
        setCategoryFormData({ name: "", description: "", color: "#6b7280" })
        fetchCategories()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la création")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = (category: ClientCategory) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#6b7280",
    })
    setShowEditCategoryModal(true)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !categoryFormData.name.trim()) {
      setError("Le nom de la catégorie est requis")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim(),
          color: categoryFormData.color,
        }),
      })

      if (response.ok) {
        setShowEditCategoryModal(false)
        setEditingCategory(null)
        setCategoryFormData({ name: "", description: "", color: "#6b7280" })
        fetchCategories()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string, clientCount: number) => {
    if (clientCount > 0) {
      alert(`Impossible de supprimer la catégorie "${categoryName}" car elle contient ${clientCount} client(s). Veuillez d'abord réassigner ou supprimer ces clients.`)
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion")
    }
  }

  const getCategoryBadgeColor = (category?: ClientCategory | null) => {
    if (!category?.color) return "secondary"
    // Retourner un variant valide pour le Badge
    return "outline" as const
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const isRecentClient = (createdAt: Date) => {
    const now = new Date()
    const clientDate = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - clientDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 // Considérer comme récent si moins de 7 jours
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux cette semaine</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(client => isRecentClient(client.createdAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">Derniers 7 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground">📁</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Catégories créées</p>
          </CardContent>
        </Card>
      </div>

      {/* Gestion des clients */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des Clients</CardTitle>
              <CardDescription>
                Gérez vos clients, leurs informations et catégories
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchClients}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCategoryModal(true)}
              >
                📁 Gérer Catégories
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement des clients...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun client trouvé</p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer votre premier client
                  </Button>
                </div>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{client.name || "Nom non défini"}</p>
                          {isRecentClient(client.createdAt) && (
                            <Badge variant="outline" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Inscrit le {formatDate(client.createdAt)}</span>
                          <span>•</span>
                          <span>{client.projectCount} projet{client.projectCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {client.category && (
                        <Badge
                          variant={getCategoryBadgeColor(client.category)}
                          className="text-xs"
                        >
                          {client.category.name}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id, client.name || client.email)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création de client */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Créer un nouveau client</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Ajoutez un nouveau client à votre base de données
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nom complet *</Label>
                  <Input
                    id="create-name"
                    placeholder="Ex: Marie Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-email">Adresse email *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="Ex: marie@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune catégorie</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateClient}
                  disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Créer le client
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des catégories */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Gestion des Catégories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Créez et gérez les catégories de vos clients
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateCategoryModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Catégorie
                  </Button>
                </div>

                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune catégorie créée</p>
                      <p className="text-sm">Les catégories vous permettent d&apos;organiser vos clients</p>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color || '#6b7280' }}
                          />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-600">
                              {category.clientCount} client{category.clientCount > 1 ? 's' : ''}
                              {category.description && ` • ${category.description}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCategory(category.id, category.name, category.clientCount)}
                            disabled={category.clientCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de client */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier le client</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Modifiez les informations du client
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom complet *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Ex: Marie Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Adresse email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="Ex: marie@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune catégorie</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdateClient}
                  disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4 mr-1" />
                  )}
                  Mettre à jour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de catégorie */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Créer une catégorie</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateCategoryModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Créez une nouvelle catégorie pour organiser vos clients
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Nom de la catégorie *</Label>
                  <Input
                    id="category-name"
                    placeholder="Ex: Entreprise, Particulier, VIP..."
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-description">Description (optionnel)</Label>
                  <Input
                    id="category-description"
                    placeholder="Description de la catégorie..."
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: categoryFormData.color }}
                    />
                    <span className="text-sm text-gray-600">{categoryFormData.color}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateCategoryModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={isSubmitting || !categoryFormData.name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Créer la catégorie
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de catégorie */}
      {showEditCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier la catégorie</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Modifiez les informations de la catégorie
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-name">Nom de la catégorie *</Label>
                  <Input
                    id="edit-category-name"
                    placeholder="Ex: Entreprise, Particulier, VIP..."
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category-description">Description (optionnel)</Label>
                  <Input
                    id="edit-category-description"
                    placeholder="Description de la catégorie..."
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: categoryFormData.color }}
                    />
                    <span className="text-sm text-gray-600">{categoryFormData.color}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditCategoryModal(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdateCategory}
                  disabled={isSubmitting || !categoryFormData.name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4 mr-1" />
                  )}
                  Mettre à jour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
