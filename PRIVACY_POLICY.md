<!--  Copyright (c) 2025 KibaOfficial

This software is released under the MIT License.
https://opensource.org/licenses/MIT -->

# Privacy Policy

_Last updated: May 31, 2025_

This privacy policy applies to the Discord bot **Kio-TsBot** (including "Kio-TsBot(Dev)"), operated by **KibaOfficial**.

## What Data Is Collected?

- **Discord User IDs**  
  The bot stores Discord user IDs to provide features such as the economy system and the shipping ("shippening") service.

- **Economy Data**  
  For each user, the following data is stored in the database:
  - Discord User ID (as the primary key)
  - Balance (number)
  - Inventory (an array of item objects, each with name, description, price, type, emoji, and quantity)
  - Last daily reward timestamp (number, optional)
  - Multiplier expiration timestamp (number, optional)
  Example structure:
  ```json
  {
    "id": "123456789012345678",
    "balance": 1000,
    "inventory": [
      {
        "name": "Nickname Change",
        "desc": "Allows you to change the nickname of the bot.",
        "price": 500,
        "itemType": "nickname_change",
        "emoji": ":pencil:",
        "quantity": 1
      }
    ],
    "lastDaily": 1716760800000,
    "multiplierExpiresAt": 1716847200000
  }
  ```

- **Shipping (Shippening) Data**  
  For each server (guild), the following is stored:
  - Guild ID (as the primary key)
  - Last paired user IDs (array of two Discord user IDs)
  - Pairing counts (object mapping user ID pairs to the number of times they were matched)
  Example structure:
  ```json
  {
    "id": "987654321098765432",
    "lastPair": ["123456789012345678", "234567890123456789"],
    "pairsCount": {
      "123456789012345678-234567890123456789": 3
    }
  }
  ```

- **Shop Data**  
  The shop contains a list of available items, each with name, description, price, type, emoji, and quantity. This data is not directly linked to personal data, but is referenced in user inventories.

- **No Other Personal Data**  
  No personal information such as real names, email addresses, or Discord messages is collected or stored. Only Discord IDs and data necessary for bot features are processed.

## How Is Your Data Used?

- Your Discord user ID and related economy data are used only to provide bot features such as balances, inventories, and daily rewards.
- For the "shipping" feature, the bot randomly pairs user IDs for entertainment purposes.

## Where Is Your Data Stored?

- All data is stored on a private server located in Germany, within the European Union, inside a local SQLite database file. Some fields (like inventory or shipping pairs) are stored as JSON objects within this database.
- The bot runs in a Docker container; no data is transmitted outside the operator's private infrastructure.

## Third Parties

- **No Data Sharing:**  
  No user data is shared with any third parties, partners, or analytics services.

## Data Security

- All reasonable measures are taken to keep your data safe on the server.
- However, as this is a private hobby project, absolute security cannot be guaranteed.

## Data Removal

- To request data removal, contact the operator via email or Discord with your user ID. Your data will be deleted within a reasonable timeframe.

## Contact

- Email: [kiba@kibaofficial.net](mailto:kiba@kibaofficial.net)
- Discord: KibaOfficial

## Changes

This privacy policy may be updated in the future. Please check back for updates.

© 2025 KibaOfficial. All rights reserved.