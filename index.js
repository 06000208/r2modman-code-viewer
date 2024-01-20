// Build script

import { join, sep } from "node:path";
import { argv } from "node:process";
import { stat } from "node:fs/promises";
import { build as esbuild } from "esbuild";
import { copy, ensureDir, remove } from "fs-extra";
import FileHound from "filehound";
import { files } from "./files.js";
import { srcDirectory, srcSegments, buildDirectory, buildSegments } from "./constants.js";

// Create build directory
await ensureDir(buildDirectory);

/** Whether or not this is a development build */
const devBuild = argv[2] === "--dev";

/** Files to be copied over */
const copyableSourceFiles = await FileHound.create()
    .paths(srcDirectory)
    .ext([".html", ".css", ".json", ".png", ".svg"])
    .discard("jsconfig.json")
    .discard(".eslintrc.json")
    .find();

/** Files in the build directory which may have been previously copied or built */
const existingFiles = await FileHound.create()
    .paths(buildDirectory)
    .ext([".html", ".css", ".js", ".json", ".png", ".svg"])
    .find();

/**
 * Swaps the source directory to the build directory in a given file path
 * @param {string} filePath
 * @returns {string}
 */
const pathToBuildPath = (filePath) => join(...buildSegments.concat(filePath.split(sep).slice(srcSegments.length)));

/** Pairs of source to destination file paths to be copied */
const pendingCopies = [
    ...copyableSourceFiles.map(filePath => [
        filePath,
        pathToBuildPath(filePath),
    ]),
    // External files, such as those installed with npm i
    ...files,
];

// Copy files over which have don't have the same size and last modified time
for (const [source, destination] of pendingCopies) {
    if (existingFiles.includes(destination)) {
        const { size: sourceSize, mtime: sourceModifiedTime } = await stat(source);
        const { size: destSize, mtime: destModifiedTime } = await stat(destination);
        if (sourceSize === destSize && sourceModifiedTime.getTime() === destModifiedTime.getTime()) continue;
    }
    console.log("Copying", source, "to", destination);
    copy(source, destination);
}

/** Entry points for esbuild */
const entryPoints = await FileHound.create()
    .paths(srcDirectory)
    .ext(".js")
    .depth(0)
    .find();

/** Set of the intended resulting files of this build */
const resultingFiles = new Set([
    ...pendingCopies.map((pair) => pair[1]),
    ...entryPoints.map(filePath => pathToBuildPath(filePath)),
]);

/** Files which may be removed from the build directory */
const removableFiles = existingFiles.filter((filePath) => !resultingFiles.has(filePath));

// Remove files which aren't part of the build
for (const filePath of removableFiles) {
    console.log("Removing", filePath);
    await remove(filePath);
}

// Build javascript modules with esbuild
const { outputFiles, metafile, mangleCache, ...buildResult } = await esbuild({
    entryPoints: entryPoints,
    outdir: "./build",
    format: "esm",
    minify: !devBuild,
    bundle: true,
    banner: {
        js: "/* This is a bundled file generated by esbuild\nIf you want to view the source, please visit the github repository */",
    },
});

console.log("esbuild", buildResult);
