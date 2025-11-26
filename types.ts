
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

// --- Low Code Types ---

// Added SCRIPT_CALL to step types
export type StepType = 'MODBUS_READ' | 'MODBUS_WRITE' | 'DELAY' | 'LOG' | 'CONDITION' | 'LOOP' | 'SCRIPT_CALL';

export interface LogicStep {
  id: string;
  type: StepType;
  name: string;
  params: Record<string, any>; // Flexible params based on type
  description?: string;
}

export interface Script {
  id: string;
  name: string;
  content: string; // The javascript code
  lastModified: number;
}

export type WidgetType = 'BUTTON' | 'INDICATOR' | 'GAUGE' | 'LABEL' | 'SWITCH' | 'TRAY';

export interface WidgetEvents {
  onClick?: string; // ID of the script to run
  onValueChange?: string; // ID of the script to run
}

export interface UIWidget {
  id: string;
  type: WidgetType;
  label: string;
  variableName?: string; // Binds to a variable in the runtime
  x: number; // Grid position
  y: number;
  w: number;
  h: number;
  // Specific props for TRAY
  rows?: number;
  cols?: number;
  value?: any; // Current simulation value
  // Event Bindings
  events?: WidgetEvents;
}

export interface AutomationProject {
  logicSteps: LogicStep[];
  scripts: Script[]; // List of user-defined scripts
  uiWidgets: UIWidget[];
  variables: Record<string, any>; // Runtime state
}
