import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const wordToModelPath = {
  LUA: "models/moon/scene.gltf",
  SNL: "models/the_sun/scene.gltf",
  HATN: "models/cat/scene.gltf",
  BNLA: "models/soccer_ball/scene.gltf",
  EULK: "models/hulk/scene.gltf",
};

export function showObjectForWord(scene, group, group2, word) {
  if (wordToModelPath[word]) {
    group.visible = false;
    group2.visible = false;

    const modelPath = wordToModelPath[word];

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      function (gltf) {
        const model = gltf.scene;

        // Configure a posição, escala, etc., do modelo conforme necessário
        model.position.set(0, 1, 0);
        model.scale.set(0.2, 0.2, 0.2);

        // Adicione o modelo à cena
        scene.add(model);
      },
      undefined,
      function (error) {
        console.error("Error loading model:", error);
      }
    );
  }
}
