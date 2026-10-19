/** Return a label `offset` positions after the server-provided next label. */
export function stoneLabelAt(firstLabel: string, offset: number): string {
  if (/^\d+$/.test(firstLabel)) {
    return String(Number(firstLabel) + offset)
  }

  const start = alphabeticLabelNumber(firstLabel)
  return alphabeticLabel(start + offset)
}

function alphabeticLabelNumber(label: string): number {
  return [...label.toUpperCase()].reduce(
    (total, character) => total * 26 + character.charCodeAt(0) - 64,
    0
  )
}

function alphabeticLabel(number: number): string {
  let remaining = number
  let label = ''
  while (remaining > 0) {
    remaining -= 1
    label = String.fromCharCode(65 + (remaining % 26)) + label
    remaining = Math.floor(remaining / 26)
  }
  return label
}
