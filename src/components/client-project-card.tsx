"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, MessageSquare, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock3, CheckSquare } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import TaskComments from "@/components/task-comments"
import { getAllowComments } from "@/lib/utils"

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
  history: Array<{
    id: string
    field: string
    oldValue: string | null
    newValue: string | null
    createdAt: Date
    changedBy: {
      id: string
      name: string | null
      email: string
    }
  }>
  comments: TaskComment[]
  checklists?: TaskChecklist[]
}

interface ClientProjectCardProps {
  task: Task
  onCommentAdded: () => void
}

export default function ClientProjectCard({ task, onCommentAdded }: ClientProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Clock className="h-4 w-4" />
      case "IN_PROGRESS":
        return <Clock3 className="h-4 w-4" />
      case "REVIEW":
        return <AlertCircle className="h-4 w-4" />
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "REVIEW":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "URGENT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "TODO":
        return "À faire"
      case "IN_PROGRESS":
        return "En cours"
      case "REVIEW":
        return "En révision"
      case "COMPLETED":
        return "Terminé"
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Basse"
      case "MEDIUM":
        return "Moyenne"
      case "HIGH":
        return "Haute"
      case "URGENT":
        return "Urgente"
      default:
        return priority
    }
  }

  const isOverdue = () => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== "COMPLETED"
  }

  const getDaysUntilDue = () => {
    if (!task.dueDate) return null
    const now = new Date()
    const due = new Date(task.dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isOverdue() ? 'border-red-300 bg-red-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 truncate">{task.title}</CardTitle>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {getStatusText(task.status)}
              </div>

              <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                {getPriorityText(task.priority)}
              </Badge>

              {isOverdue() && (
                <Badge variant="destructive" className="text-xs">
                  En retard
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-600' : ''}`}>
                <Calendar className="h-4 w-4" />
                <span>
                  {isOverdue() ? 'Échéance dépassée' :
                   daysUntilDue === 0 ? 'Échéance aujourd\'hui' :
                   daysUntilDue === 1 ? 'Échéance demain' :
                   daysUntilDue && daysUntilDue > 1 ? `Échéance dans ${daysUntilDue} jours` :
                   `Échéance: ${new Date(task.dueDate).toLocaleDateString('fr-FR')}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Mise à jour: {new Date(task.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(task.comments?.length || 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 text-xs"
              >
                <MessageSquare className="h-3 w-3" />
                {task.comments?.length || 0}
              </Button>
            )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Notes de mise à jour */}
              {(task.history || []).filter(entry => entry.field === "update").length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    📝 Notes de mise à jour
                  </h5>
                  <div className="space-y-2">
                    {(task.history || [])
                      .filter(entry => entry.field === "update")
                      .slice(-3)
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-900">
                                  Mise à jour par {entry.changedBy.name || entry.changedBy.email}
                                </span>
                                <span className="text-xs text-blue-600">
                                  {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-sm text-blue-800 leading-relaxed">
                                {entry.newValue}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Checklist */}
              {task.checklists && task.checklists.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <h5 className="text-sm font-medium">Tâches à réaliser</h5>
                  </div>
                  <div className="space-y-2">
                    {task.checklists
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <Checkbox
                            checked={item.isCompleted || false}
                            disabled={true}
                            className="mt-0.5 cursor-not-allowed opacity-70"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              (item.isCompleted || false)
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(task.checklists || []).filter(item => item.isCompleted || false).length} / {(task.checklists || []).length} tâches terminées
                  </div>
                </div>
              )}

              {/* Autres activités récentes */}
              {(task.history || []).filter(entry => entry.field !== "update").length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Activités récentes</h5>
                  <div className="space-y-1">
                    {(task.history || [])
                      .filter(entry => entry.field !== "update")
                      .slice(-3)
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <span className="font-medium">
                            {entry.changedBy.name || entry.changedBy.email}
                          </span>
                          {" "}a mis à jour{" "}
                          <span className="font-medium">{entry.field}</span>
                          {" • "}
                          {new Date(entry.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Commentaires récents */}
              {(task.comments?.length || 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Discussion récente</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(!showComments)}
                      className="text-xs"
                    >
                      {showComments ? 'Masquer' : 'Voir tout'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {task.comments?.slice(-2).map((comment) => (
                      <div key={comment.id} className="text-xs bg-muted/30 p-2 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {comment.author.name || comment.author.email}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString('fr-FR')}
                          </span>
                          {comment.author.role === "ADMIN" && (
                            <Badge variant="secondary" className="text-xs">Aurore</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section commentaires complète */}
              {showComments && (
                <div className="border-t pt-4">
                  <TaskComments
                    taskId={task.id}
                    taskStatus={task.status}
                    comments={task.comments || []}
                    allowComments={getAllowComments(task)}
                    onCommentAdded={onCommentAdded}
                  />
                </div>
              )}
            </div>
          </CardContent>
      )}
    </Card>
  )
}
