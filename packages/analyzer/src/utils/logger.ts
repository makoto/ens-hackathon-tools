export class Logger {
  private enableLogging: boolean = true;

  constructor(enabled: boolean = true) {
    this.enableLogging = enabled;
  }

  public info(message: string): void {
    if (this.enableLogging) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  }

  public warn(message: string): void {
    if (this.enableLogging) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  }

  public error(message: string): void {
    if (this.enableLogging) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    }
  }

  public debug(message: string): void {
    if (this.enableLogging && process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enableLogging = enabled;
  }
}