import { onDocumentReady } from "./utils";
import HeroText from "./HeroText";
import EmailForm from "./EmailForm";

onDocumentReady(() => {
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
