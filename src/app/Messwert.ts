export interface Messwert {
  type: string;
  position: number;
  height: number;
}

export interface Metadata {
  measurement: string;
  place: string;
  distance: number;
  user: string;
}
