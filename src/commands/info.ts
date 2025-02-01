import { CommandInteraction, EmbedBuilder } from "discord.js";
import { promises as fs } from "fs";
import { getDefaultCriteria } from "./search.js";

export async function infoCommand(interaction: CommandInteraction) {
    // Get default values from the JSON file
    let defaultCriteria = await getDefaultCriteria();

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Default Search Criteria")
        .setDescription("Here are the default search criteria used for the `/search` command:")
        .addFields(
            { name: "Default Title", value: defaultCriteria.title, inline: true },
            { name: "Default Categories", value: defaultCriteria.categories.join(","), inline: true }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
