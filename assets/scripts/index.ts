import "focus-visible";

import { mobileAndTabletCheck, onDocumentReady } from "./utils";
import HeroText from "./HeroText";
import EmailForm from "./EmailForm";

// @ts-ignore
import Scene from "./Scene/index.js";

onDocumentReady(() => {
  if (!mobileAndTabletCheck()) {
    new Scene();
  }

  const heroText = document.getElementById("hero");
  if (heroText) {
    new HeroText(heroText as HTMLHeadingElement);
  }

  const userForm = document.getElementById("user-form");
  const dataForm = document.getElementById("data-form");
  if (userForm && dataForm) {
    new EmailForm(userForm as HTMLDivElement, dataForm as HTMLFormElement);
  }

  const copyrightYear = document.getElementById("year");
  if (copyrightYear) {
    copyrightYear.innerText = `${new Date().getFullYear()}`;
  }
});
