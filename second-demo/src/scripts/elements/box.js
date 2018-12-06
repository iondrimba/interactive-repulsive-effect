import RoundedBoxGeometry from '../vendor/roundedBox';

export default class Box {
  constructor() {
    this.geom = new RoundedBoxGeometry(.5, .5, .5, .02, .2);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
  }
}
