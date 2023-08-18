import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import { PerspectiveCamera, Scene } from "three";
import { showObjectForWord } from "./utils/words";


export function createScene(renderer) {
  let controller1, controller2;
  let controllerGrip1, controllerGrip2;

  let raycaster;

  const intersected = [];
  const tempMatrix = new THREE.Matrix4();

  let controls, group, group2;

  const scene = new Scene();

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20
  );

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.6, 0);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xbcbcbc, 0xa5a5a5, 3));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(0, 6, 0);
  light.castShadow = true;
  light.shadow.camera.top = 3;
  light.shadow.camera.bottom = -3;
  light.shadow.camera.right = 3;
  light.shadow.camera.left = -3;
  light.shadow.mapSize.set(4096, 4096);
  scene.add(light);

  /**
   * Load the gLTF model and assign result to variable.
   */
  group = new THREE.Group();
  scene.add(group);

  const nameToLetterMap = {};

  const loader = new GLTFLoader();
  loader.load(
    "models/bubble_letters/scene.gltf",
    function (gltf) {
      const model = gltf.scene;

      const letters = model.getObjectByName("GLTF_SceneRootNode");

      const spacingX = 0.5; // Espaçamento horizontal entre elementos
      const spacingY = 0.6; // Espaçamento vertical entre elementos
      const maxPerRow = 12; // Número máximo de elementos por linha

      let countX = 0;
      let countY = 0;

      let i = 0;
      let count = 0;
      letters.traverse((child) => {
        if (child.isMesh) {
          // Atribuir o material à mesh da letra
          child.material = child.material.clone();
          const letter = String.fromCharCode(65 + count); // A, B, C, ...
          nameToLetterMap[child.name] = letter;
          child.scale.set(0.4, 0.4, 0.4);

          // Definir a posição com base no padrão descrito
          const positionX = countX * spacingX;
          const positionY = 0;
          const positionZ = countY * spacingY;
          child.position.set(positionX - 3, positionY, positionZ - 2);

          // Adicionar a mesh da letra ao grupo
          group.add(child);
          count++;

          // Atualizar os contadores de posição
          if (i < maxPerRow) {
            countX++;
            i++;
          } else {
            countY = 1;
            countX = 0;
            i = 0;
          }
        }
      });
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  scene.add(controller2);

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);

  const line = new THREE.Line(geometry);
  line.name = "line";
  line.scale.z = 5;

  controller1.add(line.clone());
  controller2.add(line.clone());

  group2 = new THREE.Group();
  scene.add(group2);

  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 4; i++) {
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.position.set(-1 + (i - 0.5), 0, -0.5); // Espaçamento horizontal entre os planos
    plane.scale.set(0.5, 0.5, 1);
    plane.rotateX(-Math.PI / 2);
    group2.add(plane);
  }

  raycaster = new THREE.Raycaster();

  window.addEventListener("resize", onWindowResize);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onSelectStart(event) {
    const controller = event.target;

    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      const object = intersection.object;
      object.material.emissive.b = 1;
      controller.attach(object);
      controller.userData.selected = object;
    }

    controller.userData.targetRayMode = event.data.targetRayMode;
  }

  function onSelectEnd(event) {
    const controller = event.target;

    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.material.emissive.b = 0;
      group.attach(object);

      controller.userData.selected = undefined;
    }
  }

  function getIntersections(controller) {
    controller.updateMatrixWorld();

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(group.children, false);
  }

  function intersectObjects(controller) {
    // Do not highlight in mobile-ar

    if (controller.userData.targetRayMode === "screen") return;

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName("line");
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      const object = intersection.object;
      object.material.emissive.r = 1;
      intersected.push(object);

      line.scale.z = intersection.distance;
    } else {
      line.scale.z = 5;
    }
  }

  function cleanIntersected() {
    while (intersected.length) {
      const object = intersected.pop();
      object.material.emissive.r = 0;
    }
  }

  function checkLetterPlaneCollisions() {
    const letterCollisions = [];

    group.traverse((child) => {
      if (child.isMesh) {
        const letterBoundingBox = new THREE.Box3().setFromObject(child);
        for (const plane of group2.children) {
          const planeBoundingBox = new THREE.Box3().setFromObject(plane);

          if (letterBoundingBox.intersectsBox(planeBoundingBox)) {
            letterCollisions.push({ letter: child, plane: plane });
          }
        }
      }
    });

    return letterCollisions;
  }

  function handleLetterPlaneCollisions(collidedLetterPlanes) {
    for (const { letter, plane } of collidedLetterPlanes) {
      letter.material.color.set(0xff0000); // Change color to red

      // Set the position of the letter to match the position of the plane
      letter.position.set(
        plane.position.x,
        plane.position.y,
        plane.position.z + 0.2
      );

      // Align the letter's rotation with the plane's rotation
      letter.rotation.set(0, 0, 0);

      const letterChar = nameToLetterMap[letter.name];
      placedLetters += letterChar; // Add the letter to the placed letters
      checkForWordMatch(); // Check for word matches whenever a new letter is placed
    }
  }

  // Define a dictionary of valid words
  const validWords = ["LUA", "SNL", "HATN", "BNLA", "EULK"];

  // Track currently placed letters
  let placedLetters = "";
  let recognizedWords = [];

  function checkForWordMatch() {
    for (const word of validWords) {
      if (placedLetters.includes(word) && !recognizedWords.includes(word)) {
        recognizedWords.push(word);

        renderer.xr.getSession().addEventListener("end", () => {
          showObjectButton.style.display = "block"; // Mostra o botão
        });
        
        showObjectButton.addEventListener("click", showObjectForWord(scene, group, group2, word));
      }
    }
  }

  const showObjectButton = document.getElementById("showObjectButton");

  function render() {
    cleanIntersected();

    intersectObjects(controller1);
    intersectObjects(controller2);

    const collidedLetterPlanes = checkLetterPlaneCollisions();
    handleLetterPlaneCollisions(collidedLetterPlanes);

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(render);
}
