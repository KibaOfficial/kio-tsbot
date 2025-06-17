// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { addMoney, removeMoney } from "../data";
import { AppDataSource } from "../../../utils/data/db";
import { User } from "../../../utils/data/entity/User";
import { ResponseBuilder } from "../../../utils/responses";

// Card definitions for Blackjack
interface Card {
  suit: string;
  rank: string;
  value: number;
}

const suits = ["♠️", "♥️", "♦️", "♣️"];
const ranks = [
  { rank: "A", value: 11 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 10 },
  { rank: "Q", value: 10 },
  { rank: "K", value: 10 },
];

/**
 * Creates a standard deck of 52 cards.
 * @returns {Card[]} An array of cards representing a full deck.
 */
function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank: rank.rank,
        value: rank.value,
      });
    }
  }
  return deck;
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm.
 * @param {Card[]} deck - The deck to shuffle.
 * @returns {Card[]} The shuffled deck.
 */
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculates the value of a hand, handling Aces appropriately.
 * @param {Card[]} hand - The hand to calculate.
 * @returns {number} The total value of the hand.
 */
function calculateHandValue(hand: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === "A") {
      aces++;
      value += 11;
    } else {
      value += card.value;
    }
  }

  // Convert Aces from 11 to 1 if necessary to avoid busting
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

/**
 * Formats a hand of cards for display.
 * @param {Card[]} hand - The hand to format.
 * @returns {string} A formatted string representation of the hand.
 */
function formatHand(hand: Card[]): string {
  return hand.map(card => `${card.rank}${card.suit}`).join(" ");
}

/**
 * Determines the best dealer play (hit or stand).
 * Dealer hits on 16 or less, stands on 17 or more.
 * @param {Card[]} dealerHand - The dealer's current hand.
 * @returns {boolean} True if dealer should hit, false if should stand.
 */
function shouldDealerHit(dealerHand: Card[]): boolean {
  return calculateHandValue(dealerHand) < 17;
}

/**
 * Plays a game of Blackjack.
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction.
 * @param {number} bet - The amount the user is betting.
 * @param {boolean} activeMultiplier - Whether the user has an active multiplier.
 * @returns {Promise<void>}
 */
export async function playBlackjack(
  interaction: ChatInputCommandInteraction,
  bet: number,
  activeMultiplier: boolean = false
): Promise<void> {
  const userId = interaction.user.id;
  console.log(`[BLACKJACK] User ${userId} is playing blackjack with a bet of ${bet} fops 🦊.`);

  // Get user from database
  const userRepo = AppDataSource.getRepository(User);
  let user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    user = new User(userId, 0, undefined, undefined, undefined);
    await userRepo.save(user);
    console.log(`[BLACKJACK] Created new user ${userId} with default balance.`);
    await interaction.reply({
      content: `Welcome to Blackjack! You have been given **0 fops 🦊**. Please earn some money before playing!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await removeMoney(user, bet);
  } catch (error) {
    console.error(`[BLACKJACK] Error removing money for user ${userId}:`, error);
    await interaction.reply({
      content: `❌ You don't have enough fops 🦊 to play! You need at least ${bet} fops 🦊.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Initialize game
  const deck = shuffleDeck(createDeck());
  const playerHand: Card[] = [deck.pop()!, deck.pop()!];
  const dealerHand: Card[] = [deck.pop()!, deck.pop()!];

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  // Check for natural blackjack
  const playerBlackjack = playerValue === 21;
  const dealerBlackjack = dealerValue === 21;

  let gameResult: string;
  let winnings = 0;

  if (playerBlackjack && dealerBlackjack) {
    // Both have blackjack - tie
    gameResult = "🤝 **PUSH!** Both you and the dealer have Blackjack!";
    winnings = bet; // Return the bet
  } else if (playerBlackjack) {
    // Player blackjack wins
    gameResult = "🎉 **BLACKJACK!** You win with a natural 21!";
    winnings = Math.floor(bet * 2.5); // Blackjack pays 3:2
  } else if (dealerBlackjack) {
    // Dealer blackjack wins
    gameResult = "💔 **DEALER BLACKJACK!** The dealer got a natural 21.";
    winnings = 0;
  } else {
    // Regular game - dealer plays out their hand
    while (shouldDealerHit(dealerHand)) {
      dealerHand.push(deck.pop()!);
    }

    const finalPlayerValue = calculateHandValue(playerHand);
    const finalDealerValue = calculateHandValue(dealerHand);

    if (finalPlayerValue > 21) {
      gameResult = "💥 **BUST!** You went over 21!";
      winnings = 0;
    } else if (finalDealerValue > 21) {
      gameResult = "🎉 **DEALER BUST!** The dealer went over 21!";
      winnings = bet * 2;
    } else if (finalPlayerValue > finalDealerValue) {
      gameResult = "🎉 **YOU WIN!** Your hand beats the dealer!";
      winnings = bet * 2;
    } else if (finalPlayerValue < finalDealerValue) {
      gameResult = "💔 **DEALER WINS!** The dealer's hand beats yours.";
      winnings = 0;
    } else {
      gameResult = "🤝 **PUSH!** It's a tie!";
      winnings = bet; // Return the bet
    }
  }

  // Apply multiplier if active
  if (winnings > bet && activeMultiplier) {
    winnings = Math.floor(winnings * 1.5); // 50% bonus with multiplier
  }

  // Add winnings to user account
  if (winnings > 0) {
    await addMoney(user, winnings);
    console.log(`[BLACKJACK] User ${userId} won ${winnings} fops 🦊 with multiplier ${activeMultiplier ? "active" : "inactive"}!`);
  } else {
    console.log(`[BLACKJACK] User ${userId} lost ${bet} fops 🦊.`);
  }
  // Create embed for game result
  const color = winnings > bet ? 0x00ff00 : winnings === bet ? 0xffff00 : 0xff0000;
  const embed = ResponseBuilder.economy(
    "🃏 **BLACKJACK** 🃏",
    `**👤 Your Hand:** ${formatHand(playerHand)} (Value: ${calculateHandValue(playerHand)})\n` +
    `**🏠 Dealer Hand:** ${formatHand(dealerHand)} (Value: ${calculateHandValue(dealerHand)})\n\n` +
    `**💰 Result:** ${gameResult}\n` +
    `**Winnings:** ${winnings} fops 🦊${activeMultiplier ? " (Multiplier Active!)" : ""}\n` +
    `**Bet:** ${bet} fops 🦊 | **Balance:** ${(Number(user.balance) || 0) + winnings - bet} fops 🦊`,
    interaction.client
  ).setColor(color);

  await interaction.reply({ embeds: [embed] });
}
