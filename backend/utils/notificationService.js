const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Creates a notification for a specific user.
 * 
 * @param {Object} params
 * @param {string} params.userId - The ID of the user to notify
 * @param {string} params.title - The title of the notification (e.g., 'Sync Completed')
 * @param {string} params.message - The detailed message
 * @param {string} [params.type='INFO'] - 'INFO', 'SUCCESS', 'WARNING', 'ERROR'
 * @param {string} [params.link=null] - Optional relative path to redirect to when clicked
 */
const notifyUser = async ({ userId, title, message, type = 'INFO', link = null }) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            }
        });
    } catch (err) {
        console.error('Failed to create user notification:', err);
    }
};

/**
 * Creates identical notifications for all ADMIN users within a specific company.
 * Useful for billing events, new team members joining, etc.
 * 
 * @param {Object} params
 * @param {string} params.companyId - The ID of the company whose admins should be notified
 * @param {string} params.title - The title of the notification
 * @param {string} params.message - The detailed message
 * @param {string} [params.type='INFO'] - 'INFO', 'SUCCESS', 'WARNING', 'ERROR'
 * @param {string} [params.link=null] - Optional relative path to redirect to when clicked
 */
const notifyAdmins = async ({ companyId, title, message, type = 'INFO', link = null }) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                companyId,
                role: 'ADMIN'
            },
            select: { id: true }
        });

        if (admins.length > 0) {
            const notificationsData = admins.map(admin => ({
                userId: admin.id,
                title,
                message,
                type,
                link
            }));

            await prisma.notification.createMany({
                data: notificationsData
            });
        }
    } catch (err) {
        console.error('Failed to notify company admins:', err);
    }
};

module.exports = {
    notifyUser,
    notifyAdmins
};
