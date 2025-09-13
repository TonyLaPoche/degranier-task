"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Calendar, ExternalLink, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Mail, MapPin, Phone } from "lucide-react"

interface ContactHours {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

interface ContactInfo {
  id: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Vacation {
  id: string
  reason: string
  description?: string | null
  startDate: string | Date
  endDate: string | Date
  isActive: boolean
  createdAt?: string
}

interface SocialMedia {
  id: string
  platform: string
  url: string
  isActive: boolean
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

export default function ClientContactInfo() {
  const [contactHours, setContactHours] = useState<ContactHours[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([])
  const [isLoadingHours, setIsLoadingHours] = useState(true)
  const [isLoadingContact, setIsLoadingContact] = useState(true)
  const [isLoadingSocial, setIsLoadingSocial] = useState(true)

  useEffect(() => {
    fetchContactHours()
    fetchContactInfo()
    fetchVacations()
    fetchSocialMedia()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/firebase/contact-info")
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de contact:", error)
    } finally {
      setIsLoadingContact(false)
    }
  }

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
    }
  }

  const fetchSocialMedia = async () => {
    try {
      const response = await fetch("/api/firebase/social-media")
      if (response.ok) {
        const data = await response.json()
        setSocialMedia(data.filter((social: SocialMedia) => social.isActive))
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réseaux sociaux:", error)
    } finally {
      setIsLoadingSocial(false)
    }
  }

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || "Inconnu"
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


  const getPlatformIcon = (platform: string) => {
    const IconComponent = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] || PLATFORM_ICONS.Default
    return IconComponent
  }

  const getPlatformColor = (platform: string) => {
    return PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.Default
  }

  const getCurrentDayOfWeek = () => {
    return new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  }

  const getCurrentDayHours = () => {
    const currentDay = getCurrentDayOfWeek()
    return contactHours.find(hour => hour.dayOfWeek === currentDay && hour.isActive)
  }

  const isCurrentlyOpen = () => {
    const now = new Date()
    const currentHours = getCurrentDayHours()

    if (!currentHours) return false

    const startTime = new Date()
    const endTime = new Date()

    const [startHour, startMinute] = currentHours.openTime.split(':').map(Number)
    const [endHour, endMinute] = currentHours.closeTime.split(':').map(Number)

    startTime.setHours(startHour, startMinute, 0, 0)
    endTime.setHours(endHour, endMinute, 0, 0)

    return now >= startTime && now <= endTime
  }

  const currentDay = getCurrentDayOfWeek()
  const currentHours = getCurrentDayHours()
  const isOpen = isCurrentlyOpen()
  const activeVacations = vacations.filter(vacation => isVacationActive(vacation))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Horaires de contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horaires de contact
          </CardTitle>
          <CardDescription>
            Découvrez quand Aurore est disponible pour vous contacter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHours ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Statut actuel */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {getDayName(currentDay)}
                    </span>
                  </div>
                  <Badge variant={isOpen ? "default" : "secondary"}>
                    {isOpen ? "Ouvert" : "Fermé"}
                  </Badge>
                </div>
                {currentHours && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(currentHours.openTime)} - {formatTime(currentHours.closeTime)}
                  </p>
                )}
              </div>

              {/* Vacances actives */}
              {activeVacations.length > 0 && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Période de vacances</span>
                  </div>
                  {activeVacations.map(vacation => (
                    <div key={vacation.id} className="text-xs text-orange-700">
                      <p className="font-medium">{vacation.reason}</p>
                      {vacation.description && (
                        <p className="text-orange-600">{vacation.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tous les horaires */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Horaires hebdomadaires</h5>
                <div className="space-y-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayHours = contactHours.find(h => h.dayOfWeek === day.value)
                    const isCurrentDay = day.value === currentDay

                    return (
                      <div
                        key={day.value}
                        className={`py-2 px-2 rounded text-sm ${
                          isCurrentDay ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
                            {day.label}
                          </span>
                          <span className="text-muted-foreground">
                            {dayHours && dayHours.isActive
                              ? `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}`
                              : "Fermé"
                            }
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coordonnées générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Coordonnées
          </CardTitle>
          <CardDescription>
            Informations de contact générales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingContact ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : contactInfo ? (
            <div className="space-y-3">
              {contactInfo.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Téléphone</p>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-green-100">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-sm text-green-600 hover:underline"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              )}

              {contactInfo.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-purple-100">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
              )}

              {!contactInfo.phone && !contactInfo.email && !contactInfo.address && (
                <div className="text-center py-6">
                  <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune information de contact définie
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucune information de contact disponible
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Réseaux sociaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Réseaux sociaux
          </CardTitle>
          <CardDescription>
            Suivez Aurore sur ses réseaux sociaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSocial ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : socialMedia.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucun réseau social configuré
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {socialMedia.map((social) => {
                const IconComponent = getPlatformIcon(social.platform)
                const colorClass = getPlatformColor(social.platform)

                return (
                  <div
                    key={social.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${colorClass}`}>
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{social.platform}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-32">
                          {social.url.replace(/^https?:\/\//, '')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
