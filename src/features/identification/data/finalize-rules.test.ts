import { describe, expect, it } from 'vitest'
import {
  FINALIZE_REQUIRED_NAMES,
  listLabels,
  missingForFinalize,
} from '@/features/identification/data/finalize-rules'
import { reportSchema } from '@/features/identification/data/schema'

/**
 * The completeness rule the sign-off gate rests on.
 *
 * The server is the enforcement point; this copy exists so Finalize can refuse
 * before spending a round trip, and so the form can mark the required fields. If
 * the two drift, the dialog offers a button the API then rejects — which is the
 * failure these assertions are here to catch.
 */
function report(overrides: Record<string, unknown> = {}) {
  return reportSchema.parse({
    id: 1,
    stone: 1,
    report_number: 'TGC-2627-0001',
    is_finalized: false,
    species: 3,
    variety: 6,
    stone_type_detail: { id: 5, name: 'Ruby' },
    color: 4,
    shape_cut: 7,
    stone_weight: '2.500',
    transparency: 'transparent',
    optic_character: 'dr',
    nature_type: 'natural',
    conclusion: 'Natural ruby.',
    ...overrides,
  })
}

describe('missingForFinalize', () => {
  it('finds nothing missing in a complete report', () => {
    expect(missingForFinalize(report())).toEqual([])
  })

  it('does not require a stone type', () => {
    expect(missingForFinalize(report({ stone_type_detail: null }))).toEqual([])
  })

  it('names every unanswered field, not just the first', () => {
    const blank = report({
      species: null,
      variety: null,
      color: null,
      shape_cut: null,
      stone_weight: null,
      transparency: '',
      optic_character: '',
      nature_type: '',
      conclusion: '',
    })

    expect(missingForFinalize(blank)).toEqual([
      'Specie / Group',
      'variety',
      'colour',
      'shape/cut',
      'weight',
      'transparency',
      'optic character',
      'nature',
    ])
  })

  it('reads weight from the stone, where it is actually stored', () => {
    // The form collects weight alongside the findings, but the API writes it to
    // the stone - so a report object carries it as `stone_weight`.
    expect(missingForFinalize(report({ stone_weight: null }))).toEqual([
      'weight',
    ])
  })

  it('allows empty or whitespace-only optional comments', () => {
    expect(missingForFinalize(report({ conclusion: '' }))).toEqual([])
    expect(missingForFinalize(report({ conclusion: '   ' }))).toEqual([])
  })

  it('marks exactly the required fields the form should flag', () => {
    expect([...FINALIZE_REQUIRED_NAMES].sort()).toEqual([
      'color',
      'nature_type',
      'optic_character',
      'shape_cut',
      'species',
      'transparency',
      'variety',
      'weight',
    ])
  })
})

describe('listLabels', () => {
  it('reads as a sentence at every length', () => {
    expect(listLabels([])).toBe('')
    expect(listLabels(['weight'])).toBe('weight')
    expect(listLabels(['Specie / Group', 'weight'])).toBe(
      'Specie / Group and weight'
    )
    expect(listLabels(['Specie / Group', 'colour', 'weight'])).toBe(
      'Specie / Group, colour and weight'
    )
  })
})
