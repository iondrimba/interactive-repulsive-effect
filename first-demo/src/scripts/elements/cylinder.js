import { radians } from '../helpers';

export default class Cylinder {
  constructor() {
    this.geom = new THREE.CylinderGeometry(.3, .3, .2, 64);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = radians(-180);
  }
}
