import anime from "animejs";

class HeroText {
  phraseOne: HTMLHeadingElement | null;
  phraseTwo: HTMLHeadingElement | null;
  scrollTimeline: HTMLDivElement;

  constructor(heroText: HTMLHeadingElement, scrollTimeline: HTMLDivElement) {
    this.scrollTimeline = scrollTimeline;

    this.phraseOne = heroText.querySelector(".hero-phrase-1");
    this.phraseTwo = heroText.querySelector(".hero-phrase-2");

    this.prepareMarkup();

    this.phraseOneIn();

    window.addEventListener("scroll", () => this.handleScroll(), true);
    window.addEventListener("keydown", e => this.handleKeydown(e), true);
  }

  get percentScrolled() {
    const windowHeight = window.innerHeight;
    const timelineHeight = this.scrollTimeline.getBoundingClientRect().height;
    const scrollY = window.scrollY;

    return Math.min((scrollY / (timelineHeight - windowHeight)) * 100, 100);
  }

  prepareMarkup() {
    const wrapLetters = (el: Element) => {
      if (el.textContent) {
        el.innerHTML = el.textContent.replace(
          /\S/g,
          `<span class="letter">$&</span>`,
        );
      }
    };

    if (this.phraseOne) {
      this.phraseOne
        .querySelectorAll(".word")
        .forEach(word => wrapLetters(word));
    }

    if (this.phraseTwo) {
      this.phraseTwo
        .querySelectorAll(".word")
        .forEach(word => wrapLetters(word));
    }
  }

  phraseOneInTriggered = false;
  phraseOneIn() {
    if (!this.phraseOneInTriggered && this.phraseOneOutTriggered) {
      this.phraseOneInTriggered = true;
      this.phraseOneOutTriggered = false;

      anime.timeline().add({
        targets: ".hero-phrase-1 .letter",
        translateY: ["1.25em", 0],
        duration: 1600,
        delay: (el, i) => 20 * i + 100,
        easing: "easeOutExpo",
      });
    }
  }

  phraseOneOutTriggered = true;
  phraseOneOut() {
    if (!this.phraseOneOutTriggered && this.phraseOneInTriggered) {
      this.phraseOneOutTriggered = true;
      this.phraseOneInTriggered = false;

      anime.timeline().add({
        targets: ".hero-phrase-1 .letter",
        translateY: [0, "-1.25em"],
        duration: 1200,
        delay: (el, i) => 10 * i,
        easing: "easeOutExpo",
      });
    }
  }

  phraseTwoInTriggered = false;
  phraseTwoIn() {
    if (!this.phraseTwoInTriggered && this.phraseTwoOutTriggered) {
      this.phraseTwoInTriggered = true;
      this.phraseTwoOutTriggered = false;

      anime.timeline().add({
        targets: ".hero-phrase-2 .letter",
        translateY: ["1.25em", 0],
        duration: 1600,
        delay: (el, i) => 10 * i,
        easing: "easeOutExpo",
      });
    }
  }

  phraseTwoOutTriggered = true;
  phraseTwoOut() {
    if (!this.phraseTwoOutTriggered && this.phraseTwoInTriggered) {
      this.phraseTwoOutTriggered = true;
      this.phraseTwoInTriggered = false;

      anime.timeline().add({
        targets: ".hero-phrase-2 .letter",
        translateY: [0, "1.25em"],
        duration: 1200,
        delay: (el, i) => 10 * i,
        easing: "easeOutExpo",
      });
    }
  }

  handleScroll() {
    requestAnimationFrame(() => {
      if (this.percentScrolled < 33) this.phraseOneIn();
      if (this.percentScrolled > 33) this.phraseOneOut();
      if (this.percentScrolled < 66) this.phraseTwoOut();
      if (this.percentScrolled > 66) this.phraseTwoIn();
    });
  }

  handleKeydown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      requestAnimationFrame(() => {
        if (this.percentScrolled < 33) this.phraseOneIn();
        if (this.percentScrolled > 33) this.phraseOneOut();
        if (this.percentScrolled < 66) this.phraseTwoOut();
        if (this.percentScrolled > 66) this.phraseTwoIn();
      });
    }
  }
}

export default HeroText;
