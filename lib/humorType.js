const humorTypeMap = {
    dark: "Dark Lord",
    coding: "Debug Wizard",
    genz: "Chronically Online",
    desi: "Desi at Heart",
    wholesome: "Certified Softie",
    relatable: "Main Character",
    absurd: "Chaos Agent",
};

export function getHumorType(tags) {
    if (!tags || tags.length === 0) return "Meme Newbie";

    const tagFrequency = {};
    tags.forEach((tag) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    const sortedTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]);
    const maxFreq = sortedTags[0][1];

    // Get all tags with maximum frequency
    const topTags = sortedTags
        .filter(([_, freq]) => freq === maxFreq)
        .map(([tag]) => humorTypeMap[tag] || tag);

    // Combine if there's a tie
    if (topTags.length > 1) {
        return topTags.slice(0, 2).join(" + ");
    }

    return topTags[0];
}
