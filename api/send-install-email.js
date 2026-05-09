// Save this as: /api/send-install-email.js
// This version uses Vercel KV for persistent install counting

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timestamp, userAgent, location, platform, language } = req.body;

    // Increment install count in Vercel KV
    const newCount = await kv.incr('pwa:install:count');
    
    // Store installation details (optional - for analytics)
    await kv.lpush('pwa:installs:history', JSON.stringify({
      count: newCount,
      timestamp,
      location: location?.city ? `${location.city}, ${location.country}` : 'Unknown',
      platform,
      date: new Date(timestamp).toISOString()
    }));
    
    // Keep only last 100 installs in history
    await kv.ltrim('pwa:installs:history', 0, 99);
    
    // Format location string
    const locationStr = location 
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Unknown';

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'yusuf.bodi49@gmail.com',
        subject: `🎉 PWA Installation #${newCount} - ${location?.city || 'Unknown Location'}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; background: #f9f9f9;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #4CAF50; margin-top: 0;">New PWA Installation! 🎉</h2>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 20px 0; color: white; text-align: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: normal; opacity: 0.9;">Total Installs</h3>
                <h1 style="margin: 10px 0 0 0; font-size: 48px;">${newCount}</h1>
              </div>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <h3 style="margin-top: 0; color: #e65100;">📍 Location Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 100px;">City:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${location?.city || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Region:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${location?.region || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Country:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${location?.country || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Timezone:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${location?.timezone || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">IP:</td>
                    <td style="padding: 8px 0; font-weight: 500; font-family: monospace;">${location?.ip || 'Unknown'}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="margin-top: 0; color: #1565c0;">💻 Device Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 100px;">Time:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${new Date(timestamp).toLocaleString('en-GB', { 
                      dateStyle: 'full', 
                      timeStyle: 'long' 
                    })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Platform:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${platform || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Language:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${language || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; vertical-align: top;">User Agent:</td>
                    <td style="padding: 8px 0; font-size: 12px; word-break: break-all; font-family: monospace;">${userAgent || 'Unknown'}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
                <p style="color: #666; font-size: 13px; margin: 0;">
                  🕌 Masjid Screened PWA • Automated Installation Notification
                </p>
              </div>
            </div>
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
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent!', 
      installCount: newCount,
      location: locationStr,
      data 
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}