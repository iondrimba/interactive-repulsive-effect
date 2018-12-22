import 'styles/index.scss';
import Cone from './elements/cone';
import Torus from './elements/torus';
import Cylinder from './elements/cylinder';
import { radians, map, distance } from './helpers';

export default class App {
  setup() {
    this.gutter = { size: 4 };
    this.meshes = [];
    this.grid = { rows: 11, cols: 7 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();
    this.geometries = [
      new Cone(),
      new Torus(),
      new Cylinder(),
    ];

    this.raycaster = new THREE.Raycaster();
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);


    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1);
    this.camera.position.set(0, 65, 0);
    this.camera.rotation.x = -1.57;

    this.scene.add(this.camera);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight('#ffffff', 1);

    this.scene.add(light);
  }

  addSpotLight() {
    const ligh = new THREE.SpotLight('#7bccd7', 1, 1000);

    ligh.position.set(0, 27, 0);
    ligh.castShadow = true;

    this.scene.add(ligh);
  }

  addRectLight() {
    const light = new THREE.RectAreaLight('#341212', 1, 2000, 2000);

    light.position.set(5, 50, 50);
    light.lookAt(0, 0, 0);

    this.scene.add(light);
  }

  addPointLight(color, position) {
    const light = new THREE.PointLight(color, 1, 1000, 1);

    light.position.set(position.x, position.y, position.z);

    this.scene.add(light);
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.ShadowMaterial({ opacity: .3 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.receiveShadow = true;
    this.floor.rotateX(- Math.PI / 2);

    this.scene.add(this.floor);
  }

  getRandomGeometry() {
    return this.geometries[Math.floor(Math.random() * Math.floor(this.geometries.length))];
  }

  createGrid() {
    this.groupMesh = new THREE.Object3D();

    const material = new THREE.MeshPhysicalMaterial({
      color: '#3e2917',
      metalness: .58,
      emissive: '#000000',
      roughness: .05,
    });

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let index = 0; index < 1; index++) {
        const totalCol = this.getTotalRows(row);

        for (let col = 0; col < totalCol; col++) {
          const geometry = this.getRandomGeometry();
          const mesh = this.getMesh(geometry.geom, material);

          mesh.position.y = 0;
          mesh.position.x = col + (col * this.gutter.size) + (totalCol === this.grid.cols ? 0 : 2.5);
          mesh.position.z = row + (row * (index + .25));

          mesh.rotation.x = geometry.rotationX;
          mesh.rotation.y = geometry.rotationY;
          mesh.rotation.z = geometry.rotationZ;

          mesh.initialRotation = {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z,
          };

          this.groupMesh.add(mesh);

          this.meshes[row][col] = mesh;
        }
      }
    }

    const centerX = -(this.grid.cols / 2) * this.gutter.size - 1;
    const centerZ = -(this.grid.rows / 2) - .8;

    this.groupMesh.position.set(centerX, 0, centerZ);

    this.scene.add(this.groupMesh);
  }

  getTotalRows(col) {
    return (col % 2 === 0 ? this.grid.cols : this.grid.cols - 1);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);

    const intersects = this.raycaster.intersectObjects([this.floor]);

    if (intersects.length) {
      const { x, z } = intersects[0].point;

      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row);

          for (let col = 0; col < totalCols; col++) {
            const mesh = this.meshes[row][col];

            const mouseDistance = distance(x, z,
              mesh.position.x + this.groupMesh.position.x,
              mesh.position.z + this.groupMesh.position.z);

            const y = map(mouseDistance, 7, 0, 0, 6);
            TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });

            const scaleFactor = mesh.position.y / 1.2;
            const scale = scaleFactor < 1 ? 1 : scaleFactor;
            TweenMax.to(mesh.scale, .3, {
              ease: Expo.easeOut,
              x: scale,
              y: scale,
              z: scale,
            });

            TweenMax.to(mesh.rotation, .7, {
              ease: Expo.easeOut,
              x: map(mesh.position.y, -1, 1, radians(270), mesh.initialRotation.x),
              z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
              y: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.y),
            });
          }
        }
      }
    }
  }

  init() {
    this.setup();

    this.createScene();

    this.createCamera();

    this.createGrid();

    this.addFloor();

    this.addAmbientLight();

    this.addSpotLight();

    this.addRectLight();

    this.addPointLight(0xfff000, { x: 0, y: 10, z: -100 });

    this.addPointLight(0x79573e, { x: 100, y: 10, z: 0 });

    this.addPointLight(0xc27439, { x: 20, y: 5, z: 20 });

    this.animate();

    window.addEventListener('resize', this.onResize.bind(this));

    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    this.onMouseMove({ clientX: 0, clientY: 0 });
  }

  onMouseMove({ clientX, clientY }) {
    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    this.draw();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}
