import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = process.argv[2];
const checksumArg = process.argv.find(arg => arg.startsWith('--checksum='));
const checksum = checksumArg?.replace('--checksum=', '');

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error('Usage: node scripts/prepare-plugin-release.mjs <x.y.z> [--checksum=<sha256>]');
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDate = process.env.RELEASE_DATE ?? new Date().toISOString().slice(0, 10);

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function writeText(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
}

function updateJson(relativePath, update) {
  const filePath = path.join(root, relativePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  update(data);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

updateJson('headlamp-plugin/package.json', data => {
  data.version = version;
});

updateJson('headlamp-plugin/package-lock.json', data => {
  data.version = version;
  if (data.packages?.['']) {
    data.packages[''].version = version;
  }
});

let artifactHub = readText('headlamp-plugin/artifacthub-pkg.yml')
  .replace(/^version: .+$/m, `version: ${version}`)
  .replace(/version: \d+\.\d+\.\d+/g, `version: ${version}`)
  .replace(
    /releases\/download\/v[^/]+\/headlamp-theme-builder-[^"]+\.tar\.gz/g,
    `releases/download/v${version}/headlamp-theme-builder-${version}.tar.gz`
  );

if (checksum) {
  artifactHub = artifactHub.replace(
    /headlamp\/plugin\/archive-checksum: "SHA256:[^"]+"/,
    `headlamp/plugin/archive-checksum: "SHA256:${checksum}"`
  );
}

writeText('headlamp-plugin/artifacthub-pkg.yml', artifactHub);

const pluginReadme = readText('headlamp-plugin/README.md')
  .replace(/version: \d+\.\d+\.\d+/g, `version: ${version}`)
  .replace(
    /headlamp-theme-builder-\d+\.\d+\.\d+\.tar\.gz/g,
    `headlamp-theme-builder-${version}.tar.gz`
  )
  .replace(/The v\d+\.\d+\.\d+ release tarball/g, `The v${version} release tarball`);

writeText('headlamp-plugin/README.md', pluginReadme);

const deploymentGuide = readText('headlamp-plugin/DEPLOYMENT.md').replace(
  /version: \d+\.\d+\.\d+/g,
  `version: ${version}`
);

writeText('headlamp-plugin/DEPLOYMENT.md', deploymentGuide);

let changelog = readText('CHANGELOG.md');
const releaseHeading = `## v${version} - ${releaseDate}`;

if (changelog.includes('## Unreleased')) {
  changelog = changelog.replace('## Unreleased', releaseHeading);
} else if (!changelog.includes(`## v${version}`)) {
  throw new Error(`CHANGELOG.md has no Unreleased section or v${version} section`);
}

writeText('CHANGELOG.md', changelog);
