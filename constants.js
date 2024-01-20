import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** The working directory for the build script */
export const workingDirectory = dirname(fileURLToPath(import.meta.url));

/** The directory containing source code */
export const srcDirectory = join(workingDirectory, "src");

/** The source code directory path as an array of path segments */
export const srcSegments = srcDirectory.split(sep);

/** The directory for the built output */
export const buildDirectory = join(workingDirectory, "build");

/** The build path as an array of path segments */
export const buildSegments = buildDirectory.split(sep);
