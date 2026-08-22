import { spawn } from 'node:child_process';
import { existsSync, watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import toml from 'toml';

const workspaceDirectory = process.cwd();
const yarnPath = process.env.npm_execpath;

if (!yarnPath) {
  throw new Error('This watcher must be started from a Yarn script');
}

async function getRelativePathsFromCargoToml(
  directory = './',
  paths = new Map()
) {
  const cargoDirPath = path.resolve(workspaceDirectory, directory);
  const cargoFilePath = path.join(cargoDirPath, 'Cargo.toml');

  if (!existsSync(cargoFilePath)) {
    return paths;
  }

  const cargoFileString = await readFile(cargoFilePath, 'utf-8');
  const cargoFile = toml.parse(cargoFileString);

  const libName = cargoFile.lib.name ?? cargoFile.package.name;
  const libPath = path.join(cargoDirPath, cargoFile.lib.path, '..');

  paths.set(libName, libPath);

  for (const dependency of Object.values(cargoFile.dependencies)) {
    if (dependency.path) {
      await getRelativePathsFromCargoToml(dependency.path, paths);
    }
  }

  return Array.from(paths.values());
}

const watchDirectories = await getRelativePathsFromCargoToml();

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
