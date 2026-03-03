import { NextResponse } from 'next/server';

/**
 * POST /api/notify-whatsapp
 *
 * Envia uma mensagem de WhatsApp ao barbeiro usando a API gratuita do CallMeBot.
 * O barbeiro precisa ter ativado o CallMeBot uma única vez (instruções no README).
 *
 * Body JSON:
 *   - phone:       string  — número do barbeiro no formato internacional sem + (ex: 5511999999999)
 *   - serviceName: string  — nome do serviço agendado
 *   - dateTime:    string  — ISO string do horário (ex: "2026-03-03T14:00:00.000Z")
 *   - clientName:  string  — nome do cliente
 *   - clientPhone: string  — telefone do cliente
 */
export async function POST(request: Request) {
    try {
        const { phone, serviceName, dateTime, clientName, clientPhone } = await request.json();

        if (!phone || !serviceName || !dateTime || !clientName) {
            return NextResponse.json({ error: 'Dados incompletos para notificação.' }, { status: 400 });
        }

        // Formata a data/hora em pt-BR
        const dtFormatted = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateTime));

        // Monta a mensagem limpa para o WhatsApp
        const message = [
            `✂️ *NOVO AGENDAMENTO - BarberPro*`,
            ``,
            `👤 *Cliente:* ${clientName}`,
            `📱 *WhatsApp:* ${clientPhone || 'Não informado'}`,
            `💈 *Serviço:* ${serviceName}`,
            `📅 *Data e Hora:* ${dtFormatted}`,
            ``,
            `_Acesse o BarberPro para gerenciar sua agenda._`,
        ].join('\n');

        // Limpa o número de telefone: remove tudo que não for dígito
        const cleanPhone = phone.replace(/\D/g, '');

        // Chave CallMeBot armazenada em variável de ambiente (opcional)
        const callMeBotApiKey = process.env.CALLMEBOT_API_KEY;

        if (!callMeBotApiKey) {
            // Se não configurado, retorna sucesso silencioso para não bloquear o agendamento
            console.warn('[notify-whatsapp] CALLMEBOT_API_KEY não configurada. Notificação ignorada.');
            return NextResponse.json({ success: true, skipped: true, reason: 'API key não configurada.' });
        }

        const encodedMessage = encodeURIComponent(message);
        const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMessage}&apikey=${callMeBotApiKey}`;

        const callMeBotRes = await fetch(callMeBotUrl, { method: 'GET' });
        const responseText = await callMeBotRes.text();

        if (!callMeBotRes.ok) {
            console.error('[notify-whatsapp] Falha CallMeBot:', responseText);
            return NextResponse.json({ error: 'Falha ao enviar via CallMeBot.', details: responseText }, { status: 502 });
        }

        return NextResponse.json({ success: true, details: responseText });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido.';
        console.error('[notify-whatsapp] Erro:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
