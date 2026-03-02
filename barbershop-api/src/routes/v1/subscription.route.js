const express = require('express');
const auth = require('../../middlewares/auth');
const prisma = require('../../client');
const httpStatus = require('http-status');
const { notifySubscriptionEvent } = require('../../utils/notifications');
const ApiError = require('../../utils/ApiError');

const router = express.Router();

/**
 * GET /subscription/pending
 * Lista todos os barbeiros com assinatura pendente (admin only)
 */
router.get('/pending', auth('manageUsers'), async (req, res, next) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: {
                role: 'barber',
                subscriptionStatus: 'pending',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contactNumber: true,
                createdAt: true,
                subscriptionStatus: true,
                subscriptionExpiresAt: true,
            }
        });

        res.json({ results: pendingUsers, total: pendingUsers.length });
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
            }
        });

        void notifySubscriptionEvent({
            event: 'user.payment_paid',
            userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
            userEmail: updatedUser.email,
            userId: updatedUser.id,
            subscriptionStatus: updatedUser.subscriptionStatus
        });

        res.json({
            message: 'Assinatura ativada com sucesso por 30 dias',
            user: {
                id: updatedUser.id,
                name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                email: updatedUser.email,
                subscriptionStatus: updatedUser.subscriptionStatus,
                subscriptionExpiresAt: updatedUser.subscriptionExpiresAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /subscription/:userId/revoke
 * Revoga acesso manualmente (admin only)
 */
router.patch('/:userId/revoke', auth('manageUsers'), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Usuário não encontrado');
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'expired',
                subscriptionExpiresAt: new Date(),
            }
        });

        res.json({ message: 'Acesso revogado com sucesso' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
