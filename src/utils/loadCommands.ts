// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Command } from '../interfaces/types';
import { join, extname } from 'path';
import { promises as fs } from 'fs';

export async function loadCommands(dir: string): Promise<Command[]> {
  let commands: Command[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      commands = commands.concat(await loadCommands(fullPath));
    } else if (['.js', '.ts'].includes(extname(entry.name))) {
      try {
        const mod = require(fullPath);
        const cmd: Command = mod.default ?? Object.values(mod)[0];
        if (cmd && cmd.data && cmd.data.name) {
          commands.push(cmd);
        }
      } catch (err) {
        console.error(`Error loading Command "${fullPath}":`, err);
      }
    }
  }
  return commands;
}