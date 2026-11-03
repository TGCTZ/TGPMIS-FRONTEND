import { type IdentificationReport } from './schema'

/**
 * What a report must answer before the service will lock it.
 *
 * Mirrors `FINALIZE_REQUIRED_FIELDS` in
 * `backend/apps/identification/services/report.py`. The server is the
 * enforcement point — this copy exists so the requirement can be shown while
 * the findings are being recorded, and so Finalize can refuse before spending a
 * round trip on a rejection.
 *
 * Drafts stay saveable while findings are incomplete. These answers become
 * mandatory when the report is finalized.
 */
const FINALIZE_REQUIRED_FIELDS = [
  { name: 'species', label: 'Specie / Group' },
  { name: 'variety', label: 'variety' },
  { name: 'color', label: 'colour' },
  { name: 'shape_cut', label: 'shape/cut' },
  { name: 'weight', label: 'weight' },
  { name: 'transparency', label: 'transparency' },
  { name: 'optic_character', label: 'optic character' },
  { name: 'nature_type', label: 'nature' },
] as const

/** Field names the form should mark as needed before sign-off. */
export const FINALIZE_REQUIRED_NAMES: ReadonlySet<string> = new Set(
  FINALIZE_REQUIRED_FIELDS.map((field) => field.name)
)

/**
 * Labels of the required findings a report has not answered yet.
 *
 * `weight` is read from `stone_weight`: the form collects it alongside the
 * findings but it is stored on the stone, which is also where certification
 * looks for it.
 */
export function missingForFinalize(report: IdentificationReport): string[] {
  const answered: Record<string, unknown> = {
    species: report.species,
    variety: report.variety,
    color: report.color,
    shape_cut: report.shape_cut,
    weight: report.stone_weight,
    transparency: report.transparency.trim(),
    optic_character: report.optic_character.trim(),
    nature_type: report.nature_type.trim(),
  }

  return FINALIZE_REQUIRED_FIELDS.filter((field) => !answered[field.name]).map(
    (field) => field.label
  )
}

/** Join missing field labels into a readable sentence. */
export function listLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}
