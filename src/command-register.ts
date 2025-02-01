import { REST, Routes, SlashCommandBuilder } from "discord.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";

export async function registerCommands(CLIENT_ID: string) {
    const commands = [
        new SlashCommandBuilder()
            .setName("search")
            .setDescription("Search arXiv papers")
            .addStringOption(option =>
                option.setName("title")
                    .setDescription("Title to search")
                    .setRequired(false))
            .addStringOption(option =>
                option.setName("categories")
                    .setDescription("Comma-separated categories")
                    .setRequired(false)),
        new SlashCommandBuilder()
            .setName("info")
            .setDescription("Get default search criteria for arXiv papers")
        ,
        new SlashCommandBuilder()
            .setName("query")
            .setDescription("Edit the default search criteria for arXiv papers")
            .addStringOption(option =>
                option.setName("title")
                    .setDescription("Title to search")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("categories")
                    .setDescription("Comma-separated categories")
                    .setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    try {
        console.log("🔧 Registering slash commands...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log("✅ Slash commands registered!");
    } catch (error) {
        console.error("Error registering commands:", error);
    }
}
