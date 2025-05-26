<!--
 Copyright (c) 2025 KibaOfficial

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Kio-TsBot 🦊🤖

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
  Kick, ban, and timeout users with commands like `/kick`, `/ban`, and `/timeout`.

- **🎵 Music System:**  
  Play music in voice channels with commands like `/join`, `/leave`, `/play`, and more using [discord-player](https://github.com/Androz2091/discord-player) and [discord-player-youtubei](https://github.com/retrouser955/discord-player-youtubei).

- **📂 Command Templates:**  
  Easily create new commands with a template structure in `src/commands/CommandTemplate`.

- **♻️ Hot-reloading:**  
  Development mode with TypeScript and hot-reloading for fast iteration.

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