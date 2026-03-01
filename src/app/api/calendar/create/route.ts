import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

const KEY_FILE = path.join(process.cwd(), 'google-service-account.json');

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { calendarId = 'primary', start, end, customerName, customerPhone, barberName } = body;

        if (!start || !end || !customerName) {
            return NextResponse.json({ error: 'Faltam dados obrigatórios (start, end, customerName)' }, { status: 400 });
        }

        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: `Corte - ${customerName}`,
            description: `Cliente: ${customerName}\nWhatsApp: ${customerPhone || 'Não informado'}\nBarbeiro: ${barberName || 'BarberPro'}`,
            start: { dateTime: start }, // ex: "2026-03-05T14:00:00-03:00"
            end: { dateTime: end },     // +30 min
            reminders: {
                useDefault: false,
                overrides: [{ method: 'popup', minutes: 30 }],
            },
        };

        const response = await calendar.events.insert({
            calendarId,
            resource: event,
            sendUpdates: 'all', // envia e-mail de notificação se o evento tiver attendees (opcional)
        });

        return NextResponse.json({ success: true, eventId: response.data.id, htmlLink: response.data.htmlLink });
    } catch (error: any) {
        console.error('Erro ao criar evento:', error);
        return NextResponse.json({ error: error.message || 'Falha ao criar agendamento' }, { status: 500 });
    }
}
