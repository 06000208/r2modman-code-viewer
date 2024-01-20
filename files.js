import { join } from "path";
import { workingDirectory, buildDirectory } from "./constants.js";

const featherIcons = [workingDirectory, "node_modules", "feather-icons", "dist", "icons"];

/**
 * Files, typically under node_modules, to be included in the build
 * @type {[string, string][]}
 */
export const files = [
    [
        join(...featherIcons, "clipboard.svg"),
        join(buildDirectory, "lib", "clipboard.svg"),
    ],
    [
        join(...featherIcons, "x.svg"),
        join(buildDirectory, "lib", "x.svg"),
    ],
    [
        join(...featherIcons, "check.svg"),
        join(buildDirectory, "lib", "check.svg"),
    ],
];
