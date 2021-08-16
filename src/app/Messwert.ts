export class Messwert extends Array {
position: number;
height: number;
comment: string;
constructor(position: number, height: number) {
  super(2);
  this.position = position;
  this.height = height;
}
}
