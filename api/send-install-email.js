// Save this as: /api/send-install-email.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timestamp, userAgent } = req.body;

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Use this for testing, or your verified domain
        to: 'yusuf.bodi49@gmail.com', // CHANGE THIS to your email
        subject: '🎉 New PWA Installation!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #4CAF50;">Someone installed your PWA!</h2>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>📅 Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
              <p><strong>🌐 User Agent:</strong> ${userAgent || 'Unknown'}</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              This notification was sent automatically when a user installed your Progressive Web App.
            </p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return res.status(response.status).json({ error: 'Failed to send email', details: error });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, message: 'Email sent!', data });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}