import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export const wordToModelPath = {
  LUA: "models/moon/scene.gltf",
  SNL: "models/the_sun/scene.gltf",
  HATN: "models/cat/scene.gltf",
  BNLA: "models/soccer_ball/scene.gltf",
  EULK: "models/hulk/scene.gltf",
};

export function showObjectForWord(scene, word) {
  if (wordToModelPath[word]) {
    for (let i = scene.children.length - 1; i >= 2; i--) {
      const child = scene.children[i];
      scene.remove(child);
    }

    const modelPath = wordToModelPath[word];

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      function (gltf) {
        const model = gltf.scene;

        // Configure a posição, escala, etc., do modelo conforme necessário
        model.position.set(0, 0, -1);
        model.scale.set(0.5, 0.5, 0.5);

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
