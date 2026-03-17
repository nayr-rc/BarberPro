const express = require('express');
const auth = require('../../middlewares/auth');
const prisma = require('../../client');
const httpStatus = require('http-status');
const { notifySubscriptionEvent } = require('../../utils/notifications');
const ApiError = require('../../utils/ApiError');

const router = express.Router();

/**
 * Log a subscription action
 */
async function logAction(initiatedById, targetUserId, action, details) {
    await prisma.subscriptionActionLog.create({
        data: {
            action,
            details,
            initiatedById,
            targetUserId
        }
    });
}

/**
 * GET /subscription/logs
 * Lista os logs de ações de assinatura (admin only)
 */
router.get('/logs', auth('manageUsers'), async (req, res, next) => {
    try {
        const logs = await prisma.subscriptionActionLog.findMany({
            take: 200,
            orderBy: { createdAt: 'desc' },
            include: {
                initiatedBy: {
                    select: { firstName: true, lastName: true, email: true }
                },
                targetUser: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });
        res.json({ results: logs });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /subscription/all
 * Lista todos os barbeiros com status de assinatura (admin only)
 */
router.get('/all', auth('manageUsers'), async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'barber' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contactNumber: true,
                createdAt: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
                subscriptionActivatedAt: true,
                subscriptionPausedAt: true,
                subscriptionPauseReason: true,
                subscriptionCancelledAt: true,
                subscriptionCancelledReason: true,
                lastAccessAt: true,
                accessCount: true
            }
        });
        res.json({ results: users, total: users.length });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /subscription/:userId/approve
 * Aprova manualmente o pagamento e ativa a assinatura por 30 dias (admin only)
 */
router.patch('/:userId/approve', auth('manageUsers'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
        }

        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'active',
                subscriptionActivatedAt: now,
                subscriptionExpiresAt: expiresAt,
                subscriptionPausedAt: null,
                subscriptionCancelledAt: null,
            }
        });

        await logAction(req.user.id, userId, 'APPROVE', 'Assinatura ativada/renovada por 30 dias');

        void notifySubscriptionEvent({
            event: 'user.payment_paid',
            userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
            userEmail: updatedUser.email,
            userId: updatedUser.id,
            subscriptionStatus: updatedUser.subscriptionStatus
        });

        res.json({
            message: 'Assinatura ativada com sucesso por 30 dias',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /subscription/:userId/pause
 * Pausa a assinatura (admin only)
 */
router.patch('/:userId/pause', auth('manageUsers'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'pending',
                subscriptionPausedAt: new Date(),
                subscriptionPauseReason: reason || null
            }
        });

        await logAction(req.user.id, userId, 'PAUSE', reason || 'Assinatura pausada pelo administrador');
        res.json({ message: 'Assinatura pausada com sucesso' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /subscription/:userId/resume
 * Reativa a assinatura (admin only)
 */
router.patch('/:userId/resume', auth('manageUsers'), async (req, res, next) => {
    try {
        const { userId } = req.params;

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'active',
                subscriptionPausedAt: null,
                subscriptionPauseReason: null
            }
        });

        await logAction(req.user.id, userId, 'RESUME', 'Assinatura retomada pelo administrador');
        res.json({ message: 'Assinatura retomada com sucesso' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /subscription/:userId/cancel
 * Cancela a assinatura (admin only)
 */
router.patch('/:userId/cancel', auth('manageUsers'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'expired',
                subscriptionCancelledAt: new Date(),
                subscriptionCancelledReason: reason || null
            }
        });

        await logAction(req.user.id, userId, 'CANCEL', reason || 'Assinatura cancelada pelo administrador');
        res.json({ message: 'Assinatura cancelada com sucesso' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /subscription/:userId/revoke
 * Revoga acesso totalmente (admin only)
 */
router.patch('/:userId/revoke', auth('manageUsers'), async (req, res, next) => {
    try {
        const { userId } = req.params;

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'expired',
                subscriptionExpiresAt: new Date(),
                subscriptionPausedAt: null,
                subscriptionCancelledAt: null
            }
        });

        await logAction(req.user.id, userId, 'REVOKE', 'Acesso revogado totalmente pelo administrador');
        res.json({ message: 'Acesso revogado com sucesso' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
