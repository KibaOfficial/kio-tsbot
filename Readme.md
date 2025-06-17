<!--
 Copyright (c) 2025 KibaOfficial

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

| <h1 style="margin:0;">Kio-TsBot 🦊🤖</h1> | <a href="https://wakatime.com/badge/user/8300a2f0-77bf-425e-bf9d-5ceed008c503/project/2c6fc1c6-578b-4d42-bb9b-9ca419cac302"><img src="https://wakatime.com/badge/user/8300a2f0-77bf-425e-bf9d-5ceed008c503/project/2c6fc1c6-578b-4d42-bb9b-9ca419cac302.svg" alt="wakatime"></a> |
|:---|---:|

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
- [🎮 Available Commands](#available-commands)
- [🌐 Hosting & Deployment](#hosting-deployment)
- [🤝 Contributing](#contributing)
- [📄 License](#license)
- [📝 Changelog](#changelog)

---

## Features

- **🧱 Modular Architecture:**  
  Effortlessly add, remove, or modify commands and features; plugin-friendly structure.

- **🎨 Professional Response System:**  
  Unified, modern response system with rich embeds, consistent branding, and category-specific colors. All bot responses feature professional styling with the Kio-TsBot branding and bot avatar.

- **❤️ Shipping System:**  
  Fun shipping commands with persistent stats, including `/ship`, `/last`, `/mystats`, and `/top` for user pairings and leaderboards.

- **🧠 TypeScript First:**  
  Full type safety and modern development experience with strict TypeScript configuration.

- **📚 Discord.js v14:**  
  Built on top of the latest Discord.js library for robust Discord API support with modern features like MessageFlags.Ephemeral.

- **🔐 Environment Configuration:**  
  Secure, environment-based configuration management via `.env` and [dotenv](https://www.npmjs.com/package/dotenv).

- **👨‍💻 Developer Experience:**  
  Clear structure, helpful error handling, and easy command creation with centralized ResponseBuilder system.

- **💰 Economy System:**  
  Comprehensive economy with fops 🦊 currency, featuring `/balance`, `/pay`, `/daily`, and exciting casino games like `/playgame` with blackjack, coinflip, roulette, and slots. Includes multiplier items for enhanced gameplay.

- **🛡️ Moderation Commands:**  
  Professional moderation tools: `/kick`, `/ban`, `/timeout`, and `/clear` with proper permission checks and error handling.

- **🛍️ Shop and Inventory:**  
  Advanced shop system with `/shop`, `/buy`, `/item`, and `/inventory`. Features stackable items, special effects (like multipliers), and persistent inventory management.

- **🎵 Music System:**  
  Full-featured music bot with `/join`, `/leave`, `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/queue`, `/clearqueue`, `/nowplaying`, and `/loop`. Supports YouTube and multiple audio sources via [discord-player](https://github.com/Androz2091/discord-player).

- **🎮 Casino Games:**  
  Multiple gambling games including Blackjack (21), Coinflip, Roulette (European style), and Slots with realistic animations, multiplier support, and balanced payouts.

- **📜 Slash Commands:**  
  Fully supports Discord's slash commands with rich interactions, autocomplete, and organized category system.

- **❓ Interactive Help System:**  
  Advanced `/help` command with category-based navigation, dropdown menus, and emoji-organized command listings.

- **🧪 Command Loading:**  
  Automatically loads commands from `src/commands/` and subfolders with category grouping and organized command management.

- **📂 Command Templates:**  
  Easily create new commands with a template structure in `src/commands/CommandTemplate`.

- **♻️ Hot-reloading:**  
  Development mode with TypeScript and hot-reloading for fast iteration and testing.

- **🦊 Reaction Roles Panel System:**  
  Advanced reaction role system with `/panel` command. Create custom panels with multiple roles, descriptions, emoji support (unicode & custom), and persistent database storage.

- **🏠 Welcome & Leave System:**  
  Configurable welcome and goodbye messages with `/welcome` command. Supports custom channels for member join/leave notifications with professional embed styling.

- **🗃️ PostgreSQL Database:**  
  Robust database system using PostgreSQL with TypeORM, supporting docker-compose deployment and automatic migrations.

- **🐳 Docker Support:**  
  Complete Docker setup with docker-compose.yaml for easy deployment, including PostgreSQL database and health checks.

- **🛠️ Helper Scripts:**  
  PowerShell scripts for database backup/restore, Docker management, and development workflows.

- and much much more! 🚀

---

## Requirements

- **Node.js v18.0.0 or newer** (LTS recommended) ⚡
- **Discord Bot Token** ([Get one here](https://discord.com/developers/applications) 🛠️)
- **PostgreSQL Database** (Local installation or Docker) 🗃️
- **Docker & Docker Compose** (Recommended for easy setup) 🐳
- **(Optional) Git** for easy cloning and updates

---

## Installation

### 🚀 Quick Start with Docker (Recommended)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/KibaOfficial/kio-tsbot.git
   cd kio-tsbot/bot
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set your credentials:
     ```env
     BOT_ID=your_bot_client_id
     BOT_TOKEN=your_bot_secret_token
     GUILD_IDS=your_test_server_guild_id
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=kio-tsbot
     DB_PASS=your_secure_password
     DB_NAME=bot_db
     DAILY_REWARD=100
     NODE_ENV=development
     ```

3. **Start with Docker Compose:**
   ```sh
   docker-compose up -d kio-tsbot-db  # Start database only
   npm run dev                        # Start bot in development mode
   ```

### 🛠️ Manual Installation

1. **Clone and install:**
   ```sh
   git clone https://github.com/KibaOfficial/kio-tsbot.git
   cd kio-tsbot/bot
   npm install
   ```

2. **Set up PostgreSQL:**
   - Install PostgreSQL locally or use a cloud service
   - Create a database named `bot_db`
   - Create a user with appropriate permissions

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`
   - Set your Discord bot token and client ID

4. **Initialize database:**
   ```sh
   npm run dev  # This will auto-create tables on first run
   ```

### 🐳 Full Docker Deployment

For production deployment with both bot and database in Docker:

```sh
# Build and start everything
docker-compose up -d

# Check logs
docker-compose logs -f kio-tsbot
```

### 🔧 Development Setup

For development with hot-reloading:

```sh
# Start database only
docker-compose up -d kio-tsbot-db

# Start bot in development mode
npm run dev
```

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

### 🐳 Docker Deployment

Using docker-compose (recommended):
```sh
# Start everything (bot + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Or manually with Docker:
```sh
docker build -t kio-tsbot .
docker run -d --name kio-tsbot \
  -e BOT_ID=your_bot_id \
  -e BOT_TOKEN=your_bot_token \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASS=your_db_password \
  kio-tsbot
```

### 🗃️ Database Management

Helper scripts are available in the `scripts/` directory:

```sh
# Backup database
.\scripts\backup-database-docker.ps1

# Restore from backup
.\scripts\restore-backup.ps1 -BackupFile "backup-file.sql"

# Docker management helpers
.\scripts\docker-helper.ps1
```

### 🎯 Discord Setup

1. **Create a Discord Application:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" section and create a bot
   - Copy the bot token for your `.env` file

2. **Enable Required Intents:**
   - In the Bot section, enable these privileged intents:
     - `SERVER MEMBERS INTENT` (for welcome/leave events)
     - `MESSAGE CONTENT INTENT` (for some features)

3. **Invite the Bot:**
   - Go to OAuth2 > URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Administrator` (or specific permissions)
   - Use the generated URL to invite your bot
---

## Adding Commands

Kio-TsBot uses a modular command system with automatic loading and the powerful ResponseBuilder system for consistent styling.

### 📁 Command Structure

- Place new command files in `src/commands/` or subfolders (e.g. `src/commands/yourCommandCategory/`)
- Commands are automatically loaded and organized by category
- Each command should export a `Command` object with proper TypeScript typing

### 🎨 Using the ResponseBuilder System

All commands should use the centralized ResponseBuilder for consistent, professional responses:

#### 📝 Basic Command Example

```typescript
import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/types';
import { ResponseBuilder } from '../../utils/responses';

export const example: Command = {
  category: 'utils',
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command'),
  
  async execute(interaction) {
    // Success response with economy styling
    const embed = ResponseBuilder.success(
      'Command Executed!',
      'This is an example of the ResponseBuilder system.',
      interaction.client
    );
    
    await interaction.reply({ 
      embeds: [embed], 
      flags: MessageFlags.Ephemeral 
    });
  },
};
```

### 🎯 ResponseBuilder Methods

The ResponseBuilder provides category-specific styling:

```typescript
// Success/Info responses
ResponseBuilder.success(title, description, client)
ResponseBuilder.info(title, description, client)

// Error/Warning responses  
ResponseBuilder.error(title, description, client)
ResponseBuilder.warning(title, description, client)

// Category-specific responses with themed colors
ResponseBuilder.economy(title, description, client)    // Gold theme
ResponseBuilder.music(title, description, client)      // Spotify green
ResponseBuilder.moderation(title, description, client) // Red theme
ResponseBuilder.welcome(title, description, client)    // Green theme
ResponseBuilder.shippening(title, description, client) // Pink theme
ResponseBuilder.reactionRole(title, description, client) // Purple theme
```

### 🏷️ Command Categories

Organize your commands by setting the `category` property:

- `economy` - Currency and shop commands
- `music` - Music player commands  
- `moderation` - Admin/mod tools
- `utils` - Utility commands
- `games` - Fun games and entertainment
- `shippening` - Shipping system commands
- `welcome` - Welcome/leave system
- `reactionRoles` - Reaction role panels

### 🔧 Advanced Command Features

```typescript
export const advancedExample: Command = {
  category: 'economy',
  data: new SlashCommandBuilder()
    .setName('advanced')
    .setDescription('Advanced command example')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('Some input')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const input = interaction.options.getString('input', true);
      
      // Economy-themed response with custom color
      const embed = ResponseBuilder.economy(
        '💰 Economy Action',
        `You entered: ${input}`,
        interaction.client
      ).setColor('#FFD700'); // Custom gold color
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      // Consistent error handling
      const errorEmbed = ResponseBuilder.error(
        'Command Failed',
        'Something went wrong while executing this command.',
        interaction.client
      );
      
      await interaction.reply({ 
        embeds: [errorEmbed], 
        flags: MessageFlags.Ephemeral 
      });
    }
  },
};
```

### 📂 Command Templates

Use the existing commands as templates:
- **Basic Command**: `src/commands/utils/ping.ts`
- **Economy Command**: `src/commands/economy/balance.ts` 
- **Music Command**: `src/commands/music/play.ts`
- **Moderation Command**: `src/commands/moderation/kick.ts`

---

## Hosting & Deployment

Kio-TsBot is designed for flexible deployment across various platforms:

### 🌐 Supported Platforms

- **🐳 Docker** (Recommended) - Use the included `docker-compose.yaml`
- **☁️ Cloud Platforms**: Railway, Heroku, Render, DigitalOcean
- **🖥️ VPS/Dedicated Servers** - Any Linux/Windows server with Node.js
- **💻 Development Platforms**: Glitch, Repl.it (for testing)

### 🐳 Docker Deployment (Recommended)

#### Production with Docker Compose:
```yaml
# docker-compose.yaml is included and ready to use
docker-compose up -d
```

#### Custom Docker Setup:
```sh
# Build image
docker build -t kio-tsbot .

# Run with environment variables
docker run -d --name kio-tsbot \
  -e BOT_ID=your_bot_id \
  -e BOT_TOKEN=your_bot_token \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASS=your_db_password \
  -e DB_NAME=bot_db \
  --restart unless-stopped \
  kio-tsbot
```

### ☁️ Cloud Platform Deployment

#### Railway:
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Railway will automatically detect and deploy

#### Heroku:
```sh
# Install Heroku CLI, then:
heroku create your-bot-name
heroku addons:create heroku-postgresql:mini
heroku config:set BOT_TOKEN=your_token
heroku config:set BOT_ID=your_id
git push heroku main
```

#### Render:
1. Connect repository
2. Use Node.js environment
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add PostgreSQL database service

### 🛡️ Security Best Practices

- **🔐 Never commit secrets**: Use `.env` files and environment variables
- **🔒 Database Security**: Use strong passwords and restrict access
- **⚡ Environment Separation**: Use different databases for dev/prod
- **📝 Logging**: Monitor logs for errors and suspicious activity

### 📊 Production Considerations

- **Resource Requirements**: 
  - Minimum: 512MB RAM, 1 CPU core
  - Recommended: 1GB RAM, 2 CPU cores
- **Database**: PostgreSQL 12+ recommended
- **Node.js**: v18.0.0 or newer (LTS recommended)
- **Storage**: ~500MB for bot + dependencies

### 🔧 Environment Variables for Production

```env
# Required
BOT_ID=your_bot_client_id
BOT_TOKEN=your_bot_secret_token
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_secure_password
DB_NAME=bot_db

# Optional
NODE_ENV=production
DAILY_REWARD=100
GUILD_IDS=guild1,guild2  # For testing specific servers
```

### 📋 Deployment Checklist

- ✅ Environment variables configured
- ✅ Database setup and accessible
- ✅ Discord bot created and token obtained
- ✅ Required intents enabled
- ✅ Bot invited to servers
- ✅ Backup strategy in place
- ✅ Monitoring/logging configured

---

## 🎮 Available Commands

Kio-TsBot features over 30 commands organized in categories. Use `/help` in Discord for an interactive command browser!

### 💰 Economy Commands
- `/balance` - Check your fops 🦊 balance
- `/daily` - Claim your daily reward
- `/pay` - Send fops to another user
- `/inventory` - View your items
- `/playgame` - Casino games (blackjack, coinflip, roulette, slots)

### 🛍️ Shop Commands  
- `/shop` - Browse available items
- `/buy` - Purchase items from the shop
- `/item` - Use items from your inventory

### 🎵 Music Commands
- `/join` - Join your voice channel
- `/leave` - Leave the voice channel
- `/play` - Play music from YouTube/other sources
- `/pause` / `/resume` - Control playback
- `/skip` - Skip current song
- `/stop` - Stop music and clear queue
- `/queue` - View current queue
- `/clearqueue` - Clear the queue
- `/nowplaying` - Show current song info
- `/loop` - Toggle loop mode

### 🛡️ Moderation Commands
- `/kick` - Kick a user from the server
- `/ban` - Ban a user from the server  
- `/timeout` - Timeout a user
- `/clear` - Bulk delete messages

### ❤️ Shipping Commands
- `/ship` - Ship two users together
- `/last` - View last shipping result
- `/mystats` - Your shipping statistics
- `/top` - Server shipping leaderboard

### 🦊 Reaction Roles
- `/panel` - Manage reaction role panels
  - `create` - Create a new panel
  - `add` - Add roles to a panel
  - `list` - List all panels
  - `delete` - Remove a panel

### 🏠 Server Management
- `/welcome` - Configure welcome/leave messages
  - `channel` - Set welcome/leave channels

### 🔧 Utility Commands
- `/help` - Interactive command help
- `/ping` - Check bot latency
- `/invite` - Get bot invite link

### 🎮 Casino Games (via `/playgame`)
- **Blackjack** - Classic 21 card game
- **Coinflip** - Heads or tails betting
- **Roulette** - European-style roulette
- **Slots** - Lucky slot machine

*All commands feature rich embeds with consistent styling and professional branding!*

---

## Contributing

Contributions, bug reports, and suggestions are very welcome!  
Feel free to open an [issue](https://github.com/KibaOfficial/kio-tsbot/issues) or [pull request](https://github.com/KibaOfficial/kio-tsbot/pulls). 🙌

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). 📜

---

## Changelog

### v0.3.0 (17 June 2025)

#### 🎨 **Major UI/UX Overhaul**
- **ResponseBuilder System**: Introduced a centralized response system with rich embeds replacing plain text messages
- **Brand Consistency**: All bot responses now feature consistent branding with bot avatar and "Kio-TsBot" footer
- **Color Coding**: Implemented category-specific colors (Economy: Gold, Music: Spotify Green, Moderation: Red, etc.)
- **Enhanced Visuals**: All commands now use rich embeds with proper formatting and visual hierarchy

#### ⚡ **Commands Modernization**
- **30+ Commands Updated**: Migrated all major commands to use the new ResponseBuilder system
- **Economy Commands**: `balance`, `daily`, `inventory`, `pay`, `shop`, `buy` - now with rich embeds
- **Music Commands**: `play`, `queue`, `skip`, `stop`, `nowplaying`, `pause`, `resume`, `loop`, `join`, `leave`, `clearqueue` - enhanced visual feedback
- **Moderation Commands**: `kick`, `ban`, `timeout`, `clear` - professional embed styling
- **Game Commands**: `slots`, `blackjack`, `coinflip`, `roulette` - improved game experience with visual feedback
- **Utility Commands**: `ping`, `help`, `invite` - consistent branding and formatting
- **Shipping Commands**: `ship`, `mystats`, `last`, `top` - enhanced statistical displays

#### 🏗️ **Infrastructure & Database**
- **Docker Migration**: Migrated from standalone Docker container to docker-compose setup
- **PostgreSQL Upgrade**: Successfully migrated database with health checks and proper dependencies
- **Database Backup System**: Implemented automated backup scripts for data safety
- **Container Health Monitoring**: Added health checks for both bot and database services

#### 🔧 **Technical Improvements**
- **MessageFlags Modernization**: Replaced deprecated `flags: 64` with `MessageFlags.Ephemeral` across all commands
- **Event System Enhancement**: Updated `interactionCreate`, `guildMemberAdd`, `guildMemberRemove` events with ResponseBuilder
- **Service Layer Update**: Migrated `panelService.ts` to use new response system
- **Error Handling**: Standardized error responses with consistent embed styling

#### 📚 **Documentation**
- **README Overhaul**: Complete rewrite with comprehensive features overview
- **Installation Guide**: Updated with new Docker/PostgreSQL setup instructions
- **Command Documentation**: Added complete command reference with 30+ documented commands
- **Development Guide**: Enhanced with ResponseBuilder examples and best practices
- **Hosting Guide**: Expanded deployment instructions for production environments

#### 🎯 **Developer Experience**
- **Centralized Response Management**: New `ResponseBuilder` class in `src/utils/responses.ts`
- **Consistent API**: Standardized response methods across all command categories
- **Type Safety**: Enhanced TypeScript integration with proper response typing
- **Code Organization**: Better separation of concerns with utility-based response system

#### 🐛 **Bug Fixes**
- Fixed inconsistent message formatting across different command categories
- Resolved deprecated Discord.js flag usage warnings
- Improved error message consistency and user experience
- Fixed database connection issues during container transitions

#### 🔄 **Migration Notes**
- **Database**: Successfully migrated from old Docker container to new docker-compose setup
- **Backup Created**: Full database backup created and verified before migration
- **Zero Downtime**: Migration completed without data loss
- **Environment Updates**: Updated `.env` configuration for new database setup

### v0.2.4 (01 June 2025)
- 🆕 **Command Categories:** Added a `category` property to the `Command` interface and updated all commands to use it for better organization.
- ❓ **Help Command Overhaul:** `/help` now displays a category selection menu with emojis and shows commands grouped by category. Users can browse commands interactively using a dropdown menu.
- 🛠️ **Utility Improvements:** Added `formatCommandsDescription` utility for formatting command lists, used in the help system.
- ⚡ **Interaction Handling:** Updated the interaction handler to support the new help menu dropdown and category navigation.
- 🧩 **Dev Dependencies:** Added `ts-node` to dev dependencies in `package.json` and `package-lock.json`.
- ⬆️ **Version Bump:** Updated version to 0.2.4 in `package.json` and `package-lock.json`.

### v0.2.3 (31 May 2025)
- 🦊 **Reaction Role Types:** Added a `type` column to the `ReactionRole` entity. Roles can now be either `normal` (toggle add/remove) or `verify` (one-time add, reaction is removed instantly for permanent roles).
- 🛡️ **Panel Command:** `/panel` command and backend now support the new `type` option for reaction roles (normal/verify). Type is checked when adding reaction roles.
- 🔄 **Reaction Handling:**
  - `messageReactionAdd` now removes the reaction if the type is `verify`.
  - `messageReactionRemove` skips role removal if the bot removed the reaction (for verify roles).
- 🏠 **Welcome/Leave System:**
  - Added a new `Guild` entity to store `welcomeChannelId` and `leaveChannelId` for each server.
  - Added `/welcome` command to configure welcome/leave channels.
  - `guildMemberAdd` and `guildMemberRemove` events now send welcome/goodbye messages if configured.
  - `guildCreate` event initializes the guild in the database on join.
- ⚙️ **Database Improvements:**
  - Added `NODE_ENV` check to the DataSource constructor to automatically disable `synchronize` in production for safety.
- 🛠️ **Misc:**
  - Improved type safety and logic for reaction role assignment and removal.
  - Various bugfixes and code cleanup in event and service layers.

### v0.2.2 (31 May 2025)
- 🏗️ **Core Refactor:** Replaced `src/bot.ts` with a new modular entrypoint (`src/index.ts`) and a dedicated `TsBot` class (`src/TsBot.ts`) for improved structure and maintainability. Wich kills the process every 24 hours to restart it. 
- 🗃️ **Project Structure:** All bot initialization, command/event loading, and login logic is now encapsulated in `TsBot`, making the codebase easier to extend and test.
- 🛠️ **Scripts:** Updated `package.json` scripts to use `src/index.ts` as the main entry point for both development and production.
- 🏷️ **Version:** Bumped version to `0.2.2` in `package.json` and `package-lock.json`.

### v0.2.1 (31 May 2025)
- 🆕 **Reaction Roles Panel System:**
  - Introduced `/panel` command for creating, listing, adding, and deleting reaction role panels.
  - Panels support multiple roles, custom names, descriptions, and emoji (unicode or custom).
  - Roles are managed via a persistent database structure (`ReactionRolePanel`, `ReactionRole` entities).
  - Users can self-assign or remove roles by reacting to panel messages.
  - Panel and role data is stored per-guild for easy management.
- ⚡ **Event Logic:**
  - Added robust event handlers for `messageReactionAdd` and `messageReactionRemove` to grant/remove roles based on panel configuration.
  - Improved logging and error handling for all reaction role events.
  - Ensured correct emoji matching for both unicode and custom emoji, with fallback and error output for mismatches.
- 🛠️ **Developer Experience:**
  - Centralized utility functions for permission and guild checks.
  - Improved type safety and JSDoc comments across new panel and event logic.
  - Enhanced modularity for future feature expansion (panelService, entity separation).
  - All panel and reaction role logic is fully type-safe and uses modern TypeScript best practices.
- 🗃️ **Database & Persistence:**
  - New entities: `ReactionRolePanel` and `ReactionRole` for persistent storage of panels and roles.
  - Panels and roles are loaded with relations for efficient access and management.
- 🧩 **Command Structure:**
  - `/panel` command includes subcommands for create, add, remove, list, and delete.
  - All subcommands include permission checks and detailed error output.
- 🧪 **Testing & Logging:**
  - Extensive logging for all panel and reaction role operations.
  - Improved error output for partial message/reaction fetches and permission issues.

### v0.2.0 (29 May 2025)
- 🚀 **Major Refactor & API Consistency:**
  - Unified all economy functions: `addItem`, `removeItem`, and related methods now consistently use `userId: string` as a parameter.
  - Consistent behavior: User and inventory are now always auto-initialized if they do not exist.
  - Improved error handling and logging for all economy and shop operations.
- 🛒 **Inventory & Shop System:**
  - Completely reworked inventory logic for items and quantities (stacking, quantity, defensive checks).
  - `/buy` and `/item` commands now use the new, robust item and inventory logic.
  - Items are decremented or removed correctly when used.
  - Shop and inventory commands display item emojis, names, and descriptions.
- 💰 **Economy Core:**
  - All economy commands now auto-initialize user data if the user does not exist.
  - Improved typing for User, Inventory, and Items.
  - Consistent and safe database operations for all economy and shop commands.
- ❤️ **Shipping System:**
  - `/mystats` and `/top` now show shipping statistics and leaderboards with robust fallback for deleted users.
  - Improved display and error handling for missing shipping data.
- 🧹 **Code Cleanup:**
  - Major refactor for better readability, maintainability, and DRY principle.
  - Utility functions for user initialization and permission checks are now centralized.
- 🧑‍💻 **Developer Experience:**
  - All economy and shop commands are now consistent and easy to extend.
  - Improved JSDoc comments and types for all core functions.

**Note:**
> This version contains breaking changes for anyone directly accessing the economy or inventory APIs. Please check your own extensions and integrations!

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
  - Unified error replies for command errors (`flags: MessageFlags.Ephemeral` statt `ephemeral: true`).

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