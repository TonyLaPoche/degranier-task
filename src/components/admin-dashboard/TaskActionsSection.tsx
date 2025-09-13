import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"

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
}

interface TaskActionsSectionProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string, taskTitle: string) => void
}

export default function TaskActionsSection({ task, onEdit, onDelete }: TaskActionsSectionProps) {
  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(task)
        }}
        className="flex items-center gap-1"
      >
        <Edit className="h-3 w-3" />
        Modifier
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id, task.title)
        }}
        className="flex items-center gap-1"
      >
        <Trash2 className="h-3 w-3" />
        Supprimer
      </Button>
    </div>
  )
}
