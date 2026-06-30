// Parses a legal-page Markdown file (see ./privacy.md, ./terms.md) into the
// shape <LegalPage/> expects. Kept deliberately small — the content is a
// regular subset of Markdown (YAML-ish front matter, `## ` section headings,
// paragraphs, bullet lists, links), so there's no need to pull a full Markdown
// AST here. The prose inside `intro` / each section `body` is left as raw
// Markdown and rendered by react-markdown in <LegalPage/>.
//
//   ---
//   title: Privacy Policy
//   lastUpdated: June 22, 2026
//   ---
//   <intro paragraphs…>
//   ## 1. Section Title
//   <section body…>
//
// → { title, lastUpdated, intro, sections: [{ id, title, body }] }

// GitHub-style slug for the in-page TOC anchors. The exact string is internal
// (only ever used as a `#fragment`), so numbered prefixes ("1. ") are fine.
function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseLegal(raw) {
  let body = raw
  const meta = {}

  // Front matter: a leading `---` … `---` block of `key: value` lines.
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (fm) {
    body = raw.slice(fm[0].length)
    for (const line of fm[1].split(/\r?\n/)) {
      const m = line.match(/^([\w-]+):\s*(.*)$/)
      if (m) meta[m[1]] = m[2].trim()
    }
  }

  // Split on `## ` headings: everything before the first heading is the intro;
  // each heading opens a new section that runs until the next heading.
  const introLines = []
  const sections = []
  let current = null
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*\S)\s*$/)
    if (h) {
      const title = h[1].trim()
      current = { id: slug(title), title, lines: [] }
      sections.push(current)
    } else if (current) {
      current.lines.push(line)
    } else {
      introLines.push(line)
    }
  }

  return {
    title: meta.title || '',
    lastUpdated: meta.lastUpdated || '',
    intro: introLines.join('\n').trim(),
    sections: sections.map(({ id, title, lines }) => ({
      id,
      title,
      body: lines.join('\n').trim(),
    })),
  }
}
