// Copyright (c) 2025 KibaOfficial
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { CommandInteraction, MessageFlags } from "discord.js";
import { addMoney, removeMoney } from "../data";

const slotEmojis = [
  { emoji: "🍒", multiplier: 3 },
  { emoji: "🍋", multiplier: 2 },
  { emoji: "🍊", multiplier: 1.5 },
  { emoji: "🍉", multiplier: 1.2 },
  { emoji: "🍇", multiplier: 1.1 },
  { emoji: "7️⃣", multiplier: 5 },
]

function getRandomEmoji() {
  const index = Math.floor(Math.random() * slotEmojis.length);
  return slotEmojis[index].emoji;
}

export async function playSlots(interaction: CommandInteraction, bet: number) {
  const userId = interaction.user.id;

  try {
    await removeMoney(userId, bet);
  } catch (error) {
    console.error(`[SLOTS] Error removing money for user ${userId}:`, error);
    await interaction.reply({
      content: `❌ You don't have enough fops 🦊 to play! You need at least ${bet} fops 🦊.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const spin = [
    getRandomEmoji(),
    getRandomEmoji(),
    getRandomEmoji(),
  ]
  const [first, second, third ] = spin;
  console.log(`[SLOTS] User ${userId} spun: ${spin.join(" ")}`);


  let win = false;
  let reward = 0;

  if (first === second && second === third) {
    win = true;
    const match = slotEmojis.find((e) => e.emoji === first);
    const multiplier = match?.multiplier ?? 1;
    reward = Math.floor(bet * multiplier);
    await addMoney(userId, reward);
    console.log(`[SLOTS] User ${userId} won ${reward} fops 🦊!`);
  } else {
    console.log(`[SLOTS] User ${userId} lost ${bet} fops 🦊.`);
  }

  await interaction.reply({
    content:
      `🎰 **Slot Machine** 🎰\n` +
      (win
        ? `**You win!** You got ${spin.join(" ")} and earned **${reward} fops 🦊**!`
        : `**You lost ${bet} fops 🦊.** You got ${spin.join(" ")}. Better luck next time!`),
  });
}
