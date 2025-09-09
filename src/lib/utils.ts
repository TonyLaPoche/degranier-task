import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction utilitaire pour extraire allowComments de manière sécurisée
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllowComments(task: any): boolean {
  return (task as { allowComments?: boolean }).allowComments ?? true
}
