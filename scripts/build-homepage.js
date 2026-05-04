const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputFile = path.join(root, 'index.html');
const skippedDirs = new Set(['.git', '.github', 'node_modules', 'scripts']);
const skippedFiles = new Set(['index.html']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!skippedDirs.has(entry.name)) files.push(...walk(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.html')) continue;
    if (skippedFiles.has(entry.name)) continue;

    files.push(relativePath);
  }

  return files;
}

function readTitle(source, fallback) {
  const titleMatch = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1Match = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const raw = titleMatch?.[1] || h1Match?.[1] || fallback;
  return cleanText(raw);
}

function readDescription(source) {
  const metaMatch = source.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (metaMatch?.[1]) return cleanText(metaMatch[1]);

  const pMatch = source.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!pMatch?.[1]) return '업로드된 발표 자료입니다.';

  const text = cleanText(pMatch[1]);
  return text.length > 120 ? `${text.slice(0, 118)}...` : text;
}

function cleanText(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toDisplayName(filePath) {
  return path
    .basename(filePath, '.html')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toHref(filePath) {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

function getMaterials() {
  return walk(root)
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .map((filePath) => {
      const fullPath = path.join(root, filePath);
      const source = fs.readFileSync(fullPath, 'utf8');
      const stats = fs.statSync(fullPath);

      return {
        filePath,
        href: toHref(filePath),
        title: readTitle(source, toDisplayName(filePath)),
        description: readDescription(source),
        updated: stats.mtime.toISOString().slice(0, 10),
      };
    });
}

function renderCard(item) {
  return `
        <article class="material-card">
          <div class="card-meta">
            <span>HTML 자료</span>
            <time datetime="${item.updated}">${item.updated}</time>
          </div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description)}</p>
          <a href="${item.href}">자료 열기</a>
        </article>`;
}

function renderPage(materials) {
  const cards = materials.length
    ? materials.map(renderCard).join('\n')
    : '<p class="empty">아직 등록된 HTML 자료가 없습니다. 루트 또는 materials 폴더에 HTML 파일을 올리면 자동으로 표시됩니다.</p>';

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>자료 홈페이지</title>
  <style>
    :root {
      --bg: #f7f8fb;
      --ink: #172033;
      --muted: #667085;
      --line: #d9e0ea;
      --panel: #ffffff;
      --accent: #146c94;
      --accent-2: #2d9c7f;
      --warm: #b86b32;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Noto Sans KR", "Segoe UI", Arial, sans-serif;
      color: var(--ink);
      background: var(--bg);
      line-height: 1.6;
    }

    header {
      border-bottom: 1px solid var(--line);
      background:
        linear-gradient(120deg, rgba(20, 108, 148, 0.12), rgba(45, 156, 127, 0.10)),
        #fff;
    }

    .wrap {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
    }

    .hero {
      min-height: 42vh;
      display: grid;
      align-content: center;
      padding: 72px 0 56px;
    }

    .eyebrow {
      margin: 0 0 12px;
      color: var(--accent);
      font-weight: 800;
      letter-spacing: 0.08em;
      font-size: 0.82rem;
    }

    h1 {
      margin: 0;
      max-width: 760px;
      font-size: clamp(2.2rem, 5vw, 4.2rem);
      line-height: 1.08;
      letter-spacing: 0;
    }

    .lead {
      max-width: 720px;
      margin: 18px 0 0;
      color: var(--muted);
      font-size: 1.05rem;
    }

    .summary {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 26px;
    }

    .summary span {
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.72);
      padding: 8px 12px;
      border-radius: 8px;
      color: #344054;
      font-weight: 700;
      font-size: 0.92rem;
    }

    main {
      padding: 40px 0 72px;
    }

    .section-head {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
    }

    .section-head h2 {
      margin: 0;
      font-size: 1.45rem;
    }

    .section-head p {
      margin: 4px 0 0;
      color: var(--muted);
    }

    .materials {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .material-card {
      min-height: 250px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      box-shadow: 0 12px 30px rgba(23, 32, 51, 0.06);
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: var(--muted);
      font-size: 0.84rem;
    }

    .card-meta span {
      color: var(--warm);
      font-weight: 800;
    }

    .material-card h2 {
      margin: 0;
      font-size: 1.18rem;
      line-height: 1.35;
    }

    .material-card p {
      margin: 0;
      color: var(--muted);
      flex: 1;
    }

    .material-card a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
      min-height: 42px;
      padding: 10px 14px;
      border-radius: 8px;
      background: var(--accent);
      color: white;
      text-decoration: none;
      font-weight: 800;
    }

    .empty {
      padding: 24px;
      border: 1px dashed var(--line);
      border-radius: 8px;
      color: var(--muted);
      background: #fff;
    }

    footer {
      border-top: 1px solid var(--line);
      padding: 22px 0;
      color: var(--muted);
      font-size: 0.9rem;
      background: #fff;
    }

    @media (max-width: 640px) {
      .section-head { display: block; }
      .material-card { min-height: auto; }
    }
  </style>
</head>
<body>
  <!-- AUTO-GENERATED by scripts/build-homepage.js. Do not edit index.html directly. -->
  <header>
    <div class="wrap hero">
      <p class="eyebrow">MATERIAL LIBRARY</p>
      <h1>업로드한 발표 자료를 한곳에서 볼 수 있는 홈페이지</h1>
      <p class="lead">새 HTML 자료를 저장소 루트나 <code>materials/</code> 폴더에 올리면 자동화가 파일 제목과 내용을 읽어 이 목록을 갱신합니다.</p>
      <div class="summary">
        <span>등록 자료 ${materials.length}개</span>
        <span>자동 생성 홈페이지</span>
        <span>GitHub Pages 준비 완료</span>
      </div>
    </div>
  </header>

  <main class="wrap">
    <div class="section-head">
      <div>
        <h2>자료 목록</h2>
        <p>각 카드는 업로드된 HTML 자료에서 자동으로 만들어집니다.</p>
      </div>
    </div>

    <section class="materials" aria-label="업로드 자료 목록">${cards}
    </section>
  </main>

  <footer>
    <div class="wrap">Generated from uploaded HTML materials.</div>
  </footer>
</body>
</html>
`;
}

const materials = getMaterials();
fs.writeFileSync(outputFile, renderPage(materials));
console.log(`Homepage updated with ${materials.length} material(s).`);
