export class Messwert extends Array {
position: number;
height: number;
comment: string;
constructor(position: number, height: number, comment: string) {
  super(3);
  this.position = position;
  this.height = height;
  this.comment = comment;
}
}
