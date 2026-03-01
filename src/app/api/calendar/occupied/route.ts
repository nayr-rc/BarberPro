import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from 'path';

const KEY_FILE = path.join(process.cwd(), 'google-service-account.json');

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary'; // use 'primary' ou o ID real

    try {
        const calendar = google.calendar({ version: 'v3', auth });

        const now = new Date();
        const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const res = await calendar.events.list({
            calendarId,
            timeMin: now.toISOString(),
            timeMax: oneMonthLater.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100,
        });

        const occupied = res.data.items?.map(event => ({
            id: event.id,
            title: event.summary || 'Ocupado',
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            description: event.description || '',
            htmlLink: event.htmlLink,
        })) || [];

        return NextResponse.json({ occupied });
    } catch (error: any) {
        console.error('Erro ao listar eventos:', error);
        return NextResponse.json({ error: error.message || 'Falha ao acessar calendário' }, { status: 500 });
    }
}
