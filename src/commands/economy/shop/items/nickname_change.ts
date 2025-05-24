// Copyright (c) 2025 KibaOfficial
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { CommandInteraction } from "discord.js";
import { UserEconomyData } from "../../../../interfaces/econemyData";

export async function useNicknameChange(
  interaction: CommandInteraction,
  userId: string,
  userData: UserEconomyData, 
  allUserData: Record<string, UserEconomyData>
) {
  interaction.reply({
    content: 'The logic for using the nickname change item will be implemented here soon.',
    flags: 64
  });
}