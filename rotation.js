var keyboard = new THREEx.KeyboardState();
window.onload = function () {
  // Присвоили значения канвасу
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvas = document.getElementById("canvas");
  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);

  // Рендерер
  let renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setClearColor(0x000000);
  // Сцена
  let scene = new THREE.Scene();
  // Камера
  let camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
  camera.position.set(0, 0, 1000);
  // Свет
  let light = new THREE.AmbientLight(0xffffff);
  scene.add(light);
  // Настройки меша
  let geometry = new THREE.SphereGeometry(100, 20);
  let material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
  });
  for (let i = 0; i < geometry.faces.length; i++) {
    geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random());
  }
  // Меш
  let mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  if (keyboard.pressed("W")) {
    console.log("нажато W");
    mesh.rotateOnAxis(Vector3(1, 0, 0), Math.PI / 180);
  }

  window.addEventListener("keydown", function (event) {
    console.log(event.code);
    switch (event.code) {
      case "KeyW":
        mesh.rotation.x = 0.5;
        break;
      case "KeyS":
        break;
      case "KeyA":
        break;
      case "KeyD":
        break;
    }
  });
  function loop() {
    renderer.render(scene, camera);
    requestAnimationFrame(function () {
      loop();
    });
  }
  loop();
};
