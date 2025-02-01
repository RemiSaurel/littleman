import { CommandInteraction, EmbedBuilder } from "discord.js";
import { promises as fs } from "fs";
import { getDefaultCriteria } from "./search.js";

export async function queryCommand(interaction: CommandInteraction) {
    let defaultCriteria = await getDefaultCriteria();

    // Check if the user provided new values for title and categories
    const title = interaction.options.get("title")?.value?.toString();
    const categories = interaction.options.get("categories")?.value?.toString().split(",");

    // If new values are provided, update the default search criteria
    if (title && categories) {
        defaultCriteria.title = title;
        defaultCriteria.categories = categories;

        // Save the updated default search criteria to default.json
        await fs.writeFile("src/default.json", JSON.stringify(defaultCriteria, null, 2));

        // Create an embed to show the updated default criteria
        const updatedEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Updated Search Criteria")
            .setDescription("The default search criteria have been updated.")
            .addFields(
                { name: "New Title", value: title, inline: true },
                { name: "New Categories", value: categories.join(","), inline: true }
            )
            .setTimestamp();

        // Respond with the updated default search criteria
        await interaction.reply({ embeds: [updatedEmbed] });
    }

    // If no new values are provided, the default search criteria are displayed
    // and no changes are made
}
