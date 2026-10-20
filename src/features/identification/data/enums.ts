/**
 * Identification enums, mirrored from `apps/gems/enums.py`.
 *
 * The API exposes no choices endpoint for these, so they are kept here and must
 * be changed in step with the backend. Every one of them is optional on the
 * model (`blank=True, default=""`), which is why each select offers a "not
 * recorded" choice: a stone can defeat one test while answering another.
 */

export type EnumOption = { value: string; label: string }

/** Whether the stone is natural or man-made/altered. */
export const NATURE_TYPES: EnumOption[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'artificial', label: 'Artificial' },
  { value: 'synthetic', label: 'Synthetic' },
]

/** How light passes through the stone. */
export const TRANSPARENCIES: EnumOption[] = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'translucent', label: 'Translucent' },
  { value: 'opaque', label: 'Opaque' },
]

/**
 * Optical behaviour under polarised light.
 *
 * The stored value is the lowercase code; the UI uses the concise lab code as
 * its label.
 */
export const OPTIC_CHARACTERS: EnumOption[] = [
  { value: 'sr', label: 'SR' },
  { value: 'adr', label: 'ADR' },
  { value: 'dr', label: 'DR' },
  { value: 'agg', label: 'AGG' },
]
