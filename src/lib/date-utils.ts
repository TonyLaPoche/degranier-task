/**
 * Utilitaires pour gérer les dates provenant de l'API
 * Les dates arrivent souvent sous forme de chaînes depuis l'API JSON
 */

export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  return typeof date === 'string' ? new Date(date) : date
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  return parsed ? parsed.toISOString().split('T')[0] : ""
}

export function formatDateForDisplay(date: string | Date | null | undefined, locale: string = 'fr-FR'): string {
  const parsed = parseDate(date)
  return parsed ? parsed.toLocaleDateString(locale) : ""
}

export function formatDateTimeForDisplay(date: string | Date | null | undefined, locale: string = 'fr-FR'): string {
  const parsed = parseDate(date)
  return parsed ? parsed.toLocaleString(locale) : ""
}
