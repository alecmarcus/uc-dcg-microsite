import * as THREE from "three";
import RayMarcher from "./raymarcher";

class Scene {
  constructor() {
    this.rm = new RayMarcher();

    this.mouseEvents();

    this.rm.loadFragmentShader(() => this.animate());
    document.getElementById("root").appendChild(this.rm.domElement);
  }

  mouseEvents() {
    this.mouse = new THREE.Vector2();

    document.addEventListener("mousemove", event => {
      this.mouse.x = event.pageX / window.innerWidth - 0.5;
      this.mouse.y = 1 - event.pageY / window.innerHeight - 0.5;
    });
  }

  animate() {
    this.rm.render();
    this.rm.getUniform("mouse").value = this.mouse;
    window.requestAnimationFrame(() => this.animate());
  }
}

export default Scene;
