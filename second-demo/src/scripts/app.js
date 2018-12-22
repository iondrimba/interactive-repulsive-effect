import 'styles/index.scss';
import Cone from './elements/cone';
import Box from './elements/box';
import Torus from './elements/torus';
import { radians, map, distance, hexToRgbTreeJs } from './helpers';

export default class App {
  setup() {
    this.gui = new dat.GUI();

    this.raycaster = new THREE.Raycaster();

    this.backgroundColor = '#1b1b1b';
    this.gutter = { size: 1.2 };
    this.meshes = [];
    this.grid = { cols: 15, rows: 7 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();
    this.repulsion = 1;
    this.geometries = [
      new Box(),
      new Torus(),
      new Cone()
    ];

    const gui = this.gui.addFolder('Background');

    gui.addColor(this, 'backgroundColor').onChange((color) => {
      document.body.style.backgroundColor = color;
    });

    window.addEventListener('resize', this.onResize.bind(this), { passive: true });

    window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });

    this.onMouseMove({ clientX: 0, clientY: 0 });
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  createCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 1);
    this.camera.position.set(0, 30, 0);

    this.scene.add(this.camera);
  }

  addAmbientLight() {
    const obj = { color: '#2900af' };
    const light = new THREE.AmbientLight(obj.color, 1);

    this.scene.add(light);

    const gui = this.gui.addFolder('Ambient Light');

    gui.addColor(obj, 'color').onChange((color) => {
      light.color = hexToRgbTreeJs(color);
    });
  }

  addSpotLight() {
    const obj = { color: '#e000ff' };
    const light = new THREE.SpotLight(obj.color, 1, 1000);

    light.position.set(0, 27, 0);
    light.castShadow = true;

    this.scene.add(light);

    const gui = this.gui.addFolder('Spot Light');

    gui.addColor(obj, 'color').onChange((color) => {
      light.color = hexToRgbTreeJs(color);
    });
  }

  addRectLight() {
    const obj = { color: '#0077ff' };
    const rectLight = new THREE.RectAreaLight(obj.color, 1, 2000, 2000);

    rectLight.position.set(5, 50, 50);
    rectLight.lookAt(0, 0, 0);

    this.scene.add(rectLight);

    const gui = this.gui.addFolder('Rect Light');

    gui.addColor(obj, 'color').onChange((color) => {
      rectLight.color = hexToRgbTreeJs(color);
    });
  }

  addPointLight(color, position) {
    const pointLight = new THREE.PointLight(color, 1, 1000, 1);
    pointLight.position.set(position.x, position.y, position.z);

    this.scene.add(pointLight);
  }

  getRandomGeometry() {
    return this.geometries[Math.floor(Math.random() * Math.floor(this.geometries.length))];
  }

  createGrid() {
    this.groupMesh = new THREE.Object3D();

    const meshParams = {
      color: '#ff00ff',
      metalness: .58,
      emissive: '#000000',
      roughness: .18,
    };

    const material = new THREE.MeshPhysicalMaterial(meshParams);
    const gui = this.gui.addFolder('Mesh Material');

    gui.addColor(meshParams, 'color').onChange((color) => {
      material.color = hexToRgbTreeJs(color);
    });
    gui.add(meshParams, 'metalness', 0.1, 1).onChange((val) => {
      material.metalness = val;
    });
    gui.add(meshParams, 'roughness', 0.1, 1).onChange((val) => {
      material.roughness = val;
    });

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let col = 0; col < this.grid.cols; col++) {
        const geometry = this.getRandomGeometry();
        const mesh = this.getMesh(geometry.geom, material);

        mesh.position.set(col + (col * this.gutter.size), 0, row + (row * this.gutter.size));
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

    const centerX = ((this.grid.cols - 1) + ((this.grid.cols - 1) * this.gutter.size)) * .5;
    const centerZ = ((this.grid.rows - 1) + ((this.grid.rows - 1) * this.gutter.size)) * .5;

    this.groupMesh.position.set(-centerX, 0, -centerZ);

    this.scene.add(this.groupMesh);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  addCameraControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const material = new THREE.ShadowMaterial({ opacity: .3 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.rotateX(- Math.PI / 2);
    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  init() {
    this.setup();

    this.createScene();

    this.createCamera();

    this.addAmbientLight();

    this.addSpotLight();

    this.addRectLight();

    this.createGrid();

    this.addCameraControls();

    this.addFloor();

    this.animate();

    this.addPointLight(0xfff000, { x: 0, y: 10, z: -100 });

    this.addPointLight(0xfff000, { x: 100, y: 10, z: 0 });

    this.addPointLight(0x00ff00, { x: 20, y: 5, z: 20 });
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

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);

    const intersects = this.raycaster.intersectObjects([this.floor]);

    if (intersects.length) {
      const { x, z } = intersects[0].point;

      for (let row = 0; row < this.grid.rows; row++) {
        for (let col = 0; col < this.grid.cols; col++) {

          const mesh = this.meshes[row][col];

          const mouseDistance = distance(x, z,
            mesh.position.x + this.groupMesh.position.x,
            mesh.position.z + this.groupMesh.position.z);

          const y = map(mouseDistance, 6, 0, 0, 10);
          TweenMax.to(mesh.position, .2, { y: y < 1 ? 1 : y });

          const scaleFactor = mesh.position.y / 2.5;
          const scale = scaleFactor < 1 ? 1 : scaleFactor;

          TweenMax.to(mesh.scale, .4, {
            ease: Expo.easeOut,
            x: scale,
            y: scale,
            z: scale,
          });

          TweenMax.to(mesh.rotation, .5, {
            ease: Expo.easeOut,
            x: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.x),
            z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
            y: map(mesh.position.y, -1, 1, radians(90), mesh.initialRotation.y),
          });
        }
      }
    }
  }

  animate() {
    this.controls.update();

    this.draw();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}
