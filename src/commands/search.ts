import { CommandInteraction, EmbedBuilder } from "discord.js";
import { fetchArxivPapers } from "../arxiv.js";
import { promises as fs } from "fs";
import { Paper } from "../models.js";

export async function searchCommand(interaction: CommandInteraction) {
    let defaultCriteria = await getDefaultCriteria();

    // Use default criteria if no options are provided
    const title = interaction.options.get("title")?.value?.toString() || defaultCriteria.title;
    const categories = interaction.options.get("categories")?.value?.toString().split(",") || defaultCriteria.categories;

    await interaction.reply("🔍 Searching arXiv...");
    const papers = await fetchArxivPapers(title, categories);

    if (papers.length === 0) {
        return interaction.editReply("No papers found for the given query.");
    }

    // Create am embed for each paper. Add the category as full name.
    papers.forEach((paper) => {
        const embed = buildEmbed(paper);
        interaction.followUp({ embeds: [embed] });
    });

    await interaction.editReply("✅ Search complete with this title: " + title + " in categories: " + categories.join(", "));

}

export const buildEmbed = (paper: Paper) => {
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(paper.title)
        .setURL(paper.link)
        .setDescription(paper.summary)
        .addFields(
            { name: "Published", value: paper.published, inline: true },
            { name: "Categories", value: paper.categories.join(", "), inline: true }
        )
        .setTimestamp();
};

export const getDefaultCriteria = async () => {
    let defaultCriteria;
    try {
        const data = await fs.readFile("src/default.json", "utf-8");
        defaultCriteria = JSON.parse(data);
    } catch (error) {
        console.error("Error reading default.json file:", error);
    }
    return defaultCriteria;
}