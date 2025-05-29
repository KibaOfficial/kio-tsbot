<!--
 Copyright (c) 2025 KibaOfficial

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Kio-TsBot 🦊🤖

<p align="center">
  <img src="https://raw.githubusercontent.com/KibaOfficial/kio-tsbot/master/src/assets/kio-tsbot-logo.png" alt="Kio-TsBot Logo" width="120" />
</p>

**Kio-TsBot** is the modern, modular successor to [DiscordTSBot](https://github.com/KibaOfficial/DiscordTSBot) — a Discord bot written in TypeScript. Kio-TsBot is designed for simplicity, flexibility, and extensibility, making it easy to build, customize, and scale your own Discord bot.

---

## Table of Contents

- [✨ Features](#features)
- [📦 Requirements](#requirements)
- [⚙️ Installation](#installation)
- [🚀 Usage](#usage)
- [🧩 Adding Commands](#adding-commands)
- [🌐 Hosting & Deployment](#hosting-deployment)
- [🤝 Contributing](#contributing)
- [📄 License](#license)
- [📝 Changelog](#changelog)

---

## Features

- **🧱 Modular Architecture:**  
  Effortlessly add, remove, or modify commands and features; plugin-friendly structure.

- **❤️ Shipping System:**  
  Fun shipping commands with persistent stats, including `/ship`, `/last`, `/mystats`, and `/top` for user pairings and leaderboards.

- **🧠 TypeScript First:**  
  Full type safety and modern development experience.

- **📚 Discord.js v14:**  
  Built on top of the latest Discord.js library for robust Discord API support.

- **🔐 Environment Configuration:**  
  Secure, environment-based configuration management via `.env` and [dotenv](https://www.npmjs.com/package/dotenv).

- **👨‍💻 Developer Experience:**  
  Clear structure, helpful error handling, and easy command creation.

- **💰 Economy System:**  
  Earn, spend, and play with fops 🦊 (the in-bot currency) through commands like `/balance`, `/pay`, `/daily`, and `/playgame`.

- **🛡️ Moderation Commands:**  
  Kick, ban, and timeout users with commands like `/kick`, `/ban`, `/timeout` & `/clear`.

- **🛍️ Shop and Inventory:**
  Buy, sell, and manage items with commands like `/shop`, `/buy`, `/item`, and `/inventory`.  
  Items are defined in `src/commands/shop/items.json` with properties like `name`, `desc`, `price`, `itemType`, and `emoji`.

- **🎵 Music System:**  
  Play music in voice channels with commands like `/join`, `/leave`, `/play`, and more using [discord-player](https://github.com/Androz2091/discord-player) and [discord-player-youtubei](https://github.com/retrouser955/discord-player-youtubei).

- **📜 Slash Commands:**
  Fully supports Discord's slash commands with rich interactions and autocomplete.

- **🧪 Command Loading:**
  Automatically loads commands from `src/commands/` and subfolders, allowing for organized command management.

- **📂 Command Templates:**  
  Easily create new commands with a template structure in `src/commands/CommandTemplate`.

- **♻️ Hot-reloading:**  
  Development mode with TypeScript and hot-reloading for fast iteration.

- and much much more! 🚀

---

## Requirements

- **Node.js v18.0.0 or newer** (LTS recommended) ⚡
- **Discord Bot Token** ([Get one here](https://discord.com/developers/applications) 🛠️)
- **(Optional) Git** for easy cloning and updates

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/KibaOfficial/kio-tsbot.git
   cd kio-tsbot
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set your credentials:
     - `BOT_ID` - Your bot's client (application) ID
     - `BOT_TOKEN` - Your bot's secret token
     - `GUILD_ID` - *(Development only)* Your test server's Guild ID
     - `NODE_ENV` - `development` for local testing, `production` for deployment

4. **(Optional) Discord Intents:**
   - Some features require privileged intents (e.g. `MESSAGE CONTENT INTENT`).  
     Enable these in your [Discord Developer Portal](https://discord.com/developers/applications) under your bot's settings.

---

## Usage

### 🛠 Development

Run the bot in development mode (TypeScript, with hot-reloading):
```sh
npm run dev
```

### 📦 Production

Build and start the bot:
```sh
npm run build
npm start
```

Or deploy using Docker:
```sh
docker build -t kio-tsbot .
docker run -d --name kio-tsbot -e BOT_ID=your_bot_id -e BOT_TOKEN=your_bot_token -e GUILD_ID=your_guild_id kio-tsbot
```
---

## Adding Commands

- Place new command files in `src/commands/` or subfolders (e.g. `src/commands/yourCommandCategory/`).
- Each command should export a `Command` object with a `data` property (built using `SlashCommandBuilder`) and an async `execute` function.

#### 📝 Example Command

```typescript
import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';

export const example: Command = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command'),
  async execute(interaction) {
    await interaction.reply('This is an example command!');
  },
};
```

---

## Hosting & Deployment

- Kio-TsBot can run on any Node.js-compatible environment:
  - **Railway**, **Heroku**, **Render**, **Glitch**, **Repl.it**, **VPS**, or **Docker** 🐳
- For Docker, you can use the included `Dockerfile` or create your own.
- 🔐 Keep your `.env` file secret and never commit your bot token to public repos!

---

## Contributing

Contributions, bug reports, and suggestions are very welcome!  
Feel free to open an [issue](https://github.com/KibaOfficial/kio-tsbot/issues) or [pull request](https://github.com/KibaOfficial/kio-tsbot/pulls). 🙌

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). 📜

---

## Changelog

### v0.1.15 (29 May 2025)
- 🛒 Economy system: Added support for inventory item effects and persistent item usage.
- 🏆 New "multiplier" item: Users can now use a "multiplier" item to double their slot machine winnings for 3 hours.
- 🎰 Slots game: Integrated multiplier logic so that active multipliers double slot rewards.
- 🛠️ Refactored `/item` command to use persistent inventory and item effect logic.
- 🧩 Improved inventory management: Added utility functions for adding, removing, and checking items in user inventories.
- 🧑‍💻 Type safety: Updated types and interfaces for inventory and item handling.
- 🛒 `/buy` command now uses quantity-based inventory logic for stackable items.
- 🧰 `/item` command now decrements item quantity or removes the item if last one is used.
- 📦 `/inventory` command displays item quantities.
- 🏪 `/shop` and shop data now support new item structure and display improvements.

### v0.1.14 (29 May 2025)
- First of all, i did a loooot of refactoring and code cleanup to try to keep it DRY.
  and also i just wanted to just say here 
  ```
  Just thanks to everyone who contributed to this project,
  either by helping testing the bot on my private testing server,
  or by contributing code, ideas, or just by using the bot.
  I really appreciate it! ❤️
  ```
#### 🤖 **bot.ts**
  - Added rotating status messages for the bot.
  - Improved error output for missing environment variables.
  - Unified error replies for command errors (`flags: 64` statt `ephemeral: true`).

#### 🛍️ **items.json**
  - Updated to a new item format:
    ```json
    {
      "name": "ItemDisplayName",
      "desc": "ItemDescription.",
      "price": 0,
      "itemType": "ItemTypeName",
      "emoji": "ItemEmoji"
    }
    ```

#### 🛒 **inventory.ts, buy.ts, items.ts, shop.ts**
  - Refactored to use the new `Item` data type.
  - User inventories now store an array of `Item` objects instead of strings.
  - Shop and inventory commands now display item emoji, name, and description.

#### 🎵 **music/player.ts**
  - Added a secondary extractor (`PlaydlExtractor`) using `play-dl` as a fallback if YouTube extraction fails.
  - Registered both `YoutubeiExtractor` and `PlaydlExtractor` with the music player.
  - Set a queue limit of 25 songs.

#### 🧹 **clear.ts**
  - Added a new `/clear` command for mass deleting messages in a channel (supports clearing all or a specific number).

#### 🎶 **Music System (all music commands)**
  - Moved `ensureInGuild()` to the main `utils.ts` file for consistency.
  - All music commands now use the new utility functions for permission and context checks.

#### 🎵 **play.ts, skip.ts**
  - Added logs to show which extractor is used for each song.
  - Deferred replies if the player takes too long to respond, improving UX for slow operations.

#### 💰 **economyData.ts (interfaces/econemyData.ts, data.ts)**
  - Updated the `Item` type to be more specific (includes name, desc, price, itemType, emoji, etc.).
  - Changed the `inventory` field in `UserEconomyData` from `string[]` to `Item[]`.

#### 🛡️ **types.ts**
  - Migrated command signatures from `CommandInteraction` to `ChatInputCommandInteraction`.
  - Added a new type `PermissionFlag` using `keyof typeof PermissionsBitField.Flags` for type-safe permission checks.

#### 🛠️ **utils.ts**
  - Created a new file for common utility functions, including `ensurePermissions()` and `ensureInGuild()`.

#### 🔊 **voiceUtils.ts**
  - Moved `ensureInGuild()` out; now imported from `utils.ts`.
  - Focused on voice channel utilities only.


### v0.1.13 (27 May 2025)
- ♻️ Refactored all music commands to use shared voice channel utility functions (`voiceUtils.ts`) for cleaner and more maintainable code.
- 🧹 Unified error handling and user feedback for all music commands.
- 🐛 Improved consistency and reliability of `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/queue`, `/clearqueue`, `/nowplaying`, `/loop`, `/join`, and `/leave`.
- 📦 Updated dependencies and bumped version to 0.1.13.

### v0.1.12 (27 May 2025)
- ➕ Added a [Privacy Policy](https://github.com/KibaOfficial/kio-tsbot/blob/main/PRIVACY_POLICY.md) to comply with Discord's requirements.
- ➕ Added a [Terms of Service](https://github.com/KibaOfficial/kio-tsbot/blob/main/TERMS_OF_USE.md) to outline user rights and responsibilities.

### v0.1.12 (27 May 2025)
- ❓ Added `/help` command to list all available commands with descriptions.
- Improved `bot.ts` where the command list get now attached to the bot client for easier access to all commands.
- 🐳 Modified `dockerfile` to include an installation of `ffmpeg` for the `Discord-Player` library.

### v0.1.11 (26 May 2025)
- ➕ Added: `/clearqueue` command to clear the current music queue (except the currently playing song).
- ➕ Added: `/loop` command to toggle loop mode for the current song or queue.
- 🐛 Fixed: `/pause` and `/resume` commands now properly check for current track and queue state.

### v0.1.10 (26 May 2025)
- 🐛 Fixed: `/queue` command now correctly shows the currently playing song as "Now Playing" instead of the next song in the list.
- ➕ Improved: `/skip` command now displays the next song after skipping, or a message if the queue is empty.
- ➕ Added: `/nowplaying` command to show details of the currently playing song.

### v0.1.9 (26 May 2025)
- 🎵 Added new commands for the music system:
  - `/stop`: Stop the current song
  - `/skip`: Skip the current song
  - `/queue`: View the current song queue

### v0.1.8 (26 May 2025)
- 🎵 Added `/pause` and `/resume` commands for the music system

### v0.1.7 (25 May 2025)
- 🎵 Added new Music system using [discord-player](https://github.com/Androz2091/discord-player) and [discord-player-youtubei](https://github.com/retrouser955/discord-player-youtubei):
  - `/join`: Join a voice channel
  - `/leave`: Leave the voice channel
  - `/play`: Play a song from YouTube or other sources
- Planned:
  - `/pause`, `/resume`, `/skip`, `/stop`, `/queue`, `/clearqueue`, `/nowplaying`, `/loop`

### v0.1.6 (25 May 2025)
- 🗂 Enhanced command loading with category grouping in logs  
- 🐞 Improved error handling and logging for commands

### v0.1.5 (25 May 2025)
- 🔨 Added `/ban` command  
- 🧱 Added CommandTemplate for easier command creation

### v0.1.4 (25 May 2025)
- 🎒 Added `/inventory`  
- ⚔️ Added `/kick`, `/timeout`  
- 🔧 Refactored and improved error handling

### v0.1.3 (25 May 2025)
- 🛍️ Improved shop and inventory logic  
- 🛠️ Consistent persistent data usage for economy/shipping  
- 🧹 Code cleanup and fixes

### v0.1.2 (25 May 2025)
- 🛒 `/item`, `/shop`, `/buy` commands added  
- 📦 Improved storage and usage logic

### v0.1.1 (24 May 2025)
- 💰 Initial economy system: `/balance`, `/pay`, `/daily`, `/playgames`  
- 🎰 Console logging for slot machine

### v0.0.2 (24 May 2025)
- ❤️ Shipping system with persistent data  
- 🧪 Subfolder command loading  
- 🧑‍🤝‍🧑 User mentions

### v0.0.1 (24 May 2025)
- 🧱 Initial release with basic commands  
- ⚙️ Modular, plugin-ready design  
- 🧪 TypeScript support + dotenv

---