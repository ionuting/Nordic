export type MachineStatus = 'available' | 'in_use' | 'maintenance';

export interface MachineLocation {
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  model: string;
  year: number;
  plate: string;
  status: MachineStatus;
  location: MachineLocation;
  capacity_tons: number;
  notes: string;
}
