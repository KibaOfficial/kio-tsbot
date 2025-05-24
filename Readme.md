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
- [Installation](#installation)
- [Usage](#usage)
- [Adding Commands](#adding-commands)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

---

## Features

- **Modular Architecture:**  
  Effortlessly add, remove, or modify commands and features; plugin-friendly structure.

- **TypeScript First:**  
  Full type safety and modern development experience.

- **Discord.js v14:**  
  Built on top of the latest Discord.js library for robust Discord API support.

- **Environment Configuration:**  
  Secure, environment-based configuration management via `.env` and [dotenv](https://www.npmjs.com/package/dotenv).

- **Developer Experience:**  
  Clear structure, helpful error handling, and easy command creation.

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

- Place new command files in `src/commands/` following the examples (`ping.ts`, `invite.ts`).
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

## Contributing

Contributions, bug reports, and suggestions are very welcome!  
Feel free to open an [issue](https://github.com/KibaOfficial/kio-tsbot/issues) or [pull request](https://github.com/KibaOfficial/kio-tsbot/pulls).

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Changelog

### v0.0.1 (24 May 2025)

- Initial release
- Basic command structure with `ping` and `invite`
- Modular, plugin-ready design
- TypeScript support with strong typing
- Environment variable management via dotenv
