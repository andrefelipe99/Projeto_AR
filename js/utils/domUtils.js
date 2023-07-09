export const browserHasImmersiveArCompatibility = async () => {
  if (window.navigator.xr) {
    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    console.info(
      `[DEBUG] ${
        isSupported
          ? "Browser supports immersive-ar"
          : "Browser does not support immersive-ar"
      }`
    );
    return isSupported;
  }
  return false;
};

export const displayUnsupportedBrowserMessage = () => {
  const appRoot = document.getElementById("app-root");
  const bigMessage = document.createElement("h2");

  bigMessage.innerText = "😢 Oh no!";
  if (appRoot) {
    appRoot.appendChild(bigMessage);
  }

  const middleMessage = document.createElement("p");
  middleMessage.innerText =
    "Seu navegador parece não suportar realidade aumentada com WebXR.";

  middleMessage.style.padding = "30px";
  middleMessage.style.fontWeight = "bold";

  if (appRoot) {
    appRoot.appendChild(middleMessage);
  }

  const helpMessage = document.createElement("p");

  helpMessage.innerText =
    "Tente abrir a página usando uma versão recente do Chrome no Android.";

  if (appRoot) {
    appRoot.appendChild(helpMessage);
  }
};

export const displayIntroductionMessage = () => {
  const appRoot = document.getElementById("app-root");

  const bigMessage = document.createElement("h1");
  bigMessage.innerText = "Bem vindo ao Palavras em Ação! 👋";

  const middleMessage = document.createElement("p");
  middleMessage.innerText =
    "Pressione o botão abaixo para entrar na experiência AR.";

  middleMessage.style.padding = "20px";

  const helpMessage = document.createElement("p");
  helpMessage.innerText =
    "Observação: o aplicativo funciona melhor em um ambiente bem iluminado, com espaço suficiente para se movimentar.";

  helpMessage.style.fontSize = "16px";
  helpMessage.style.fontWeight = "bold";
  helpMessage.style.padding = "64px 64px 0px 64px";
  helpMessage.style.opacity = "0.8";

  if (appRoot) {
    appRoot.appendChild(bigMessage);
    appRoot.appendChild(middleMessage);
    appRoot.appendChild(helpMessage);
  }

  return () => {
    if (appRoot) {
      if (appRoot.contains(middleMessage)) {
        appRoot.removeChild(middleMessage);
      }
      if (appRoot.contains(bigMessage)) {
        appRoot.removeChild(bigMessage);
      }
      if (appRoot.contains(helpMessage)) {
        appRoot.removeChild(helpMessage);
      }
    }
  };
};
