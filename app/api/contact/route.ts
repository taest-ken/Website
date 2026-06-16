import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend SDK securely with server-side environmental variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { intro, contact, brief } = await request.json();

    // Strict validation check
    if (!intro || !contact || !brief) {
      return NextResponse.json(
        { error: 'All text fields are required.' },
        { status: 400 }
      );
    }

    // Dispatch the email payload to your enterprise inbox
    const data = await resend.emails.send({
      from: 'TAEST Engine <system@taest.in>', // Must use your verified domain
      to: ['hello@taest.in'],
      subject: `✨ New Global Lead: Intro via ${contact.slice(0, 30)}`,
      replyTo: contact, // Allows you to hit 'Reply' directly in your mail client
      html: `
        <div style="font-family: sans-serif; padding: 24px; background-color: #f9f9f9; color: #111;">
          <h2 style="font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 8px;">New Inbound Lead</h2>
          <p style="margin-bottom: 16px;"><strong>Intro:</strong><br/>${intro}</p>
          <p style="margin-bottom: 16px;"><strong>Email ID / Mobile:</strong><br/>${contact}</p>
          <p style="margin-bottom: 16px;"><strong>Brief Requirement:</strong><br/>${brief}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}