export const generateWhatsAppLink = async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/v1/whatsapp/link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error('Failed to generate WhatsApp link');
    }
    const { whatsappUrl } = await response.json();
    return whatsappUrl;
};
