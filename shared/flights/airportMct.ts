export interface MctConfig {
  domestic: number;
  international: number;
  terminalChange: number;
  airportChange: number;
  immigrationBuffer: number;
}

const DEFAULT_MCT: MctConfig = {
  domestic: 45,
  international: 90,
  terminalChange: 45,
  airportChange: 180,
  immigrationBuffer: 30,
};

export const AIRPORT_MCT_CONFIG: Record<string, MctConfig> = {
  BKK: { domestic: 45, international: 110, terminalChange: 75, airportChange: 180, immigrationBuffer: 45 },
  DMK: { domestic: 35, international: 85, terminalChange: 60, airportChange: 180, immigrationBuffer: 30 },
  SIN: { domestic: 30, international: 55, terminalChange: 35, airportChange: 180, immigrationBuffer: 25 },
  KUL: { domestic: 40, international: 80, terminalChange: 50, airportChange: 180, immigrationBuffer: 35 },
  SGN: { domestic: 40, international: 90, terminalChange: 60, airportChange: 180, immigrationBuffer: 40 },
  HAN: { domestic: 45, international: 95, terminalChange: 65, airportChange: 180, immigrationBuffer: 45 },
  MNL: { domestic: 50, international: 100, terminalChange: 70, airportChange: 180, immigrationBuffer: 50 },
  HKT: { domestic: 35, international: 70, terminalChange: 45, airportChange: 180, immigrationBuffer: 30 },
  CNX: { domestic: 30, international: 75, terminalChange: 50, airportChange: 180, immigrationBuffer: 35 },
  RGN: { domestic: 40, international: 90, terminalChange: 60, airportChange: 180, immigrationBuffer: 45 },
  LHR: { domestic: 50, international: 120, terminalChange: 110, airportChange: 210, immigrationBuffer: 60 },
  DXB: { domestic: 45, international: 95, terminalChange: 70, airportChange: 180, immigrationBuffer: 40 },
};

export function getAirportMctConfig(airportCode: string): MctConfig {
  return AIRPORT_MCT_CONFIG[airportCode.toUpperCase()] ?? DEFAULT_MCT;
}

export function getMinimumConnectionTime(params: {
  airportCode: string;
  isInternational?: boolean;
  hasTerminalChange?: boolean;
  hasAirportChange?: boolean;
  isSelfTransfer?: boolean;
}): number {
  const {
    airportCode,
    isInternational = true,
    hasTerminalChange = false,
    hasAirportChange = false,
    isSelfTransfer = false,
  } = params;

  const config = getAirportMctConfig(airportCode);
  let mct = isInternational ? config.international : config.domestic;

  if (hasTerminalChange) mct += config.terminalChange;
  if (hasAirportChange) mct += config.airportChange;
  if (isSelfTransfer) mct += config.immigrationBuffer + 30;

  return Math.max(mct, 45);
}

export function classifyLayoverRisk(params: {
  airportCode: string;
  layoverMinutes: number;
  isInternational?: boolean;
  hasTerminalChange?: boolean;
  hasAirportChange?: boolean;
  isSelfTransfer?: boolean;
}): "low" | "medium" | "high" {
  const required = getMinimumConnectionTime(params);
  const actual = params.layoverMinutes;

  if (actual < required) return "high";
  if (actual < required + 45) return "medium";
  return "low";
}
