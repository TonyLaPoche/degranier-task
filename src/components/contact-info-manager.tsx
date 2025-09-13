"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, Mail, MapPin, Save, Edit, Plus } from "lucide-react"

interface ContactInfo {
  id: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ContactInfoManager() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // États du formulaire
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/firebase/contact-info")
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
        if (data) {
          setFormData({
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
          })
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de contact:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation basique de l'email si fourni
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Format d'email invalide")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/firebase/contact-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
        setIsEditing(false)
        setError("")
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la sauvegarde")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (contactInfo) {
      setFormData({
        phone: contactInfo.phone || "",
        email: contactInfo.email || "",
        address: contactInfo.address || "",
      })
    } else {
      setFormData({
        phone: "",
        email: "",
        address: "",
      })
    }
    setIsEditing(false)
    setError("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des informations de contact...</span>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informations de Contact Générales
              </CardTitle>
              <CardDescription>
                Gérez vos coordonnées principales (téléphone, email, adresse)
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse (optionnel)</Label>
                <Input
                  id="address"
                  placeholder="123 Rue de la Paix, 75000 Paris"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {contactInfo ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Téléphone</p>
                        <p className="text-sm text-muted-foreground">
                          {contactInfo.phone || "Non défini"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {contactInfo.email || "Non défini"}
                        </p>
                      </div>
                    </div>

                    {contactInfo.address && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Adresse</p>
                          <p className="text-sm text-muted-foreground">
                            {contactInfo.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Dernière mise à jour: {new Date(contactInfo.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune information de contact</h3>
                  <p className="text-muted-foreground mb-4">
                    Définissez vos coordonnées principales pour que vos clients puissent vous contacter facilement.
                  </p>
                  <Button onClick={() => setIsEditing(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter mes coordonnées
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
