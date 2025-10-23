// app.js - PWA Installation Detection and Management

// Function to send installation notification email
async function sendInstallNotification() {
  try {
    const response = await fetch('/api/send-install-email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });

    if (response.ok) {
      console.log('✅ Installation notification sent successfully!');
    } else {
      console.error('❌ Failed to send notification:', response.status);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Detect when PWA is successfully installed
window.addEventListener('appinstalled', (event) => {
  console.log('🎉 PWA installed successfully!');
  sendInstallNotification();
});

// Optional: Handle custom install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default browser prompt
  event.preventDefault();
  
  // Store the event for later use
  deferredPrompt = event;
  
  // Show your custom install button (if you have one)
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    
    // Add click handler for custom install button
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        return;
      }

      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      // Clear the prompt
      deferredPrompt = null;
      
      // Hide the install button
      installButton.style.display = 'none';
    });
  }
});

// Check if app is already installed (running as standalone)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App is running as installed PWA');
}

console.log('📱 PWA install detection initialized');