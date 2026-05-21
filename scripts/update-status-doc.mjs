#!/usr/bin/env node
/**
 * Regenerates the auto section of docs/05-etat-projet.md from git + filesystem.
 * Run: pnpm docs:status
 * Hook: node scripts/update-status-doc.mjs --hook  (reads Cursor afterFileEdit JSON on stdin)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DOC = path.join(ROOT, "docs/05-etat-projet.md");
const BACKLOG = path.join(ROOT, "docs/status.backlog.json");
const AUTO_BEGIN = "<!-- STATUS:AUTO:BEGIN -->";
const AUTO_END = "<!-- STATUS:AUTO:END -->";

const WATCH_PREFIXES = [
  "app/",
  "lib/",
  "components/",
  "hooks/",
  "package.json",
  "pnpm-lock.yaml",
  ".env.example",
  "docs/status.backlog.json",
];

function git(argv) {
  const r = spawnSync("git", argv, { cwd: ROOT, encoding: "utf8" });
  if (r.status !== 0) return "";
  return (r.stdout ?? "").trim();
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function shouldUpdateFromHook(filePath) {
  if (!filePath) return false;
  const norm = filePath.replace(/\\/g, "/");
  if (norm === "docs/05-etat-projet.md") return false;
  if (norm.startsWith("docs/") && !norm.includes("status.backlog")) return false;
  return WATCH_PREFIXES.some(
    (p) => norm === p || norm.startsWith(p) || norm.endsWith("/" + p),
  );
}

function readHookPath() {
  try {
    const raw = fs.readFileSync(0, "utf8");
    if (!raw.trim()) return "";
    const data = JSON.parse(raw);
    return (
      data.file_path ??
      data.path ??
      data.filePath ??
      data.payload?.file_path ??
      ""
    );
  } catch {
    return "";
  }
}

function loadBacklog() {
  try {
    return JSON.parse(fs.readFileSync(BACKLOG, "utf8"));
  } catch {
    return { focus: "", items: [] };
  }
}

function listRoutes() {
  const routes = [];
  const walk = (dir, prefix = "") => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");
      if (fs.statSync(full).isDirectory()) {
        walk(full, `${prefix}/${name}`);
      } else if (name === "page.tsx") {
        routes.push(prefix || "/");
      } else if (name === "route.ts") {
        const api = prefix.replace(/^app/, "").replace(/\/route$/, "") || "/api";
        routes.push(api);
      }
    }
  };
  walk(path.join(ROOT, "app"));
  return [...new Set(routes)].sort();
}

function listFiles(dir, ext = ".ts") {
  const out = [];
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) return out;
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(ext) && !name.endsWith(".d.ts")) {
        out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
      }
    }
  };
  walk(base);
  return out.sort();
}

function parseNav() {
  const navPath = path.join(ROOT, "lib/nav.ts");
  if (!fs.existsSync(navPath)) return [];
  const src = fs.readFileSync(navPath, "utf8");
  const items = [];
  for (const m of src.matchAll(/href:\s*["']([^"']+)["'],\s*label:\s*["']([^"']+)["']/g)) {
    items.push({ href: m[1], label: m[2] });
  }
  return items;
}

function featureMatrix() {
  const checks = [
    ["Liste + filtre mentors", "app/mentors/page.tsx"],
    ["Fiche mentor + créneaux", "app/mentors/[slug]/page.tsx"],
    ["Paiement CRC", "lib/crc-transfer.ts"],
    ["Résolution trésor THP", "lib/foundation-sink.ts"],
    ["Historique appels", "app/calls/page.tsx"],
    ["Bookings localStorage", "lib/bookings-storage.ts"],
    ["Trust mentor", "hooks/use-trust-mentor.ts"],
    ["Login signMessage", "hooks/use-sign-in.ts"],
    ["API mentors enrichie", "app/api/mentors/route.ts"],
    ["SQLite / db", "lib/db.ts"],
    ["API bookings", "app/api/bookings/route.ts"],
    ["Inscription mentor", "app/mentor/register/page.tsx"],
    ["Admin", "app/admin/page.tsx"],
    ["API tags", "app/api/tags/route.ts"],
  ];
  return checks.map(([label, p]) => ({
    label,
    ok: exists(p),
    path: p,
  }));
}

function formatBacklog(backlog) {
  const lines = [];
  if (backlog.focus) {
    lines.push(`**Focus actuel :** ${backlog.focus}`, "");
  }
  lines.push("| P | Tâche | État | Détection |");
  lines.push("|---|-------|:----:|-----------|");
  for (const item of backlog.items ?? []) {
    const done = item.detect ? exists(item.detect) : false;
    const state = done ? "done" : "todo";
    const det = item.detect ?? "—";
    lines.push(
      `| ${item.priority} | ${item.title} | ${state} | \`${det}\` |`,
    );
  }
  return lines.join("\n");
}

function recentCommits(n = 8) {
  const raw = git([
    "log",
    `-${n}`,
    "--format=%h|%ad|%an|%s",
    "--date=short",
  ]);
  if (!raw) return "_Pas de dépôt git._";
  const rows = raw.split("\n").map((line) => {
    const [hash, date, author, ...rest] = line.split("|");
    const subject = rest.join("|");
    const short =
      subject.length > 72 ? `${subject.slice(0, 69)}…` : subject;
    return `| [\`${hash}\`](https://github.com/gnosis-box/THP-for-Good/commit/${hash}) | ${date} | ${author} | ${short} |`;
  });
  return [
    "| Commit | Date | Auteur | Message |",
    "|--------|------|--------|---------|",
    ...rows,
  ].join("\n");
}

function dirtyFiles() {
  const raw = git(["status", "--porcelain"]);
  if (!raw) return "_Working tree propre._";
  return raw
    .split("\n")
    .slice(0, 20)
    .map((l) => `- \`${l.slice(3)}\`${l.slice(0, 2).trim() ? ` (${l.slice(0, 2).trim()})` : ""}`)
    .join("\n");
}

function branchAheadBehind() {
  const branch = git(["branch", "--show-current"]) || "?";
  const upstream = git(["rev-parse", "--abbrev-ref", "@{u}"]);
  if (!upstream) return `Branche **\`${branch}\`** (pas de upstream configuré).`;
  const ahead = git(["rev-list", "--count", "@{u}..HEAD"]) || "0";
  const behind = git(["rev-list", "--count", "HEAD..@{u}"]) || "0";
  return `Branche **\`${branch}\`** — ↑${ahead} / ↓${behind} vs \`${upstream}\`.`;
}

function zetGapTable() {
  const zetOnly = [
    ["Filtre skills (DB)", "app/api/tags/route.ts"],
    ["POST booking serveur", "app/api/bookings/route.ts"],
    ["Google Calendar post-pay", null],
    ["Devenir mentor", "app/mentor/register/page.tsx"],
    ["Admin", "app/admin/page.tsx"],
    ["Accueil = catalogue", "app/page.tsx mentors-only"],
  ];
  const lines = [
    "| Fonctionnalité (zet) | Branche courante |",
    "|----------------------|:----------------:|",
  ];
  for (const [label, detect] of zetOnly) {
    let cur = "todo";
    if (detect === "app/page.tsx mentors-only") {
      cur = exists("app/mentors/page.tsx") && !exists("app/mentor") ? "partiel" : "todo";
    } else if (detect && exists(detect)) cur = "done";
    else if (!detect) cur = "todo";
    else cur = "todo";
    lines.push(`| ${label} | ${cur} |`);
  }
  return lines.join("\n");
}

function buildAutoSection() {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const branch = git(["branch", "--show-current"]) || "?";
  const lastShort = git(["log", "-1", "--format=%h — %s"]) || "?";
  const lastShortTrim =
    lastShort.length > 80 ? `${lastShort.slice(0, 77)}…` : lastShort;
  const gitStatus = (git(["status", "-sb"]) || "—").replace(/\n/g, " · ");
  const routes = listRoutes();
  const nav = parseNav();
  const features = featureMatrix();
  const backlog = loadBacklog();
  const libCore = listFiles("lib").filter((f) =>
    /^(lib\/(mentors|config|crc|foundation|bookings|mentor-profiles)|lib\/)/.test(f),
  );
  const hooks = listFiles("hooks");

  const doneCount = (backlog.items ?? []).filter(
    (i) => i.detect && exists(i.detect),
  ).length;
  const totalBacklog = (backlog.items ?? []).length;
  const nextTodo =
    (backlog.items ?? []).find((i) => !(i.detect && exists(i.detect)))?.title ??
    "Voir backlog manuel";

  return `<!-- Ne pas éditer : généré par scripts/update-status-doc.mjs -->

> Dernière mise à jour : **${now}** · \`pnpm docs:status\`

### Reprise en 60 secondes

| | |
|---|---|
| **Branche** | \`${branch}\` |
| **Dernier commit** | \`${lastShortTrim}\` |
| **État git** | \`${gitStatus}\` |
| **Focus** | ${backlog.focus || "—"} |
| **Prochaine tâche backlog** | ${nextTodo} |
| **Backlog auto** | ${doneCount}/${totalBacklog} détectés comme faits |

${branchAheadBehind()}

> [!IMPORTANT]
> **Reprendre ici :** ${nextTodo}. Puis \`pnpm lint\` + \`pnpm build\`. Tester dans le [playground Circles](https://circles.gnosis.io/playground).

### Routes actives

${routes.map((r) => `- \`${r}\``).join("\n") || "_Aucune route._"}

### Navigation (\`lib/nav.ts\`)

${nav.map((n) => `- \`${n.href}\` — ${n.label}`).join("\n") || "_NAV vide._"}

### Fonctionnalités détectées

| Feature | État | Fichier |
|---------|:----:|---------|
${features.map((f) => `| ${f.label} | ${f.ok ? "done" : "todo"} | \`${f.path}\` |`).join("\n")}

### Modules clés

**lib/** — ${libCore.slice(0, 14).join(", ")}${libCore.length > 14 ? ", …" : ""}

**hooks/** — ${hooks.join(", ") || "—"}

### Backlog (source : \`docs/status.backlog.json\`)

${formatBacklog(backlog)}

### Écart vs cible \`zet\`

${zetGapTable()}

### Derniers commits

${recentCommits(6)}

### Fichiers modifiés (non commités)

${dirtyFiles()}
`;
}

function updateDoc() {
  if (!fs.existsSync(DOC)) {
    console.error("Missing", DOC);
    process.exit(1);
  }
  let content = fs.readFileSync(DOC, "utf8");
  const auto = buildAutoSection();

  if (!content.includes(AUTO_BEGIN) || !content.includes(AUTO_END)) {
    console.error("Markers STATUS:AUTO not found in", DOC);
    process.exit(1);
  }

  const re = new RegExp(
    `${escapeRe(AUTO_BEGIN)}[\\s\\S]*?${escapeRe(AUTO_END)}`,
    "m",
  );
  content = content.replace(
    re,
    `${AUTO_BEGIN}\n${auto}\n${AUTO_END}`,
  );

  fs.writeFileSync(DOC, content);
  console.log("Updated", path.relative(ROOT, DOC));
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (process.argv.includes("--hook")) {
  const p = readHookPath();
  if (!shouldUpdateFromHook(p)) process.exit(0);
}

updateDoc();
