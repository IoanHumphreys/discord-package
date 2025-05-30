const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, createErrorEmbed, createSuccessEmbed } = require('../../utils/helpers');
const { logActivity } = require('../../utils/activityLogger');

module.exports = {
    category: 'Moderation',
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // Check if target exists
        if (!target) {
            const embed = createErrorEmbed('User not found or not a member of this server.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        // Check if target is kickable
        if (!target.kickable) {
            const embed = createErrorEmbed('I cannot kick this user. They may have higher permissions than me.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        // Check if user is trying to kick themselves
        if (target.id === interaction.user.id) {
            const embed = createErrorEmbed('You cannot kick yourself!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        // Check if target has higher or equal role than executor
        if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
            const embed = createErrorEmbed('You cannot kick someone with higher or equal permissions!');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        try {
            // Try to DM the user before kicking
            try {
                const dmEmbed = createEmbed({
                    title: '👢 You have been kicked',
                    description: `You have been kicked from **${interaction.guild.name}**`,
                    fields: [
                        {
                            name: 'Reason',
                            value: reason,
                            inline: true
                        },
                        {
                            name: 'Moderator',
                            value: interaction.user.tag,
                            inline: true
                        }
                    ],
                    color: 0xffaa00
                });
                
                await target.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled, continue with kick
            }
            
            // Kick the user
            await target.kick(reason);
            
            // Log the activity
            await logActivity('moderation', `${target.user.tag} kicked by ${interaction.user.tag}: ${reason}`, interaction.guild.id, interaction.user.id);
            
            // Send success message
            const embed = createSuccessEmbed(`**${target.user.tag}** has been kicked from the server.`);
            embed.addFields(
                { name: 'Reason', value: reason, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true }
            );
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error kicking user:', error);
            const embed = createErrorEmbed('Failed to kick the user. Please check my permissions.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};