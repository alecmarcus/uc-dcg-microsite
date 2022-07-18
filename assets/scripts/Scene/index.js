function mouseEvents() {
  this.mouse = new THREE.Vector2();

  document.addEventListener("mousemove", event => {
    this.mouse.x = event.pageX / window.innerWidth - 0.5;
    this.mouse.y = 1 - event.pageY / window.innerHeight - 0.5;
  });
}

function init() {
  this.mouseEvents();

  rm = new RayMarcher();
  rm.loadFragmentShader(onFragmentLoaded);
  document.getElementById("root").appendChild(rm.domElement);
}

function onFragmentLoaded(scope) {
  animate();
}

function animate() {
  rm.render();
  rm.getUniform("mouse").value = this.mouse;
  requestAnimationFrame(animate);
}

init();
