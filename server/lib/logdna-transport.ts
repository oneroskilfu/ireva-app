/**
 * Custom LogDNA Transport for Winston
 * 
 * This module creates a custom Winston transport that sends logs to LogDNA.
 * It uses LogDNA's ingestion API to send logs directly.
 */

import Transport from 'winston-transport';
import https from 'https';
import os from 'os';

interface LogDNAOptions extends Transport.TransportStreamOptions {
  apiKey: string;
  hostname?: string;
  app?: string;
  env?: string;
  index_meta?: boolean;
  level?: string;
  tags?: string[];
  timeout?: number;
  url?: string;
  ip?: string;
  mac?: string;
}

// Default options
const DEFAULT_OPTIONS = {
  hostname: os.hostname(),
  app: 'ireva',
  env: process.env.NODE_ENV || 'development',
  index_meta: true,
  timeout: 5000, // 5 seconds
  url: 'https://logs.logdna.com/logs/ingest',
};

// LogDNA Transport class
export class LogDNATransport extends Transport {
  private options: LogDNAOptions;
  private bufferLength: number;
  private bufferTimeout: number | null;
  private buffer: any[];
  
  constructor(options: LogDNAOptions) {
    super(options);
    
    // Validate required options
    if (!options.apiKey) {
      throw new Error('LogDNA API key is required');
    }
    
    // Set options with defaults
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    
    // Buffer for batching logs
    this.buffer = [];
    this.bufferLength = 0;
    this.bufferTimeout = null;
  }
  
  // Log method (required by Winston Transport)
  log(info: any, callback: Function): void {
    setImmediate(() => {
      this.emit('logged', info);
    });
    
    // Add log to buffer
    this.addLogToBuffer(info);
    
    // Process callback
    if (callback) {
      setImmediate(callback);
    }
  }
  
  // Add log to buffer
  private addLogToBuffer(info: any): void {
    // Extract log level and message
    const { level, message, timestamp, ...meta } = info;
    
    // Create LogDNA line object
    const line = {
      level,
      timestamp: timestamp ? new Date(timestamp).getTime() : Date.now(),
      line: message,
      app: this.options.app,
      env: this.options.env,
      meta: this.options.index_meta ? meta : undefined,
    };
    
    // Add tags if provided
    if (this.options.tags && this.options.tags.length > 0) {
      line.meta = line.meta || {};
      line.meta.tags = this.options.tags;
    }
    
    // Add to buffer
    this.buffer.push(line);
    this.bufferLength++;
    
    // Send buffer if it's full or start a timeout to send it later
    if (this.bufferLength >= 10) {
      this.sendBuffer();
    } else if (!this.bufferTimeout) {
      // Wait up to 5 seconds before sending the buffer
      this.bufferTimeout = setTimeout(() => this.sendBuffer(), 5000) as any;
    }
  }
  
  // Send buffer to LogDNA
  private sendBuffer(): void {
    // Clear timeout if set
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = null;
    }
    
    // Skip if buffer is empty
    if (this.buffer.length === 0) {
      return;
    }
    
    // Prepare log data
    const logData = {
      lines: this.buffer.slice(),
    };
    
    // Clear buffer
    this.buffer = [];
    this.bufferLength = 0;
    
    // Send to LogDNA
    this.sendToLogDNA(logData);
  }
  
  // Send logs to LogDNA API
  private sendToLogDNA(data: any): void {
    // Prepare request body
    const body = JSON.stringify(data);
    
    // Prepare request URL with query parameters
    const url = new URL(this.options.url || DEFAULT_OPTIONS.url);
    url.searchParams.append('hostname', this.options.hostname || os.hostname());
    url.searchParams.append('now', Date.now().toString());
    
    // Add optional parameters
    if (this.options.ip) {
      url.searchParams.append('ip', this.options.ip);
    }
    
    if (this.options.mac) {
      url.searchParams.append('mac', this.options.mac);
    }
    
    // Prepare request options
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'apikey': this.options.apiKey,
      },
      timeout: this.options.timeout,
    };
    
    // Create request
    const req = https.request(url, options, (res) => {
      // Check status code
      if (res.statusCode !== 200) {
        console.error(`LogDNA API Error: ${res.statusCode}`);
        
        let error = '';
        res.on('data', (chunk) => {
          error += chunk;
        });
        
        res.on('end', () => {
          console.error(`LogDNA API Error: ${error}`);
        });
      }
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error('Error sending logs to LogDNA:', error);
    });
    
    // Handle timeout
    req.on('timeout', () => {
      req.destroy();
      console.error('Timeout sending logs to LogDNA');
    });
    
    // Send the request
    req.write(body);
    req.end();
  }
}

// Factory function to create LogDNA transport
export function createLogDNATransport(options: LogDNAOptions): LogDNATransport {
  return new LogDNATransport(options);
}

export default LogDNATransport;