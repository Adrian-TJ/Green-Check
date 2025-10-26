export enum ResourceType {
  AGUA = "AGUA",
  LUZ = "LUZ",
  GAS = "GAS",
  TRANSPORTE = "TRANSPORTE",
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  consumption: number;
  date: Date;
  pymeId: string;
  created_at: Date;
  updated_at: Date;
}

export interface ResourceChartData {
  date: string;
  consumption: number;
}

export interface ResourcesByType {
  agua: ResourceChartData[];
  luz: ResourceChartData[];
  gas: ResourceChartData[];
  transporte: ResourceChartData[];
}
