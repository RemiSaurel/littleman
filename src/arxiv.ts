import ky from "ky";
import { Paper } from "./models.js";

let BASE_URL = "http://export.arxiv.org/api/query";

export async function fetchArxivPapers(
    title: string,
    categories: string[],
    maxResults: number = 5
): Promise<Paper[]> {
    const categoryQuery = categories.map(cat => `cat:${cat}`).join(" OR ");
    const query = `(ti:${title} OR abs:${title}) AND (${categoryQuery})`;
    const url = `${BASE_URL}?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

    try {
        const response = await ky.get(url).text();

        // Extract relevant data using regex
        const entries = response.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        if (entries.length === 0) return [];

        const papers = entries.map((entry: string) => {
            const title = entry.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] || "No title";
            let summary = entry.match(/<summary[^>]*>([^<]+)<\/summary>/)?.[1] || "No summary";
            const link = entry.match(/<id[^>]*>([^<]+)<\/id>/)?.[1] || "No link";
            const published = entry.match(/<published[^>]*>([^<]+)<\/published>/)?.[1] || "No published date";
            const categories = entry.match(/<category[^>]* term="([^"]+)"[^>]*>/g)?.map(cat => cat.match(/term="([^"]+)"/)?.[1] || "") || [];

            // Clean the title and summary by removing any \n or excess whitespace
            const cleanText = (text: string) => text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

            // Apply cleaning function to title and summary
            const cleanedTitle = cleanText(title);
            let cleanedSummary = cleanText(summary);

            // Summary should be 500 characters or less
            if (cleanedSummary.length > 500) {
                cleanedSummary = cleanedSummary.slice(0, 500) + "...";
            }

            return { title: cleanedTitle, summary: cleanedSummary, link, published, categories };
        });

        return papers;
    } catch (error) {
        console.error("Error fetching arXiv data:", error);
        return [];
    }
}
