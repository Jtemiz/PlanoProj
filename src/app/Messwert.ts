export class Messwert extends Array {
  position: number;
  height: number;

  constructor(position: number, height: number) {
    super(2);
    this.position = position;
    this.height = height;
  }

  public getPos() {
    return this.position;
  }

  public getHeight() {
    return this.height;
  }
}
