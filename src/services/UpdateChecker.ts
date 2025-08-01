class UpdateChecker {
  private intervalId: number | null = null;
  private currentVersion: string;
  private checkInterval = 30000; // Check every 30 seconds
  
  constructor() {
this.currentVersion = '0.1.24';
    console.log('UpdateChecker initialized with version:', this.currentVersion);
  }
  
  start(onUpdateAvailable: () => void) {
    // Check immediately
    this.checkForUpdate(onUpdateAvailable);
    
    // Then check periodically
    this.intervalId = window.setInterval(() => {
      this.checkForUpdate(onUpdateAvailable);
    }, this.checkInterval);
  }
  
  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  async checkForUpdate(onUpdateAvailable: () => void) {
    try {
      // Fetch the latest version from your server
      const response = await fetch('/version.json?' + Date.now()); // Cache bust
      const data = await response.json();
      
      console.log('Version check:', {
        current: this.currentVersion,
        latest: data.version,
        needsUpdate: data.version !== this.currentVersion
      });
      
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