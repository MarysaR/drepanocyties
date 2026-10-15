/**
 * Vérifie les règles de dépendance de la Clean Architecture :
 * domaine sans framework, application sans infrastructure, présentation sans serveur,
 * et aucun import de l'infrastructure d'un autre domaine.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcRoot = join(import.meta.dirname, '../../../src')

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    if (entry === 'generated') return []
    if (statSync(path).isDirectory()) return listSourceFiles(path)
    return /\.(ts|vue)$/.test(entry) ? [path] : []
  })
}

interface SourceFile { path: string; domain: string | undefined; layer: string | undefined; imports: string[] }

const files: SourceFile[] = listSourceFiles(srcRoot).map((path) => {
  const segments = relative(srcRoot, path).split(sep)
  const isDomain = segments[0] === 'domains'
  const content = readFileSync(path, 'utf8')
  return {
    path: relative(srcRoot, path),
    domain: isDomain ? segments[1] : undefined,
    layer: isDomain ? segments[2] : segments[0] === 'shared' ? `shared/${segments[1]}` : segments[0],
    imports: [...content.matchAll(/from\s+'([^']+)'/g)].map(match => match[1]!),
  }
})

function violations(predicate: (file: SourceFile, specifier: string) => boolean): string[] {
  return files.flatMap(file => file.imports.filter(specifier => predicate(file, specifier)).map(specifier => `${file.path} → ${specifier}`))
}

describe('Frontières d’architecture', () => {
  it('le domaine ne dépend d’aucun framework ni de l’application', () => {
    expect(violations((file, specifier) => file.layer === 'domain'
      && (/^(vue|nuxt|h3|primevue|@prisma|@anthropic-ai|zod|#)/.test(specifier) || /\/(application|infrastructure|presentation)\//.test(specifier)))).toEqual([])
  })

  it('l’application ne dépend ni de l’infrastructure, ni de la présentation, ni d’un framework', () => {
    expect(violations((file, specifier) => file.layer === 'application'
      && (/\/(infrastructure|presentation)\//.test(specifier) || /^(vue|nuxt|h3|primevue|@prisma|@anthropic-ai|#)/.test(specifier)))).toEqual([])
  })

  it('la présentation ne connaît ni Prisma, ni Anthropic, ni l’infrastructure, ni la composition', () => {
    expect(violations((file, specifier) => (file.layer === 'presentation' || file.layer === 'shared/presentation')
      && (/infrastructure|@composition|@prisma|@anthropic-ai|node:/.test(specifier)))).toEqual([])
  })

  it('aucun domaine n’importe le code d’un autre domaine hors de ses contrats (application, domaine)', () => {
    expect(violations((file, specifier) => {
      const target = /^@domains\/([^/]+)\/([^/]+)/.exec(specifier)
      if (!file.domain || !target || target[1] === file.domain) return false
      return target[2] === 'infrastructure' || (file.layer !== 'presentation' && target[2] === 'presentation')
    })).toEqual([])
  })

  it('le code partagé hors infrastructure ne dépend pas de l’infrastructure', () => {
    expect(violations((file, specifier) => (file.layer === 'shared/domain' || file.layer === 'shared/errors' || file.layer === 'shared/application')
      && /infrastructure/.test(specifier))).toEqual([])
  })
})
