function createTagBadgeRegExp(customTypes: string[] = []): RegExp {
  return new RegExp(
    '%c(' +
      [
        'arguments',
        'build',
        'change',
        'error',
        'mount',
        'new',
        'old',
        'unmount',
        'value',
        ...customTypes
      ]
        .map(i => `${i}`)
        .join('|') +
      ')'
  )
}

export function format(
  groups: number,
  customTypes: string[],
  ...args: (object | string)[]
): string {
  let tagBadgeRegExp = createTagBadgeRegExp(customTypes)
  return (
    Array.from({ length: groups })
      .map(() => '  ')
      .join('') +
    args
      .filter(arg => {
        if (typeof arg === 'string') {
          if (arg.includes('color:') || arg.includes('font-weight:')) {
            return false
          }
          return true
        }
        return true
      })
      .map(arg => {
        if (typeof arg === 'string') {
          return arg
            .replace(/%c𝖓/, 'Nano Stores ')
            .replace(tagBadgeRegExp, '$1:')
            .replace(/%c([^%]+)(%c)?/g, '$1')
        } else if (typeof arg === 'object') {
          return JSON.stringify(arg)
        }
        return arg
      })
      .join(' ')
  )
}
