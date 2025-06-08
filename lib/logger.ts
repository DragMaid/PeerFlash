// Simple logger that works in both Edge and Node.js environments
export function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    ...(data && { data }),
  };
  
  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(JSON.stringify(logEntry, null, 2));
  }
  
  // In production, you might want to send logs to a service
  // This is where you'd add your production logging logic
} 