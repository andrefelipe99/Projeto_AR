import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { XRButton } from "three/addons/webxr/XRButton.js";
import { createScene } from "./scene";
import {
  displayIntroductionMessage,
  displayUnsupportedBrowserMessage,
  browserHasImmersiveArCompatibility,
} from "./utils/domUtils";

import "./style.css";

function initializeXRApp() {
  const { devicePixelRatio, innerHeight, innerWidth } = window;

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);

  document.body.appendChild(XRButton.createButton(renderer));
  displayIntroductionMessage();

  createScene(renderer);
}

async function start() {
  const isImmersiveArSupported = await browserHasImmersiveArCompatibility();

  isImmersiveArSupported
    ? initializeXRApp()
    : displayUnsupportedBrowserMessage();
}

start();
