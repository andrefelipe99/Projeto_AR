import { createPlaneMarker } from "./object/planeMarker";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { handleXRHitTest } from "./utils/hitTest";
import { DragControls } from "three/addons/controls/DragControls.js";
import * as THREE from "three";
import { PerspectiveCamera, Scene } from "three";

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
  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);

  /**
   * Load the gLTF model and assign result to variable.
   */
  const loader = new GLTFLoader();

  let letterArray = [];

  loader.load("/models/bubble_letters/scene.gltf", function (gltf) {
    console.log(gltf);

    //letters = gltf.scene.getObjectById(11);

    let count = 0;
    const letters = gltf.scene.getObjectById(11);

    for (var i = 0; i < letters.children.length; i++) {
      letterArray.push(letters.children[i]);

      if (i >= 14) {
        letterArray[i].position.set(count, 0, 1);
        count++;
      }
    }
    console.log(letterArray);
  });

  // Depois de criar o letterArray
  const dragControls = new DragControls(
    letterArray,
    camera,
    renderer.domElement
  );

  // Evento de arrastar
  dragControls.addEventListener("drag", (event) => {
    // Atualize a posição do objeto arrastado
    event.object.position.copy(event.object.position);
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
  let model;

  function onSelect() {
    if (planeMarker.visible) {
      if (model) {
        scene.remove(model);
      }
      model = new THREE.Group();
      for (let i = 0; i < letterArray.length; i++) {
        const letter = letterArray[i].clone();
        letter.position.copy(letterArray[i].position);
        model.add(letter); // Add the letter to the empty group
      }

      // Adicione o DragControls para os objetos no model
      const dragControls = new DragControls(
        model.children,
        camera,
        renderer.domElement
      );

      dragControls.addEventListener("drag", (event) => {
        // Atualize a posição do objeto arrastado
        event.object.position.copy(event.object.position);
      });

      //model.rotateX(THREE.MathUtils.degToRad(-90));

      const bbox = new THREE.Box3().setFromObject(model);
      const objectSize = new THREE.Vector3();
      bbox.getSize(objectSize);

      const translation = new THREE.Vector3();
      translation.x = -objectSize.x / 2;
      translation.y = -objectSize.y / 2;
      translation.z = -objectSize.z / 2;

      model.position.setFromMatrixPosition(planeMarker.matrix);
      model.position.add(translation);

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
