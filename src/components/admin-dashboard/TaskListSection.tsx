import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import TaskActionsSection from "./TaskActionsSection"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  clientIds: string[]
  checklists?: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  history?: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}


interface Client {
  id: string
  name?: string
  email: string
  role: string
}

interface TaskListSectionProps {
  tasks: Task[]
  clients: Client[]
  isLoadingTasks: boolean
  onSelectTask: (task: Task) => void
  onDeleteTask: (taskId: string, taskTitle: string) => void
}

export default function TaskListSection({
  tasks,
  clients,
  isLoadingTasks,
  onSelectTask,
  onDeleteTask
}: TaskListSectionProps) {
  if (isLoadingTasks) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Chargement des projets...</span>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun projet trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onSelectTask(task)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{task.title}</h4>
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
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{task.clientIds?.length || 0} client{(task.clientIds?.length || 0) > 1 ? 's' : ''}</span>
                </div>
                <span>Créée le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>

              {(task.clientIds?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.clientIds.map((clientId) => {
                    const client = clients.find(c => c.id === clientId)
                    return (
                      <Badge key={clientId} variant="outline" className="text-xs">
                        {client ? (client.name || client.email) : 'Client inconnu'}
                      </Badge>
                    )
                  })}
                </div>
              )}

              {task.history && task.history.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h5 className="text-sm font-medium mb-2">Historique récent</h5>
                  <div className="space-y-1">
                    {task.history?.slice(0, 3).map((entry: { id: string; field: string; oldValue: string | null; newValue: string | null; timestamp: string; userId: string; changedBy?: { name?: string; email?: string } }) => (
                      <div key={entry.id} className="text-xs text-muted-foreground">
                        <span className="font-medium">
                          {entry.changedBy?.name || entry.changedBy?.email || 'Utilisateur inconnu'}
                        </span>
                        {" "}
                        {entry.field === "created" ? "a créé la tâche" :
                         entry.field === "title" ? "a modifié le titre" :
                         entry.field === "description" ? "a modifié la description" :
                         entry.field === "status" ? `a changé le statut à ${entry.newValue}` :
                         entry.field === "priority" ? `a changé la priorité à ${entry.newValue}` :
                         "a fait une modification"}
                        {" "}
                        <span className="text-xs">
                          {new Date(entry.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <TaskActionsSection
                task={task}
                onEdit={onSelectTask}
                onDelete={onDeleteTask}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
