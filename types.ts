export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface ScriptFile {
  id: string;
  name: string;
  content: string;
  language: 'csharp' | 'javascript';
}

export interface ModbusConfig {
  ipAddress: string;
  port: number;
  slaveId: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}