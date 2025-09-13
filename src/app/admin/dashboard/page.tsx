"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus } from "lucide-react"
import CreateTaskForm from "@/components/create-task-form"
import TaskDetails from "@/components/task-details"
import ClientManagement from "@/components/client-management"
import SocialMediaManager from "@/components/social-media-manager"
import ContactHoursManager from "@/components/contact-hours-manager"
import TaskStatsSection from "@/components/admin-dashboard/TaskStatsSection"
import TaskFiltersSection from "@/components/admin-dashboard/TaskFiltersSection"
import TaskListSection from "@/components/admin-dashboard/TaskListSection"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"


export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Utilisation du hook personnalisé pour toute la logique métier
  const {
    clients,
    isLoadingTasks,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    selectedTask,
    setSelectedTask,
    showCreateForm,
    setShowCreateForm,
    stats,
    handleDeleteTask,
    resetFilters,
    refreshData,
    getFilteredAndSortedTasks,
  } = useAdminDashboard()

  useEffect(() => {
    if (loading) return

    if (!user || user.role !== "ADMIN") {
      router.push("/auth/signin")
      return
    }

  }, [user, loading, router])  






  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
              <p className="text-muted-foreground">Bienvenue, {user.displayName || user.email}</p>
            </div>
            <Button variant="outline" onClick={() => signOut(auth)}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <TaskStatsSection stats={stats} />

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
                clients={clients}
                onUpdate={refreshData}
                onClose={() => setSelectedTask(null)}
              />
            ) : showCreateForm ? (
              <CreateTaskForm
                onSuccess={() => {
                  setShowCreateForm(false)
                  refreshData()
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
                      <h3 className="text-lg font-medium">Gestion des Projets</h3>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau Projet
                      </Button>
                    </div>

                    {/* Filtres et recherche */}
                    <TaskFiltersSection
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      priorityFilter={priorityFilter}
                      setPriorityFilter={setPriorityFilter}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      resetFilters={resetFilters}
                      getFilteredAndSortedTasks={getFilteredAndSortedTasks}
                    />

                    {/* Liste des tâches */}
                    <TaskListSection
                      tasks={getFilteredAndSortedTasks()}
                      clients={clients}
                      isLoadingTasks={isLoadingTasks}
                      onSelectTask={setSelectedTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialMediaManager />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactHoursManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
