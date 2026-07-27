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
    
    // Format the meeting time into a readable string (IST)
    const meetingTime = new Date(payload.startTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Extract custom metadata injected via Footer.tsx modal config
    const phone = payload.metadata?.phone || 'Not provided';
    const linkedin = payload.metadata?.linkedin || null;

    // 3. Dispatch the cleanly structured lead message data
    const emailRes = await resend.emails.send({
      from: 'TAEST Engine <system@taest.in>',
      to: ['hello@taest.in'],
      subject: `🗓️ New Booking: ${clientName} (${meetingTime})`,
      replyTo: clientEmail, // Directly maps your mail client's reply target to the client
      html: `
        <div style="font-family: sans-serif; padding: 32px; background-color: #f4f4f5; color: #111; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 12px; margin-top: 0;">New Strategy Session Booked</h2>
          
          {/* Meeting Time Badge */}
          <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin-top: 20px; border: 1px solid #e5e7eb;">
            <p style="margin-top: 0; margin-bottom: 8px; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">Meeting Time</p>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #54EB17; background-color: #111; display: inline-block; padding: 8px 14px; border-radius: 4px;">${meetingTime}</p>
          </div>

          {/* Contact Coordinates */}
          <div style="margin-top: 24px; background-color: #ffffff; padding: 24px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="margin-top: 0; margin-bottom: 16px; font-size: 15px; line-height: 1.5;">
              <strong style="color: #4b5563; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">1. Mobile No:</strong>
              <span style="font-size: 16px; font-weight: 600; color: #111;">${phone}</span>
            </p>
            
            <p style="margin-bottom: ${linkedin ? '16px' : '0'}; font-size: 15px; line-height: 1.5; border-top: 1px solid #f3f4f6; pt: 16px; padding-top: 16px;">
              <strong style="color: #4b5563; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">2. Email ID:</strong>
              <a href="mailto:${clientEmail}" style="font-size: 16px; font-weight: 600; color: #111; text-decoration: underline;">${clientEmail}</a>
            </p>
            
            ${linkedin ? `
            <p style="margin-bottom: 0; font-size: 15px; line-height: 1.5; border-top: 1px solid #f3f4f6; padding-top: 16px;">
              <strong style="color: #4b5563; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">3. LinkedIn Profile:</strong>
              <a href="${linkedin}" target="_blank" style="color: #54EB17; background-color: #111; padding: 8px 14px; border-radius: 4px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 14px;">View LinkedIn Profile &rarr;</a>
            </p>
            ` : ''}
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">taest. automated routing engine</p>
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