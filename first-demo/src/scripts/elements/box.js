import RoundedBoxGeometry from '../vendor/roundedBox';

export default class Box {
  constructor() {
    this.size = .45;
    this.geom = new RoundedBoxGeometry(this.size, this.size, this.size, .02, .2);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
  }
}
