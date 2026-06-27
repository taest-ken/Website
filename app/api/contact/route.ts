import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Webhook Security: Only process when a booking is actually confirmed
    if (data.triggerEvent !== 'BOOKING_CREATED') {
      return NextResponse.json(
        { message: 'Event ignored. Only listening for BOOKING_CREATED.' },
        { status: 200 }
      );
    }

    const payload = data.payload;

    // 2. Extract Data from Cal.com's Nested Payload
    // Cal.com sends attendees as an array. We grab the first one (the client).
    const clientEmail = payload.attendees?.[0]?.email || 'No email provided';
    const clientName = payload.attendees?.[0]?.name || 'Client';
    
    // Format the meeting time into a readable string
    const meetingTime = new Date(payload.startTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // We injected 'notes' and 'metadata.phone' in the frontend Footer.tsx
    const intro = payload.responses?.notes || payload.responses?.notes?.value || 'No intro provided';
    const phone = payload.metadata?.phone || 'No phone provided';

    // 3. Dispatch the cleanly structured lead message data
    const emailRes = await resend.emails.send({
      from: 'TAEST Engine <system@taest.in>',
      to: ['hello@taest.in'],
      subject: `🗓️ New Booking: ${clientName} (${meetingTime})`,
      replyTo: clientEmail, // Directly maps your mail client's reply target to the client
      html: `
        <div style="font-family: sans-serif; padding: 32px; background-color: #f4f4f5; color: #111; max-width: 600px; margin: 0 auto; border-radius: 8px;">
          <h2 style="font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 12px; margin-top: 0;">New Strategy Session Booked</h2>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin-top: 24px; border: 1px solid #e5e7eb;">
            <p style="margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Meeting Time</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #54EB17; background-color: #111; display: inline-block; padding: 6px 12px; border-radius: 4px;">${meetingTime}</p>
          </div>

          <div style="margin-top: 24px;">
            <p style="margin-bottom: 18px; font-size: 15px; line-height: 1.6;">
              <strong style="color: #4b5563;">Intro / Notes:</strong><br/>
              <span style="font-size: 16px;">${intro}</span>
            </p>
            
            <p style="margin-bottom: 18px; font-size: 15px; line-height: 1.6;">
              <strong style="color: #4b5563;">Email ID:</strong><br/>
              <a href="mailto:${clientEmail}" style="color: #111; font-weight: 500;">${clientEmail}</a>
            </p>
            
            <p style="margin-bottom: 0; font-size: 15px; line-height: 1.6;">
              <strong style="color: #4b5563;">Contact No:</strong><br/>
              <span style="font-size: 16px;">${phone}</span>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data: emailRes });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}