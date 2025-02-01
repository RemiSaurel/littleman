import "dotenv/config";
import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from "discord.js";
import { registerCommands } from "./command-register.ts";
import { getDefaultCriteria, searchCommand } from "./commands/search.ts";
import { infoCommand } from "./commands/info.ts";
import { queryCommand } from "./commands/query.ts";
import { fetchArxivPapers } from "./arxiv.ts";
import { Paper } from "./models.ts";
import { CronJob } from "cron";

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

if (!TOKEN || !CLIENT_ID || !CHANNEL_ID) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
}

// Create the bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Register slash commands
registerCommands(CLIENT_ID);

// Function to create the embed for displaying paper results
const createEmbed = (title: string, papers: Paper[]) => {
    const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle(`Search results for: ${title}`)
        .setTimestamp();

    // Add each paper as a field in the embed and a distinct separator for each paper
    papers.forEach((paper) => {
        embed.addFields({
            name: paper.title,
            value: `📅 Published: ${paper.published}\n🔗 [Read More](${paper.link})\n📝 ${paper.summary.slice(0, 300)}...`,
            inline: false,
        });
        embed.addFields({
            name: "Categories",
            value: paper.categories.join(", "),
            inline: false,
        });

        embed.addFields({
            name: "\u200B",
            value: "\u200B",
            inline: false,
        });
    });

    return embed;
};

// Function to send the embed to the Discord channel specified by CHANNEL_ID
const sendToChannel = async (embed: EmbedBuilder) => {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID) as TextChannel;
        if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
            console.log("Papers sent to the channel!");
        }
    } catch (error) {
        console.error("Error sending message to channel:", error);
    }
};

// Function to fetch papers based on default criteria and send them to the channel
const fetchAndSendPapers = async () => {
    const defaultCriteria = await getDefaultCriteria();
    const papers = await fetchArxivPapers(defaultCriteria.title, defaultCriteria.categories);

    if (papers.length === 0) {
        console.log("No papers found.");
        return;
    }

    const embed = createEmbed(defaultCriteria.title, papers);
    await sendToChannel(embed);
};

// Function to schedule paper fetching every day at 8:00 AM
const schedulePaperFetching = () => {
    const job = new CronJob(
        '0 8 * * *',
        () => fetchAndSendPapers(), // onTick
        null, // onComplete
        true, // start
        'Europe/Paris' // timeZone
    );
};

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);

    // Start the scheduled task
    schedulePaperFetching();
});

// Handle interactions
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "search") {
        await searchCommand(interaction);
    } else if (interaction.commandName === "info") {
        await infoCommand(interaction);
    } else if (interaction.commandName === "query") {
        await queryCommand(interaction);
    }
});

// Login bot
client.login(TOKEN);
