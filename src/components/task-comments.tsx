"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Send, MessageSquare } from "lucide-react"

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

interface TaskCommentsProps {
  taskId: string
  taskStatus: string
  comments: TaskComment[]
  onCommentAdded?: () => void
}

export default function TaskComments({ taskId, taskStatus, comments, onCommentAdded }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const canComment = taskStatus !== "COMPLETED"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      })

      if (response.ok) {
        setNewComment("")
        onCommentAdded?.()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de l'envoi du commentaire")
      }
    } catch (error) {
      setError("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-medium">Discussion</h3>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun commentaire pour le moment
          </p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.author.name, comment.author.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.author.name || comment.author.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.author.role === "ADMIN" ? "(Aurore)" : "(Client)"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      {canComment ? (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                placeholder="Écrivez votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Votre commentaire sera visible par Aurore et vous-même
                </p>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Envoyer
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Les commentaires ne sont plus possibles sur ce projet terminé
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
