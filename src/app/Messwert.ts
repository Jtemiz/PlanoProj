export interface Messwert {
  index: number; 
  position: number;
  height: number;
  speed: number;
}

export interface Metadata {
  measurement: string;
  place: string;
  distance: number;
  user: string;
}
