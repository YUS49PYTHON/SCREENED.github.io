// app.js - PWA Installation Detection and Management

// Function to send installation notification email
async function sendInstallNotification() {
  console.log('📧 Attempting to send installation notification...');
  
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

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Installation notification sent successfully!', data);
      // Optional: Show a toast notification to user
      showNotification('Thanks for installing! 🎉');
    } else {
      console.error('❌ Failed to send notification:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

// Optional: Show notification to user
function showNotification(message) {
  // You can customize this or remove it
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Detect when PWA is successfully installed
window.addEventListener('appinstalled', (event) => {
  console.log('🎉 PWA installed successfully! (appinstalled event fired)');
  sendInstallNotification();
});

// Optional: Handle custom install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('📱 Install prompt available');
  
  // Prevent the default browser prompt
  event.preventDefault();
  
  // Store the event for later use
  deferredPrompt = event;
  
  // Show your custom install button
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.classList.remove('hidden');
    
    // Remove any existing listeners to avoid duplicates
    const newButton = installButton.cloneNode(true);
    installButton.parentNode.replaceChild(newButton, installButton);
    
    // Add click handler for custom install button
    newButton.addEventListener('click', async () => {
      console.log('🔘 Install button clicked');
      
      if (!deferredPrompt) {
        console.log('⚠️ No deferred prompt available');
        return;
      }

      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      // If user accepted, send notification
      // Note: appinstalled event should also fire, but let's be safe
      if (outcome === 'accepted') {
        console.log('✅ User accepted install');
        // Wait a moment for installation to complete
        setTimeout(() => {
          sendInstallNotification();
        }, 1000);
      }
      
      // Clear the prompt
      deferredPrompt = null;
      
      // Hide the install button
      newButton.classList.add('hidden');
    });
  }
});

// Check if app is already installed (running as standalone)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App is running as installed PWA');
} else {
  console.log('ℹ️ App is running in browser');
}

// Detect if app becomes standalone (iOS)
window.addEventListener('DOMContentLoaded', () => {
  if (window.navigator.standalone === true) {
    console.log('✅ Running as iOS standalone app');
  }
});

console.log('📱 PWA install detection initialized');