/**
 * Garde-fou : aucun seed, aucune insertion dans les migrations, aucun stockage navigateur,
 * et les personas de test n'apparaissent jamais dans le code applicatif.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '../../..')

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    if (entry === 'generated' || entry === 'node_modules') return []
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

const applicationFiles = [...listFiles(join(root, 'src')), ...listFiles(join(root, 'app')), ...listFiles(join(root, 'server'))]
  .filter(path => /\.(ts|vue)$/.test(path))

describe('Aucune donnée de démonstration', () => {
  it("ne configure aucun seed Prisma ni script d'injection", () => {
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { prisma?: unknown; scripts: Record<string, string> }
    expect(packageJson.prisma).toBeUndefined()
    expect(Object.keys(packageJson.scripts).filter(name => /seed|demo|fixture/i.test(name))).toEqual([])
    expect(readFileSync(join(root, 'prisma.config.ts'), 'utf8')).not.toMatch(/seed/i)
    expect(readdirSync(join(root, 'prisma')).filter(name => /seed/i.test(name))).toEqual([])
  })

  it("n'insère aucune donnée dans les migrations", () => {
    const migrationsDirectory = join(root, 'prisma/migrations')
    const sql = listFiles(migrationsDirectory).filter(path => path.endsWith('.sql')).map(path => readFileSync(path, 'utf8')).join('\n')
    expect(sql).not.toMatch(/\bINSERT\s+INTO\b/i)
  })

  it("ne mentionne aucun persona de test dans le code applicatif", () => {
    const offenders = applicationFiles.filter(path => /\b(mary|a[iï]cha)\b/i.test(readFileSync(path, 'utf8')))
    expect(offenders).toEqual([])
  })

  it("n'utilise ni localStorage, ni sessionStorage, ni IndexedDB, ni service worker", () => {
    const offenders = applicationFiles.filter(path => /localStorage|sessionStorage|indexedDB|serviceWorker/.test(readFileSync(path, 'utf8')))
    expect(offenders).toEqual([])
  })
})
