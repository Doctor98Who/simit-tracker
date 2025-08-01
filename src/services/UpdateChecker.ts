class UpdateChecker {
  private intervalId: number | null = null;  // Changed from NodeJS.Timer to number
  private currentVersion: string;
  private checkInterval = 30000; // Check every 30 seconds
  
  constructor() {
    this.currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
  }
  
  start(onUpdateAvailable: () => void) {
    // Check immediately
    this.checkForUpdate(onUpdateAvailable);
    
    // Then check periodically
    this.intervalId = window.setInterval(() => {  // Use window.setInterval
      this.checkForUpdate(onUpdateAvailable);
    }, this.checkInterval);
  }
  
  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);  // Use window.clearInterval
      this.intervalId = null;
    }
  }
  
  async checkForUpdate(onUpdateAvailable: () => void) {
    try {
      // Fetch the latest version from your server
      const response = await fetch('/version.json?' + Date.now()); // Cache bust
      const data = await response.json();
      
      if (data.version !== this.currentVersion) {
        console.log('New version available:', data.version);
        onUpdateAvailable();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }
}

export default new UpdateChecker();