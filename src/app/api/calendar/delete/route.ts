import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

const KEY_FILE = path.join(process.cwd(), 'google-service-account.json');

export async function POST(request: Request) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        const { eventId, calendarId = 'primary' } = await request.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Falta eventId' }, { status: 400 });
        }

        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId,
            eventId,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao deletar evento:', error);
        return NextResponse.json({ error: error.message || 'Falha ao cancelar' }, { status: 500 });
    }
}
