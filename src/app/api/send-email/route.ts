import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
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
    } catch (error: unknown) {
        console.error('Erro ao enviar e-mail:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Falha inesperada ao enviar e-mail';

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
