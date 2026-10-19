import { describe, expect, it } from 'vitest'
import { stoneLabelAt } from './stone-label'

describe('stoneLabelAt', () => {
  it('advances natural-number labels', () => {
    expect([0, 1, 2, 26].map((offset) => stoneLabelAt('1', offset))).toEqual([
      '1',
      '2',
      '3',
      '27',
    ])
  })

  it('continues alphabetic labels for legacy orders', () => {
    expect([0, 1].map((offset) => stoneLabelAt('A', offset))).toEqual([
      'A',
      'B',
    ])
    expect([0, 1].map((offset) => stoneLabelAt('Z', offset))).toEqual([
      'Z',
      'AA',
    ])
    expect([0, 1].map((offset) => stoneLabelAt('AA', offset))).toEqual([
      'AA',
      'AB',
    ])
  })
})
