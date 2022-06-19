class EmailForm {
  userForm: HTMLDivElement;
  userAbout: HTMLSpanElement | null;
  userEmail: HTMLSpanElement | null;
  userName: HTMLSpanElement | null;
  userSubmit: HTMLButtonElement | null;
  userInputs: (HTMLSpanElement | null)[];

  dataAbout: HTMLInputElement | null;
  dataEmail: HTMLInputElement | null;
  dataName: HTMLInputElement | null;
  dataInputs: (HTMLInputElement | null)[];
  dataForm: HTMLFormElement;

  constructor(userForm: HTMLDivElement, dataForm: HTMLFormElement) {
    this.userForm = userForm;
    this.userAbout = userForm.querySelector("#about-input");
    this.userEmail = userForm.querySelector("#email-input");
    this.userName = userForm.querySelector("#name-input");
    this.userSubmit = userForm.querySelector("#submit-input");
    this.userInputs = [this.userName, this.userAbout, this.userEmail];

    this.dataForm = dataForm;
    this.dataAbout = dataForm.querySelector("#data-about");
    this.dataEmail = dataForm.querySelector("#data-email");
    this.dataName = dataForm.querySelector("#data-name");
    this.dataInputs = [this.dataName, this.dataAbout, this.dataEmail];

    if (this.elsReady) {
      this.bindInput(this.userAbout!, this.dataAbout!);
      this.bindInput(this.userName!, this.dataName!);
      this.bindInput(this.userEmail!, this.dataEmail!, this.validateEmail);

      this.userSubmit!.addEventListener("click", () => this.submit());
    }
  }

  get canSubmit() {
    return this.dataInputs.every(
      input => input && input.dataset.valid === "true",
    );
  }

  get elsReady() {
    return !!(
      this.dataInputs.every(input => !!input) &&
      this.userInputs.every(input => !!input) &&
      this.userSubmit
    );
  }

  bindInput(
    userInput: HTMLSpanElement,
    dataInput: HTMLInputElement,
    validator?: (input: string) => boolean,
  ) {
    userInput.addEventListener("focus", () =>
      window.setTimeout(() => {
        let sel: Selection | null, range: Range;
        if (window.getSelection && document.createRange) {
          range = document.createRange();
          range.selectNodeContents(userInput);
          sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 1),
    );

    userInput.addEventListener("blur", () => {
      window.getSelection()?.removeAllRanges();
    });

    userInput.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit();
      }
    });

    userInput.addEventListener("blur", () => {
      if (userInput.innerHTML === "" && userInput.dataset.placeholder) {
        userInput.innerText = userInput.dataset.placeholder;
      }
    });

    userInput.addEventListener("input", () => {
      dataInput.setAttribute("value", userInput.innerText);

      dataInput.dataset.valid = validator
        ? `${validator(dataInput.value)}`
        : `${dataInput.value.length > 0}`;

      if (dataInput.dataset.valid === "true") {
        userInput.classList.add("valid");
      } else {
        userInput.classList.remove("valid");
      }

      if (this.canSubmit) {
        this.userSubmit?.removeAttribute("disabled");
      } else {
        this.userSubmit?.setAttribute("disabled", "disabled");
      }
    });
  }

  validateEmail(value: string) {
    return (
      value.indexOf("@") > -1 &&
      value.indexOf(".") > -1 &&
      value.indexOf(".") <= value.length - 3 &&
      value.length > 5
    );
  }

  submit() {
    if (this.canSubmit) {
      const formData = new FormData(this.dataForm);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as never as string).toString(),
      })
        .then(() => this.userForm.classList.add("submitted"))
        .catch(error => alert(error));
    }
  }
}

export default EmailForm;
