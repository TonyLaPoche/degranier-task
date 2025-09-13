"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Edit, Trash2, Clock, Calendar, Phone } from "lucide-react"
import ContactInfoManager from "@/components/contact-info-manager"

interface ContactHours {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

interface Vacation {
  id: string
  reason: string
  description?: string | null
  startDate: string | Date
  endDate: string | Date
  isActive: boolean
  createdAt?: string
  updatedAt?: Date
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lundi", short: "Lun" },
  { value: 2, label: "Mardi", short: "Mar" },
  { value: 3, label: "Mercredi", short: "Mer" },
  { value: 4, label: "Jeudi", short: "Jeu" },
  { value: 5, label: "Vendredi", short: "Ven" },
  { value: 6, label: "Samedi", short: "Sam" },
  { value: 0, label: "Dimanche", short: "Dim" },
]

export default function ContactHoursManager() {
  const [contactHours, setContactHours] = useState<ContactHours[]>([])
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [isLoadingHours, setIsLoadingHours] = useState(true)
  const [isLoadingVacations, setIsLoadingVacations] = useState(true)
  const [activeTab, setActiveTab] = useState("hours")

  // États pour les horaires
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [editingHours, setEditingHours] = useState<ContactHours | null>(null)
  const [hoursFormData, setHoursFormData] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    isActive: true,
  })

  // États pour les vacances
  const [showVacationModal, setShowVacationModal] = useState(false)
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null)
  const [vacationFormData, setVacationFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  })

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchContactHours()
    fetchVacations()
  }, [])

  const fetchContactHours = async () => {
    try {
      const response = await fetch("/api/firebase/contact-hours")
      if (response.ok) {
        const data = await response.json()
        setContactHours(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des horaires:", error)
    } finally {
      setIsLoadingHours(false)
    }
  }

  const fetchVacations = async () => {
    try {
      const response = await fetch("/api/firebase/vacations")
      if (response.ok) {
        const data = await response.json()
        setVacations(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des vacances:", error)
    } finally {
      setIsLoadingVacations(false)
    }
  }

  // Gestion des horaires
  const resetHoursForm = () => {
    setHoursFormData({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "18:00",
      isActive: true,
    })
  }

  const handleCreateHours = async () => {
    if (!hoursFormData.startTime || !hoursFormData.endTime) {
      setError("Les horaires de début et fin sont requis")
      return
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (hoursFormData.startTime >= hoursFormData.endTime) {
      setError("L'heure de fin doit être après l'heure de début")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/firebase/contact-hours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hoursFormData),
      })

      if (response.ok) {
        setShowHoursModal(false)
        resetHoursForm()
        fetchContactHours()
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

  const handleEditHours = (hours: ContactHours) => {
    setEditingHours(hours)
    setHoursFormData({
      dayOfWeek: hours.dayOfWeek,
      startTime: hours.openTime,
      endTime: hours.closeTime,
      isActive: hours.isActive,
    })
    setShowHoursModal(true)
  }

  const handleUpdateHours = async () => {
    if (!editingHours || !hoursFormData.startTime || !hoursFormData.endTime) {
      setError("Les horaires de début et fin sont requis")
      return
    }

    if (hoursFormData.startTime >= hoursFormData.endTime) {
      setError("L'heure de fin doit être après l'heure de début")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/firebase/contact-hours/${editingHours.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hoursFormData),
      })

      if (response.ok) {
        setShowHoursModal(false)
        setEditingHours(null)
        resetHoursForm()
        fetchContactHours()
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

  const handleDeleteHours = async (hoursId: string, dayName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer les horaires du ${dayName} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/firebase/contact-hours/${hoursId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchContactHours()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion")
    }
  }

  // Gestion des vacances
  const resetVacationForm = () => {
    setVacationFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      isActive: true,
    })
  }

  const handleCreateVacation = async () => {
    if (!vacationFormData.title.trim() || !vacationFormData.startDate || !vacationFormData.endDate) {
      setError("Le titre et les dates sont requis")
      return
    }

    const startDate = new Date(vacationFormData.startDate)
    const endDate = new Date(vacationFormData.endDate)

    if (startDate >= endDate) {
      setError("La date de fin doit être après la date de début")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/firebase/vacations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...vacationFormData,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (response.ok) {
        setShowVacationModal(false)
        resetVacationForm()
        fetchVacations()
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

  const handleEditVacation = (vacation: Vacation) => {
    setEditingVacation(vacation)
    setVacationFormData({
      title: vacation.reason,
      description: vacation.description || "",
      startDate: typeof vacation.startDate === 'string' ? vacation.startDate.split('T')[0] : vacation.startDate.toISOString().split('T')[0],
      endDate: typeof vacation.endDate === 'string' ? vacation.endDate.split('T')[0] : vacation.endDate.toISOString().split('T')[0],
      isActive: vacation.isActive,
    })
    setShowVacationModal(true)
  }

  const handleUpdateVacation = async () => {
    if (!editingVacation || !vacationFormData.title.trim() || !vacationFormData.startDate || !vacationFormData.endDate) {
      setError("Le titre et les dates sont requis")
      return
    }

    const startDate = new Date(vacationFormData.startDate)
    const endDate = new Date(vacationFormData.endDate)

    if (startDate >= endDate) {
      setError("La date de fin doit être après la date de début")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/firebase/vacations/${editingVacation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...vacationFormData,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (response.ok) {
        setShowVacationModal(false)
        setEditingVacation(null)
        resetVacationForm()
        fetchVacations()
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

  const handleDeleteVacation = async (vacationId: string, vacationTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la période "${vacationTitle}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/firebase/vacations/${vacationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchVacations()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion")
    }
  }


  const formatTime = (time: string | undefined) => {
    if (!time) return "N/A"
    return time.substring(0, 5) // HH:MM
  }

  const isVacationActive = (vacation: Vacation) => {
    const now = new Date()
    const start = new Date(vacation.startDate)
    const end = new Date(vacation.endDate)
    return now >= start && now <= end && vacation.isActive
  }

  const isVacationUpcoming = (vacation: Vacation) => {
    const now = new Date()
    const start = new Date(vacation.startDate)
    return start > now && vacation.isActive
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horaires
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Coordonnées
          </TabsTrigger>
          <TabsTrigger value="vacations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vacances
          </TabsTrigger>
        </TabsList>

        {/* Onglet Horaires */}
        <TabsContent value="hours" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Horaires de Contact</h3>
              <p className="text-sm text-muted-foreground">
                Définissez vos horaires de disponibilité par jour de la semaine
              </p>
            </div>
            <Button onClick={() => setShowHoursModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter des horaires
            </Button>
          </div>

          {isLoadingHours ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des horaires...</span>
            </div>
          ) : contactHours.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun horaire défini</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Définissez vos horaires de contact pour que vos clients sachent quand vous joindre
                </p>
                <Button onClick={() => setShowHoursModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Définir vos horaires
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayHours = contactHours.find(h => h.dayOfWeek === day.value)
                return (
                  <Card key={day.value} className={!dayHours?.isActive ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{day.label}</CardTitle>
                        {dayHours ? (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHours(dayHours)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteHours(dayHours.id, day.label)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setHoursFormData({ ...hoursFormData, dayOfWeek: day.value })
                              setShowHoursModal(true)
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dayHours ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(dayHours.openTime)} - {formatTime(dayHours.closeTime)}</span>
                          </div>
                          {!dayHours.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Désactivé
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun horaire défini</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Onglet Coordonnées */}
        <TabsContent value="contact" className="space-y-6">
          <ContactInfoManager />
        </TabsContent>

        {/* Onglet Vacances */}
        <TabsContent value="vacations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Périodes de Vacances</h3>
              <p className="text-sm text-muted-foreground">
                Gérez vos périodes d&apos;absence et de congés
              </p>
            </div>
            <Button onClick={() => setShowVacationModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une période
            </Button>
          </div>

          {isLoadingVacations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des vacances...</span>
            </div>
          ) : vacations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune période de vacances</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Définissez vos périodes de vacances pour informer vos clients de vos absences
                </p>
                <Button onClick={() => setShowVacationModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une période de vacances
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vacations.map((vacation) => {
                const isActive = isVacationActive(vacation)
                const isUpcoming = isVacationUpcoming(vacation)

                return (
                  <Card key={vacation.id} className={!vacation.isActive ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 text-green-600' : isUpcoming ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{vacation.reason}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {isActive && <Badge className="text-xs bg-green-100 text-green-800">En cours</Badge>}
                              {isUpcoming && <Badge variant="secondary" className="text-xs">À venir</Badge>}
                              {!vacation.isActive && <Badge variant="outline" className="text-xs">Désactivé</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVacation(vacation)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVacation(vacation.id, vacation.reason)}
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
                          <Calendar className="h-4 w-4" />
                          <span>
                            Du {new Date(vacation.startDate).toLocaleDateString('fr-FR')} au {new Date(vacation.endDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {vacation.description && (
                          <p className="text-sm text-muted-foreground">{vacation.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Créé le {new Date(vacation.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal pour les horaires */}
      {showHoursModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingHours ? "Modifier les horaires" : "Ajouter des horaires"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowHoursModal(false)
                    setEditingHours(null)
                    resetHoursForm()
                  }}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {editingHours ? "Modifiez les horaires pour ce jour" : "Définissez vos horaires de disponibilité"}
              </p>

              <div className="space-y-4">
                {!editingHours && (
                  <div className="space-y-2">
                    <Label>Jour de la semaine *</Label>
                    <Select
                      value={hoursFormData.dayOfWeek.toString()}
                      onValueChange={(value) => setHoursFormData({ ...hoursFormData, dayOfWeek: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un jour" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Heure de début *</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={hoursFormData.startTime}
                      onChange={(e) => setHoursFormData({ ...hoursFormData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Heure de fin *</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={hoursFormData.endTime}
                      onChange={(e) => setHoursFormData({ ...hoursFormData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hours-active"
                    checked={hoursFormData.isActive}
                    onChange={(e) => setHoursFormData({ ...hoursFormData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="hours-active" className="cursor-pointer">Horaires actifs</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowHoursModal(false)
                    setEditingHours(null)
                    resetHoursForm()
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={editingHours ? handleUpdateHours : handleCreateHours}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {editingHours ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour les vacances */}
      {showVacationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingVacation ? "Modifier la période de vacances" : "Ajouter une période de vacances"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowVacationModal(false)
                    setEditingVacation(null)
                    resetVacationForm()
                  }}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {editingVacation ? "Modifiez cette période de vacances" : "Définissez une période d'absence"}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vacation-title">Titre de la période *</Label>
                  <Input
                    id="vacation-title"
                    placeholder="Ex: Vacances d&apos;été, Congés, etc."
                    value={vacationFormData.title}
                    onChange={(e) => setVacationFormData({ ...vacationFormData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vacation-description">Description (optionnel)</Label>
                  <Textarea
                    id="vacation-description"
                    placeholder="Détails supplémentaires sur cette période..."
                    value={vacationFormData.description}
                    onChange={(e) => setVacationFormData({ ...vacationFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Date de début *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={vacationFormData.startDate}
                      onChange={(e) => setVacationFormData({ ...vacationFormData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Date de fin *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={vacationFormData.endDate}
                      onChange={(e) => setVacationFormData({ ...vacationFormData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vacation-active"
                    checked={vacationFormData.isActive}
                    onChange={(e) => setVacationFormData({ ...vacationFormData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="vacation-active" className="cursor-pointer">Période active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVacationModal(false)
                    setEditingVacation(null)
                    resetVacationForm()
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={editingVacation ? handleUpdateVacation : handleCreateVacation}
                  disabled={isSubmitting || !vacationFormData.title.trim() || !vacationFormData.startDate || !vacationFormData.endDate}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {editingVacation ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
