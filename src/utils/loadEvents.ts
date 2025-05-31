// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Client } from "discord.js";
import { promises as fs } from "fs";
import { extname, join } from "path";
import { BotEvent } from "../interfaces/types";

export async function loadEvents(
  client: Client,
  dir: string,
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await loadEvents(client, fullPath);
    } else if (['.js', '.ts'].includes(extname(entry.name))) {
      try {
        const mod = require(fullPath);
        const event: BotEvent = mod.default ?? Object.values(mod)[0];
        if (event && typeof event.execute === 'function' && event.name) {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
          } else {
            client.on(event.name, (...args) => event.execute(...args));
          }
          console.log(`[EventLoader] Registered event: ${event.name} (${event.once ? "once" : "on"})`);
        }
      } catch (error) {
        console.error(`[EventLoader] Error loading event "${fullPath}":`, error);
      }
    }
  }
}