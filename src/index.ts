// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { TsBot } from "./TsBot";

/**
 * Main entry point for the bot.
 * Initializes the bot and starts it.
 * @function start
 * @description Creates an instance of TsBot and starts it.
 * @example
 * const bot = new TsBot();
 * bot.start();
 */
const bot = new TsBot()
bot.start()

// restart the bot every 24 hours by killing the process
setInterval(() => {
  process.exit(0);
}, 24 * 60 * 60 * 1000); // 24 hours in milliseconds