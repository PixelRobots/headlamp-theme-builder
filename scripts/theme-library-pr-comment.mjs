import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const shouldPost = args.includes('--post');
const positionalArgs = args.filter(arg => arg !== '--post');
const [filesPath, outputPath = 'theme-library-pr-comment.md'] = positionalArgs;
const marker = '<!-- headlamp-theme-builder:community-preview -->';
const previewSource = process.env.PREVIEW_SOURCE === 'artifact' ? 'artifact' : 'branch';

function markdownEscape(value) {
  return String(value ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
}

function isCommunityThemeFile(file) {
  return /^library\/themes\/[^/]+\.json$/.test(file.replaceAll('\\', '/'));
}

async function readChangedFiles() {
  if (!filesPath) {
    return fetchPrChangedFiles();
  }

  const content = await readFile(filesPath, 'utf8').catch(() => '');
  return content
    .split(/\r?\n/)
    .map(file => file.trim())
    .filter(Boolean)
    .filter(isCommunityThemeFile);
}

async function githubApi(pathname, options = {}) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN or GH_TOKEN is required.');
  }

  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function fetchPrChangedFiles() {
  const repository = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;
  if (!repository || !prNumber) {
    return [];
  }

  const files = [];
  let page = 1;

  while (true) {
    const batch = await githubApi(`/repos/${repository}/pulls/${prNumber}/files?per_page=100&page=${page}`);
    files.push(...batch.map(file => file.filename));

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return files.filter(isCommunityThemeFile);
}

function rawUrl(relativePath) {
  const repository = process.env.GITHUB_REPOSITORY;
  const headSha = process.env.PR_HEAD_SHA || process.env.GITHUB_SHA || 'main';
  return `https://raw.githubusercontent.com/${repository}/${headSha}/${relativePath}`;
}

function tableRow(entry) {
  const modes = entry.themes.map(theme => theme.base);
  const previewImages = modes.map(mode => {
    if (previewSource === 'artifact') {
      return `generated ${mode} preview`;
    }

    const previewPath = `library/previews/${entry.id}-${mode}.svg`;
    return `![${markdownEscape(entry.name)} ${mode} preview](${rawUrl(previewPath)})`;
  });
  const previews = previewImages.join('<br>');
  const tags = Array.isArray(entry.tags) ? entry.tags.join(', ') : '';

  return {
    previews: previewImages.join('\n\n'),
    row: `| ${previews} | \`${markdownEscape(entry.id)}\` | ${markdownEscape(entry.name)} | ${markdownEscape(entry.description)} | community | ${markdownEscape(modes.join(', '))} | ${markdownEscape(tags)} |`,
  };
}

async function main() {
  const changedFiles = await readChangedFiles();
  const rows = [];
  const previews = [];

  for (const file of changedFiles) {
    const entry = JSON.parse(await readFile(path.join(repoRoot, file), 'utf8'));
    const themeComment = tableRow(entry);
    previews.push(themeComment.previews);
    rows.push(themeComment.row);
  }

  if (rows.length === 0) {
    await writeFile(outputPath, '');
    return;
  }

  const previewIntro = previewSource === 'artifact'
    ? 'Generated preview files are attached to this workflow run as the `theme-library-catalog` artifact.'
    : `Community theme preview for review:\n\n${previews.join('\n\n')}`;

  const body = `${marker}
${previewIntro}

Generated README catalog row:

| Preview | ID | Theme | Description | Source | Modes | Tags |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}
`;

  await writeFile(outputPath, body);

  if (shouldPost) {
    await postComment(body).catch(async error => {
      if (!String(error.message).includes('403')) {
        throw error;
      }

      console.warn(`Could not post community theme preview comment: ${error.message}`);
      console.warn('The comment markdown was generated successfully but the GitHub token cannot write PR comments in this run.');
      await appendStepSummary(body);
    });
  }
}

await main();

async function postComment(body) {
  const repository = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;
  if (!repository || !prNumber) {
    throw new Error('GITHUB_REPOSITORY and PR_NUMBER are required to post a comment.');
  }

  const comments = await githubApi(`/repos/${repository}/issues/${prNumber}/comments?per_page=100`);
  const existingComment = comments.find(comment => comment.body?.includes(marker));

  if (existingComment) {
    await githubApi(`/repos/${repository}/issues/comments/${existingComment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    });
    return;
  }

  await githubApi(`/repos/${repository}/issues/${prNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

async function appendStepSummary(body) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  const { appendFile } = await import('node:fs/promises');
  await appendFile(summaryPath, `## Community Theme Preview\n\n${body}\n`);
}
