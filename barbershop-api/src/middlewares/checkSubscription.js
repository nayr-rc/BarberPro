const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Middleware que verifica se o barbeiro tem uma assinatura ativa.
 * Admins são sempre permitidos.
 */
const checkSubscription = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    // Admins e o email principal do proprietário sempre têm acesso livre
    if (user.role !== 'barber' || user.email?.toLowerCase().includes('narsie454')) {
        return next();
    }

    // Verifica se a assinatura está ativa
    if (user.subscriptionStatus === 'active') {
        const now = new Date();
        const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;

        // Verifica se expirou (atualiza para 'expired' se necessário)
        if (expiresAt && now > expiresAt) {
            return next(
                new ApiError(httpStatus.PAYMENT_REQUIRED, 'Assinatura expirada. Renove para continuar acessando.')
            );
        }

        return next();
    }

    if (user.subscriptionStatus === 'pending') {
        return next(
            new ApiError(httpStatus.PAYMENT_REQUIRED, 'Pagamento pendente de confirmação. Aguarde a ativação da sua conta.')
        );
    }

    if (user.subscriptionStatus === 'expired') {
        return next(
            new ApiError(httpStatus.PAYMENT_REQUIRED, 'Assinatura expirada. Renove para continuar acessando.')
        );
    }

    return next(new ApiError(httpStatus.PAYMENT_REQUIRED, 'Acesso bloqueado. Verifique sua assinatura.'));
};

module.exports = checkSubscription;
