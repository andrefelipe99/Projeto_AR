import { createPlaneMarker } from "./object";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { handleXRHitTest } from "./utils/hitTest";
import * as THREE from "three";
import {
  AmbientLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  //XRFrame,
  MeshBasicMaterial,
  Mesh,
} from "three";

// let camera, scene;
// let controller;

// export function createScene(renderer) {

//   scene = new Scene();

//   camera = new PerspectiveCamera(
//     70,
//     window.innerWidth / window.innerHeight,
//     0.01,
//     20
//   );

//   const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
//   light.position.set(0.5, 1, 0.25);
//   scene.add(light);

//   const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(
//     Math.PI / 2
//   );

//   function onSelect() {
//     const material = new THREE.MeshPhongMaterial({
//       color: 0xffffff * Math.random(),
//     });
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
//     mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
//     scene.add(mesh);
//   }

//   controller = renderer.xr.getController(0);
//   controller.addEventListener("select", onSelect);
//   scene.add(controller);

//   window.addEventListener("resize", onWindowResize);

//   animate();

//   function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   }

//   function animate() {
//     renderer.setAnimationLoop(render);
//   }

//   function render() {
//     renderer.render(scene, camera);
//   }
// }
// Custom 3D model augmentation

export function createScene(renderer) {
  const scene = new Scene();

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20
  );

  /**
   * Add some simple ambient lights to illuminate the model.
   */
  const ambientLight = new AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  /**
   * Load the gLTF model and assign result to variable.
   */
  const loader = new GLTFLoader();

  let carModel;

  loader.load("/models/bubble_letters/scene.gltf", function (gltf) {
    console.log(gltf);
    carModel = gltf.scene.getObjectById(11);

    let count = 0;
    for (var i = 13; i < carModel.children.length; i++) {
      carModel.children[i].position.set(count, 0, 1);
      count++;
    }

    const letters = carModel.children[25];

    letters.rotateX(THREE.MathUtils.degToRad(90));

    letters.scale.set(1, 1, 1);
    letters.position.set(0, 0, -10);
    scene.add(letters);
  });

  /**
   * Create the plane marker to show on tracked surfaces.
   */
  const planeMarker = createPlaneMarker();
  scene.add(planeMarker);

  /**
   * Setup the controller to get input from the XR space.
   */
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  controller.addEventListener("select", onSelect);

  /**
   * The onSelect function is called whenever we tap the screen
   * in XR mode.
   */
  function onSelect() {
    if (planeMarker.visible) {
      const model = carModel.clone();

      // Place the model on the spot where the marker is showing.
      model.position.setFromMatrixPosition(planeMarker.matrix);

      // Rotate the model randomly to give a bit of variation.
      //model.rotation.y = Math.random() * (Math.PI * 2);
      model.visible = true;

      scene.add(model);
    }
  }

  /**
   * Called whenever a new hit test result is ready.
   */
  function onHitTestResultReady(hitPoseTransformed) {
    if (hitPoseTransformed) {
      planeMarker.visible = true;
      planeMarker.matrix.fromArray(hitPoseTransformed);
    }
  }

  /**
   * Called whenever the hit test is empty/unsuccesful.
   */
  function onHitTestResultEmpty() {
    planeMarker.visible = false;
  }

  /**
   * The main render loop.
   *
   * This is where we perform hit-tests and update the scene
   * whenever anything changes.
   */
  const renderLoop = (timestamp, frame) => {
    if (renderer.xr.isPresenting) {
      if (frame) {
        handleXRHitTest(
          renderer,
          frame,
          onHitTestResultReady,
          onHitTestResultEmpty
        );
      }

      renderer.render(scene, camera);
    }
  };

  renderer.setAnimationLoop(renderLoop);
}
