// Incremental-deploy helper for the production/ bundle.
//
// build-production.sh rebuilds production/ from scratch every run, so mtimes are
// useless for "what changed" and a full re-upload is wasteful. This compares the
// freshly built tree against a content-hash manifest of the LAST UPLOADED state
// and reports only the files you actually need to push.
//
// Two-step workflow:
//   1. ./build-production.sh   → runs this in REPORT mode (read-only): prints
//      new/modified/removed files and stages the changed ones into
//      production-upload/ for drag-and-drop upload. Does NOT touch the manifest.
//   2. (after uploading) npm run deploy:mark → runs this in SNAPSHOT mode
//      (SAVE=1): records the current production/ as the new baseline.
//
// Config via env: OUT_DIR (default production), MANIFEST (default
// .deploy/manifest.json), UPLOAD_DIR (default production-upload), SAVE (snapshot).
import { createHash } from 'node:crypto'
import {
  readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync,
  rmSync, existsSync,
} from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, process.env.OUT_DIR || 'production')
const manifestPath = resolve(root, process.env.MANIFEST || '.deploy/manifest.json')
const uploadDir = resolve(root, process.env.UPLOAD_DIR || 'production-upload')
const deleteListPath = resolve(root, '.deploy/to-delete.txt')
const save = !!process.env.SAVE

// ── helpers ──────────────────────────────────────────────────────────────────
// OS/editor junk that can slip into production/ but must never be hashed/uploaded.
const IGNORE = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini'])

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name)) continue
    const abs = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(abs))
    else if (e.isFile()) out.push(abs)
  }
  return out
}

// Map of relative-path → { sha, size } for every file under outDir.
function hashTree() {
  const files = {}
  if (!existsSync(outDir)) return files
  for (const abs of walk(outDir)) {
    const buf = readFileSync(abs)
    const rel = relative(outDir, abs).split('\\').join('/') // posix paths in manifest
    files[rel] = { sha: createHash('sha256').update(buf).digest('hex'), size: buf.length }
  }
  return files
}

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function loadManifest() {
  if (!existsSync(manifestPath)) return null
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8'))
  } catch {
    return null
  }
}

function writeManifest(files) {
  mkdirSync(dirname(manifestPath), { recursive: true })
  const obj = { generatedAt: new Date().toISOString(), outDir: process.env.OUT_DIR || 'production', files }
  writeFileSync(manifestPath, JSON.stringify(obj, null, 2) + '\n')
  return {
    count: Object.keys(files).length,
    total: Object.values(files).reduce((n, f) => n + f.size, 0),
  }
}

// ── snapshot mode: record current tree as the deployed baseline ──────────────
if (save) {
  const files = hashTree()
  if (!Object.keys(files).length) {
    console.error(`✗ Nothing to record — ${relative(root, outDir)}/ is empty. Build first.`)
    process.exit(1)
  }
  const { count, total } = writeManifest(files)
  console.log(`📌 Recorded ${count} files / ${fmtSize(total)} as the deployed baseline.`)
  console.log(`   ${relative(root, manifestPath)}`)
  process.exit(0)
}

// ── report mode: diff current tree against the baseline ──────────────────────
const cur = hashTree()
if (!Object.keys(cur).length) {
  console.error(`✗ ${relative(root, outDir)}/ is empty — build first.`)
  process.exit(1)
}
const manifest = loadManifest()

console.log('')
if (!manifest) {
  const total = Object.values(cur).reduce((n, f) => n + f.size, 0)
  console.log('📦 No previous deploy recorded — treating this as a FIRST deploy.')
  console.log(`   Upload the entire ${relative(root, outDir)}/ folder (${Object.keys(cur).length} files / ${fmtSize(total)}).`)
  console.log(`   Then run:  npm run deploy:mark`)
  console.log('')
  process.exit(0)
}

const prev = manifest.files || {}
const added = [], modified = [], removed = []
for (const [rel, info] of Object.entries(cur)) {
  if (!(rel in prev)) added.push(rel)
  else if (prev[rel].sha !== info.sha) modified.push(rel)
}
for (const rel of Object.keys(prev)) if (!(rel in cur)) removed.push(rel)
added.sort(); modified.sort(); removed.sort()

const unchanged = Object.keys(cur).length - added.length - modified.length
const changed = [...added, ...modified]

// Stage changed files into a clean upload dir, preserving structure.
rmSync(uploadDir, { recursive: true, force: true })
let uploadBytes = 0
for (const rel of changed) {
  const dest = join(uploadDir, rel)
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(join(outDir, rel), dest)
  uploadBytes += cur[rel].size
}

// Record what to delete on the host (so a stale chunk doesn't linger).
mkdirSync(dirname(deleteListPath), { recursive: true })
if (removed.length) writeFileSync(deleteListPath, removed.join('\n') + '\n')
else rmSync(deleteListPath, { force: true })

// ── print report ─────────────────────────────────────────────────────────────
const line = (rel) => `     ${rel}  ${fmtSize(cur[rel].size)}`
console.log(`📦 Changes since last upload (vs ${relative(root, manifestPath)}):`)
console.log('')
if (added.length) { console.log(`  🆕 New (${added.length})`); added.forEach(r => console.log(line(r))) }
if (modified.length) { console.log(`  ✏️  Modified (${modified.length})`); modified.forEach(r => console.log(line(r))) }
if (removed.length) {
  console.log(`  🗑️  Removed — delete these on the host (${removed.length})`)
  removed.forEach(r => console.log(`     ${r}`))
}
console.log('')

if (!changed.length && !removed.length) {
  console.log('  ✓ Nothing changed — host is already up to date. Nothing to upload.')
  console.log('')
  process.exit(0)
}

console.log(`  ✓ Unchanged: ${unchanged}`)
console.log('')
if (changed.length) {
  console.log(`  → Staged ${changed.length} file(s) / ${fmtSize(uploadBytes)} in ${relative(root, uploadDir)}/`)
  console.log(`    Upload that folder to your host (preserves paths).`)
}
if (removed.length) console.log(`    Then delete the ${removed.length} removed file(s) (see ${relative(root, deleteListPath)}).`)
console.log(`  → After uploading, run:  npm run deploy:mark`)
console.log('')
