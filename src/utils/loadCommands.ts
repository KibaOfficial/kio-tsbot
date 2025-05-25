// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Command } from "../interfaces/types";
import { join, extname, relative, sep } from "path";
import { promises as fs } from "fs";

/**
 * Recursively loads command files from the specified directory.
 * 
 * @param dir - The directory to load commands from.
 * @param baseDir - The base directory for relative paths (default is the same as dir).
 * @returns A promise that resolves to an array of commands with their categories.
 */
export async function loadCommands(
  dir: string,
  baseDir: string = dir
): Promise<(Command & { category: string })[]> {
  let commands: (Command & { category: string })[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      commands = commands.concat(await loadCommands(fullPath, baseDir));
    } else if (['.js', '.ts'].includes(extname(entry.name))) {
      try {
        const mod = require(fullPath);
        const cmd: Command = mod.default ?? Object.values(mod)[0];
        if (cmd && cmd.data && cmd.data.name) {
          const relPath = relative(baseDir, fullPath);
          const parts = relPath.split(sep);
          const category = parts.length > 1 ? parts[0] : 'misc';
          commands.push({ ...cmd, category});
        }
      } catch (error) {
        console.error(`[CommandLoader] Error loading Command "${fullPath}":`, error);
      }
    }
  }
  return commands;
}
