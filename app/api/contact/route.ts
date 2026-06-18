import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { intro, email, phone } = await request.json();

    // Enforce completeness across the newly defined parameters
    if (!intro || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Intro, Email ID, and Contact No. are all required.' },
        { status: 400 }
      );
    }

    // Dispatch the cleanly structured lead message data
    const data = await resend.emails.send({
      from: 'TAEST Engine <system@taest.in>',
      to: ['hello@taest.in'],
      subject: `✨ New Lead Intro: ${email.slice(0, 30)}`,
      replyTo: email, // Directly maps your mail client's reply target to their actual email address
      html: `
        <div style="font-family: sans-serif; padding: 24px; background-color: #f9f9f9; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
          <h2 style="font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 8px; margin-top: 0;">New Inbound Lead</h2>
          <p style="margin-bottom: 18px; font-size: 15px; line-height: 1.5;"><strong>Intro:</strong><br/>${intro}</p>
          <p style="margin-bottom: 18px; font-size: 15px; line-height: 1.5;"><strong>Email ID:</strong><br/><a href="mailto:${email}" style="color: #111; text-decoration: underline;">${email}</a></p>
          <p style="margin-bottom: 0; font-size: 15px; line-height: 1.5;"><strong>Contact No:</strong><br/>${phone}</p>
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