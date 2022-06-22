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
      this.dataInputs.every(input => input) &&
      this.userInputs.every(input => input) &&
      this.userSubmit
    );
  }

  bindInput(
    userInput: HTMLSpanElement,
    dataInput: HTMLInputElement,
    validator?: (input: string) => boolean,
  ) {
    // Select all contents on input focus.
    userInput.addEventListener("focus", () =>
      // Timeout is needed to prevent interaction bugs, eg, if the user slightly moves their cursor after clicking.
      window.setTimeout(() => {
        let sel: Selection | null;
        let range: Range;

        if (window.getSelection && document.createRange) {
          range = document.createRange();
          range.selectNodeContents(userInput);
          sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 1),
    );

    // Deselect on blur.
    userInput.addEventListener("blur", () => {
      window.getSelection()?.removeAllRanges();
    });

    // Handle enter
    userInput.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit();
      }
    });

    // If an input is emptied and then blurred, reset it to the placeholder.
    userInput.addEventListener("blur", () => {
      if (userInput.innerHTML === "" && userInput.dataset.placeholder) {
        userInput.innerText = userInput.dataset.placeholder;
      }
    });

    // Bind user and data inputs.
    userInput.addEventListener("input", () => {
      // On input event, set data value to match input content.
      dataInput.setAttribute("value", userInput.innerText);

      // Validate as the user types.
      dataInput.dataset.valid = validator
        ? `${validator(dataInput.value)}`
        : `${dataInput.value.length > 0}`;

      if (dataInput.dataset.valid === "true") {
        userInput.classList.add("valid");
      } else {
        userInput.classList.remove("valid");
      }

      // Ensure global validation is up to date.
      if (this.canSubmit) {
        this.userSubmit?.removeAttribute("disabled");
      } else {
        this.userSubmit?.setAttribute("disabled", "disabled");
      }
    });
  }

  /**
   * Criteria:
   * At least one "@"
   * At least one "."
   * "." is more than 1 char away from the end of the string (TLD is at least 2 chars long)
   * String as at least 5 chars long
   */
  validateEmail(value: string) {
    return (
      value.indexOf("@") > -1 &&
      value.indexOf(".") > -1 &&
      value.indexOf(".") <= value.length - 3 &&
      value.length > 5
    );
  }

  /**
   * Submit function to work with Netlify forms.
   * @see https://docs.netlify.com/forms/setup/#submit-html-forms-with-ajax
   */
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
