import { radians } from '../helpers';

export default class Torus {
  constructor() {
    this.size = .25;
    this.geom = new THREE.TorusGeometry(this.size, .08, 30, 200);
    this.rotationX = radians(90);
    this.rotationY = 0;
    this.rotationZ = 0;
  }
}
