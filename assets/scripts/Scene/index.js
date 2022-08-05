import * as THREE from "three";
import RayMarcher from "./raymarcher";

const { abs, sqrt, pow, min, max, ceil } = Math;

const easeOut = x => (x === 1 ? 1 : 1 - pow(2, -10 * x));

class Scene {
  constructor() {
    this.animation = null;
    this.animationDuration = 0;
    this.animationStart = null;
    this.animateFrom = 0;

    this.mouseIsMoving = false;
    this.mmTimeRes = 5;
    this.mmDistRes = 5;
    this.lastMoveTime = null;

    this.mouse = new THREE.Vector3();
    this.mouseVelocity = 0;
    this.mouseEvents();

    this.rm = new RayMarcher();
    this.rm.loadFragmentShader(() => this.animate());
    document.getElementById("root").appendChild(this.rm.domElement);
  }

  mouseEvents() {
    const checkForMouseMove = time => {
      // If the last move time was less than the idle threshold, the mouse is considered moving.
      this.mouseIsMoving = time - this.lastMoveTime < this.mmTimeRes;

      if (this.mouseIsMoving) {
        // If it's still moving, keep checking.
        requestAnimationFrame(t => checkForMouseMove(t));
      } else {
        // Otherwise, stop the check loop and start the ease out loop from the last move's delta.
        this.animation = requestAnimationFrame(t => this.mouseAnimation(t));
      }
    };

    document.addEventListener("pointermove", e => {
      // Stop animation and follow mouse movements.
      this.animation !== null && this.clearMouseAnimation();

      this.lastMoveTime = e.timeStamp;

      // If the check loop is off, restart it.
      !this.mouseIsMoving && requestAnimationFrame(t => checkForMouseMove(t));

      const newD = sqrt(pow(abs(e.movementX), 2) + pow(abs(e.movementY), 2)); // standard distance equation
      const newX = e.pageX / window.innerWidth;
      const newY = 1 - e.pageY / window.innerHeight;

      this.mouse.x = newX;
      this.mouse.y = newY;

      this.animationDuration = abs(this.mouse.z - (this.mouse.z + newD)) * 33;
      this.animateFrom = newD;
      this.mouse.z += newD;
    });
  }

  clearMouseAnimation() {
    // If somehow there's a frame req, cancel to ensure the loop is ended and state is cleared completely.
    if (this.animation !== null) {
      cancelAnimationFrame(this.animation);
    }

    this.animation = null;
    this.animationStart = null;
    this.animateFrom = 0;
  }

  mouseAnimation(animationFrame) {
    // Don't try to animate a previously cancelled frame request.
    if (this.animation === null) {
      return;
    }

    // Log the start of the animation
    if (this.animationStart === null) {
      this.animationStart = animationFrame;
    }

    // Calculate progress as an integer between 1 - 100. Bounded to not exceed 100 and to avoid NaN
    const pctComplete = min(
      ceil(
        (max(0.001, animationFrame - this.animationStart) /
          this.animationDuration) *
          100,
      ),
      100,
    );

    // Ease the delta down, starting at the max delta and decreasing to 0
    // where the easing factor is the % completion of the animation
    // 0% = start of the ease, 100% = end of the ease
    const easedProgress = this.animateFrom * easeOut(pctComplete / 100);
    const easedD = this.animateFrom - easedProgress;
    this.mouse.z += easedD;

    if (pctComplete === 100) {
      // All done
      this.clearMouseAnimation();
    } else if (pctComplete < 100) {
      // Keep going!
      requestAnimationFrame(t => this.mouseAnimation(t));
    }
  }

  animate() {
    this.rm.render();
    this.rm.getUniform("mouse").value = this.mouse;
    requestAnimationFrame(() => this.animate());
  }
}

export default Scene;
