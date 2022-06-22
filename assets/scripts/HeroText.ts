import anime, { AnimeAnimParams } from "animejs";

class HeroText {
  phraseOne: HTMLHeadingElement | null;
  phraseTwo: HTMLHeadingElement | null;

  constructor(heroText: HTMLHeadingElement) {
    this.phraseOne = heroText.querySelector(".hero-phrase-1");
    this.phraseTwo = heroText.querySelector(".hero-phrase-2");

    this.prepareMarkup();

    this.animate();
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

  timeline = anime.timeline();

  phraseOneIn: AnimeAnimParams = {
    targets: ".hero-phrase-1 .letter",
    translateY: ["1.25em", 0],
    duration: 1600,
    delay: anime.stagger(20, { easing: "easeInQuad" }),
    easing: "easeOutExpo",
  };

  phraseOneOut: AnimeAnimParams = {
    targets: ".hero-phrase-1 .letter",
    translateY: [0, "-1.25em"],
    duration: 1600,
    delay: anime.stagger(20, { easing: "easeInQuad" }),
    easing: "easeInExpo",
  };

  phraseTwoIn: AnimeAnimParams = {
    targets: ".hero-phrase-2 .letter",
    translateY: ["1.25em", 0],
    duration: 1600,
    delay: anime.stagger(20, { easing: "easeInQuad" }),
    easing: "easeOutExpo",
  };

  animate() {
    this.timeline
      .add(this.phraseOneIn)
      .add(this.phraseOneOut)
      .add(this.phraseTwoIn, "-=430");
  }
}

export default HeroText;
