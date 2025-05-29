const config = require('../config/bot');

function isOwner(userId) {
    return config.ownerIds.includes(userId);
}

function hasPermission(member, permission) {
    return member.permissions.has(permission);
}

function isAdmin(member) {
    return member.permissions.has('Administrator') || isOwner(member.user.id);
}

function isModerator(member) {
    const modPerms = [
        'KickMembers',
        'BanMembers',
        'ManageMessages',
        'ManageRoles'
    ];
    
    return modPerms.some(perm => member.permissions.has(perm)) || isAdmin(member);
}

module.exports = {
    isOwner,
    hasPermission,
    isAdmin,
    isModerator
};