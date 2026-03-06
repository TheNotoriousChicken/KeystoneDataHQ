const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { sendTeamInviteEmail } = require('../utils/email');
const { logActivity } = require('../utils/auditLogger');

const router = express.Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/team  (Protected)
// Returns all users in the caller's company workspace.
// ---------------------------------------------------------------------------
router.get('/', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const members = await prisma.user.findMany({
            where: { companyId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        // Also fetch pending invites
        const pendingInvites = await prisma.teamInvite.findMany({
            where: { companyId, status: 'PENDING' },
            select: {
                id: true,
                email: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json({ members, pendingInvites });
    } catch (err) {
        console.error('Team list error:', err);
        return res.status(500).json({ error: 'Failed to fetch team members.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/team/invite  (Admin Only)
// Generates a unique invite token/link for a new team member.
// ---------------------------------------------------------------------------
router.post('/invite', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const { email } = req.body;
        const companyId = req.user.companyId;
        const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        // Check if user already exists in this company
        const existingUser = await prisma.user.findFirst({
            where: { email, companyId },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'This user is already a member of your team.' });
        }

        // Check if there's already a pending invite for this email
        const existingInvite = await prisma.teamInvite.findFirst({
            where: { email, companyId, status: 'PENDING' },
        });
        if (existingInvite) {
            return res.status(400).json({
                error: 'An invitation has already been sent to this email.',
                inviteLink: `${FRONTEND}/register?invite=${existingInvite.token}`,
            });
        }

        // Generate a secure token
        const token = crypto.randomBytes(20).toString('hex');

        // Save the invite
        const invite = await prisma.teamInvite.create({
            data: {
                email,
                token,
                companyId,
            },
        });

        const inviteLink = `${FRONTEND}/register?invite=${token}`;

        // Fetch company name + inviter name for the email
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        const inviter = await prisma.user.findUnique({ where: { id: req.user.userId } });
        const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Your team';

        // Send invite email (non-blocking)
        sendTeamInviteEmail(email, token, company.name, inviterName).catch(err => {
            console.error('Invite email failed (non-blocking):', err);
        });

        console.log(`📨 Invite created for ${email} → ${inviteLink}`);

        await logActivity({
            action: 'TEAM_INVITE_SENT',
            companyId,
            userId: req.user.userId,
            details: `Invited ${email}`,
            req
        });

        return res.json({
            message: `Invitation created for ${email}.`,
            inviteLink,
            invite: {
                id: invite.id,
                email: invite.email,
                status: invite.status,
            },
        });
    } catch (err) {
        console.error('Team invite error:', err);
        return res.status(500).json({ error: 'Failed to create invitation.' });
    }
});

module.exports = router;
