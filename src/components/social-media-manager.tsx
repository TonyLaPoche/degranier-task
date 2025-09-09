"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Edit, Trash2, ExternalLink, Globe, Twitter, Facebook, Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react"

interface SocialMedia {
  id: string
  platform: string
  url: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PLATFORM_ICONS = {
  Facebook: Facebook,
  Twitter: Twitter,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  TikTok: MessageCircle,
  Default: Globe,
}

const PLATFORM_COLORS = {
  Facebook: "bg-blue-600",
  Twitter: "bg-sky-500",
  Instagram: "bg-pink-500",
  LinkedIn: "bg-blue-700",
  YouTube: "bg-red-600",
  TikTok: "bg-black",
  Default: "bg-gray-600",
}

const POPULAR_PLATFORMS = [
  "Facebook",
  "Twitter",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "TikTok",
  "GitHub",
  "Website",
  "Portfolio",
  "Autre"
]

export default function SocialMediaManager() {
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSocial, setEditingSocial] = useState<SocialMedia | null>(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    isActive: true,
  })

  useEffect(() => {
    fetchSocialMedia()
  }, [])

  const fetchSocialMedia = async () => {
    try {
      const response = await fetch("/api/social-media")
      if (response.ok) {
        const data = await response.json()
        setSocialMedia(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réseaux sociaux:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      platform: "",
      url: "",
      isActive: true,
    })
  }

  const handleCreateSocial = async () => {
    if (!formData.platform.trim() || !formData.url.trim()) {
      setError("Le nom de la plateforme et l'URL sont requis")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/social-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateModal(false)
        resetForm()
        fetchSocialMedia()
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

  const handleEditSocial = (social: SocialMedia) => {
    setEditingSocial(social)
    setFormData({
      platform: social.platform,
      url: social.url,
      isActive: social.isActive,
    })
    setShowEditModal(true)
  }

  const handleUpdateSocial = async () => {
    if (!editingSocial || !formData.platform.trim() || !formData.url.trim()) {
      setError("Le nom de la plateforme et l'URL sont requis")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/social-media/${editingSocial.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingSocial(null)
        resetForm()
        fetchSocialMedia()
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

  const handleDeleteSocial = async (socialId: string, platformName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le réseau "${platformName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/social-media/${socialId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchSocialMedia()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion")
    }
  }

  const getPlatformIcon = (platform: string) => {
    const IconComponent = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] || PLATFORM_ICONS.Default
    return IconComponent
  }

  const getPlatformColor = (platform: string) => {
    return PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.Default
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des réseaux sociaux...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header avec bouton ajouter */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Réseaux Sociaux</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos profils sur les réseaux sociaux
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un réseau
        </Button>
      </div>

      {/* Liste des réseaux sociaux */}
      {socialMedia.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun réseau social</h3>
            <p className="text-muted-foreground text-center mb-4">
              Ajoutez vos premiers réseaux sociaux pour que vos clients puissent vous suivre
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier réseau
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialMedia.map((social) => {
            const IconComponent = getPlatformIcon(social.platform)
            const colorClass = getPlatformColor(social.platform)

            return (
              <Card key={social.id} className={`relative ${!social.isActive ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{social.platform}</CardTitle>
                        {!social.isActive && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Désactivé
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSocial(social)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSocial(social.id, social.platform)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="h-4 w-4" />
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {social.url}
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Ajouté le {new Date(social.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={!social.isActive}
                      >
                        <a href={social.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Voir
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ajouter un réseau social</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Ajoutez un nouveau réseau social à votre profil
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plateforme *</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="custom-platform"
                    placeholder="Ou saisir une plateforme personnalisée"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL du profil *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  {formData.url && !isValidUrl(formData.url) && (
                    <p className="text-sm text-red-600">URL invalide</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                  />
                  <Label htmlFor="is-active" className="cursor-pointer">Réseau actif</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateSocial}
                  disabled={isSubmitting || !formData.platform.trim() || !formData.url.trim() || !isValidUrl(formData.url)}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier le réseau social</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSocial(null)
                    resetForm()
                  }}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Modifiez les informations de ce réseau social
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-platform">Plateforme *</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="edit-custom-platform"
                    placeholder="Ou saisir une plateforme personnalisée"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL du profil *</Label>
                  <Input
                    id="edit-url"
                    type="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  {formData.url && !isValidUrl(formData.url) && (
                    <p className="text-sm text-red-600">URL invalide</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                  />
                  <Label htmlFor="edit-is-active" className="cursor-pointer">Réseau actif</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingSocial(null)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdateSocial}
                  disabled={isSubmitting || !formData.platform.trim() || !formData.url.trim() || !isValidUrl(formData.url)}
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
