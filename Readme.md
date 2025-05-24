<!--
 Copyright (c) 2025 KibaOfficial

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Kio-TsBot

**Kio-TsBot** is the modern, modular successor to [DiscordTSBot](https://github.com/KibaOfficial/DiscordTSBot) — a Discord bot written in TypeScript. Kio-TsBot is designed for simplicity, flexibility, and extensibility, making it easy to build, customize, and scale your own Discord bot.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Adding Commands](#adding-commands)
- [Hosting & Deployment](#hosting--deployment)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

---

## Features

- **Modular Architecture:**  
  Effortlessly add, remove, or modify commands and features; plugin-friendly structure.

- **Shipping System:**  
  Fun shipping commands with persistent stats, including `/ship`, `/last`, `/mystats`, and `/top` for user pairings and leaderboards.

- **TypeScript First:**  
  Full type safety and modern development experience.

- **Discord.js v14:**  
  Built on top of the latest Discord.js library for robust Discord API support.

- **Environment Configuration:**  
  Secure, environment-based configuration management via `.env` and [dotenv](https://www.npmjs.com/package/dotenv).

- **Developer Experience:**  
  Clear structure, helpful error handling, and easy command creation.

- **Economy System:**  
  Earn, spend, and play with fops 🦊 (the in-bot currency) through commands like `/balance`, `/pay`, `/daily`, and `/playgame`.

---

## Requirements

- **Node.js v18.0.0 or newer** (LTS recommended)
- **Discord Bot Token** ([Get one here](https://discord.com/developers/applications))
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

### Development

Run the bot in development mode (TypeScript, with hot-reloading):
```sh
npm run dev
```

### Production

Build and start the bot:
```sh
npm run build
npm start
```

---

## Adding Commands

- Place new command files in `src/commands/` or subfolders (e.g. `src/commands/yourCommandCategory/`).
- Each command should export a `Command` object with a `data` property (built using `SlashCommandBuilder`) and an async `execute` function.

#### Example Command

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
  - **Railway**, **Heroku**, **Render**, **Glitch**, **Repl.it**, **VPS**, or **Docker**.
- For Docker, you can use the included `Dockerfile` or create your own.
- Make sure to keep your `.env` file secret and never commit your bot token to public repos!

---

## Contributing

Contributions, bug reports, and suggestions are very welcome!  
Feel free to open an [issue](https://github.com/KibaOfficial/kio-tsbot/issues) or [pull request](https://github.com/KibaOfficial/kio-tsbot/pulls).

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Changelog

### v0.1.2 (25 May 2025)
- added `/item` command: Use items from your inventory
- added `/shop` command: View available items in the shop and their descriptions
- added `/buy` command: Purchase items from the shop using fops 🦊
- Improved inventory management and item usage logic
- Refined persistent storage for inventory and shop data
- Bug fixes and internal refactoring

### v0.1.1 (24 May 2025)

- Added economy system with fops 🦊 as the currency
- `/balance`, `/pay`, `/daily`, and `/playgames` commands for managing and playing with fops
- Console logging for slot machine activity
- Refactored codebase to consistently use fops 🦊 as the currency

### v0.0.2 (24 May 2025)

- Added new shipping system with persistent stats and commands:
  - `/ship`: randomly ships two users and saves the pair
  - `/last`: shows the last shipped pair
  - `/mystats`: shows how often a user has been shipped
  - `/top`: displays the top 5 most shipped pairs
- Added persistent storage for shipping data
- Improved command loading to support subfolders
- User mentions in shipping replies

### v0.0.1 (24 May 2025)

- Initial release
- Basic command structure with `ping` and `invite`
- Modular, plugin-ready design
- TypeScript support with strong typing
- Environment variable management via dotenv