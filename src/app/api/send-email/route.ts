import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { to, subject, html } = await request.json();

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'BarberPro <onboarding@resend.dev>', // Usando domínio padrão do Resend para testes iniciais
            to,
            subject,
            html,
        });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Erro ao enviar e-mail:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
