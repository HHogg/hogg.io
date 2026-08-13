import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const workspaceDirectory = process.cwd();
const yarnPath = process.env.npm_execpath;

if (!yarnPath) {
  throw new Error('This watcher must be started from a Yarn script');
}

const watchDirectories = (await readFile('watch-dirs.txt', 'utf8'))
  .split('\n')
  .map((directory) => directory.trim())
  .filter(Boolean)
  .map((directory) => path.resolve(workspaceDirectory, directory));

let activeBuild;
let buildPending = false;
let debounceTimeout;

const runBuild = () => {
  if (activeBuild) {
    buildPending = true;
    return;
  }

  activeBuild = spawn(yarnPath, ['run', 'build'], {
    cwd: workspaceDirectory,
    stdio: 'inherit',
  });

  activeBuild.once('error', (error) => {
    console.error(
      `Unable to rebuild ${path.basename(workspaceDirectory)}:`,
      error
    );
  });

  activeBuild.once('exit', (code) => {
    activeBuild = undefined;

    if (code !== 0) {
      console.error(`Rebuild exited with code ${code}`);
    }

    if (buildPending) {
      buildPending = false;
      runBuild();
    }
  });
};

const watchers = watchDirectories.map((directory) =>
  watch(directory, { recursive: true }, () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(runBuild, 100);
  })
);

console.log(
  `Watching ${watchDirectories.length} directories for ${path.basename(
    workspaceDirectory
  )}`
);

const stop = (signal) => {
  clearTimeout(debounceTimeout);
  watchers.forEach((watcher) => watcher.close());

  if (activeBuild) {
    activeBuild.kill(signal);
  }

  process.exit(0);
};

process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
