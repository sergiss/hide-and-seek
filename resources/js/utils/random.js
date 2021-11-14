export class Random {
  constructor(seed = 138) {
    this.seed = seed;
  }

  nextFloat() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}
