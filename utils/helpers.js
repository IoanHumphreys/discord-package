const { EmbedBuilder } = require('discord.js');
const config = require('../config/bot');

function createEmbed(options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || config.colors.default)
        .setTimestamp();

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.footer) embed.setFooter({ text: options.footer });
    if (options.author) embed.setAuthor(options.author);
    if (options.fields) embed.addFields(options.fields);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);

    return embed;
}

function createErrorEmbed(message) {
    return createEmbed({
        title: `${config.emojis.error} Error`,
        description: message,
        color: config.colors.error
    });
}

function createSuccessEmbed(message) {
    return createEmbed({
        title: `${config.emojis.success} Success`,
        description: message,
        color: config.colors.success
    });
}

module.exports = {
    createEmbed,
    createErrorEmbed,
    createSuccessEmbed
};