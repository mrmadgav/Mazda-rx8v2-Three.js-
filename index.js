"use strict";

console.clear();

//Основные переменные
// var rotation_matrix = new THREE.Matrix4().identity(); // пока не удалось реализовать этот вариант
var clock = new THREE.Clock();
var keyboard = new THREEx.KeyboardState();
let container;
let camera;
let renderer;
let scene;
let car;
let gui;
let acceleration = 0;
//НАСТРОЙКИ ДЛЯ ДАТ ГУИ
let settings = {
  // ключи поворота модели
  rotationX: -1.4,
  rotationY: 0,
  rotationZ: 0.0,
  // ключи цвета кузова
  bodyRed: 0.2,
  bodyGreen: 0.0,
  bodyBlue: 0.095,
  // ключи цвета дисков
  rimsRed: 0.0,
  rimsGreen: 0.1,
  rimsBlue: 0.0,
};

// кнопка переключения анимации (!)
var drive = document.querySelector("button");
drive.dataset.status = "OnStyle";

// Функция, включающая по нажатию на кнопку drive камеру от первого лица и возможность ездить на авто
function makeDrive() {
  drive.dataset.status = "OnDrive";
  let makeInfoContainer = document.createElement("P");
  makeInfoContainer.innerHTML = "Use WASD to Drive";
  let body = document.querySelector("body");
  document.body.style.background = "none";
  body.appendChild(makeInfoContainer);

  gui.close();
  // FLOOR
  var floorTexture = new THREE.ImageUtils.loadTexture(
    "./env_textures/road4.jpg"
  );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(20, 20);
  var floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
  });
  var floorGeometry = new THREE.PlaneGeometry(8000, 8000, 1, 1);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -0.5;
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  var spotLight1 = new THREE.SpotLight(0xffffff);
  spotLight1.position.set(-40, 60, -10);
  scene.add(spotLight1);

  var spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.position.set(-340, 60, -10);
  scene.add(spotLight2);

  var spotLight3 = new THREE.SpotLight(0xffffff);
  spotLight1.position.set(-1500, 120, 30);
  scene.add(spotLight3);
  //сетка
  // let gridHelper = new THREE.GridHelper(8000, 50);
  // scene.add(gridHelper);
  //оси
  // let axesHelper = new THREE.AxesHelper(500);
  // scene.add(axesHelper);
  // skyBox
  const skyLoader = new THREE.CubeTextureLoader();
  const skyTexture = skyLoader.load([
    "./env_textures/webGLpan/posx.png",
    "./env_textures/webGLpan/negx.png",
    "./env_textures/webGLpan/posy.png",
    "./env_textures/webGLpan/negy.png",
    "./env_textures/webGLpan/posz.png",
    "./env_textures/webGLpan/negz.png",
  ]);
  skyTexture.encoding = THREE.sRGBEncoding;

  scene.background = skyTexture;
  let fence;
  //сбрасываем координаты машины
  car.position.x = 0;
  car.position.y = 0;
  car.position.z = 0;
  car.rotation.z = Math.PI;
  car.rotation.x = -1.57;
  //сбрасываем скорость вращения колёс
  car.parent.children[0].children[0].children[0].children[10].rotation.x = 0;
  car.parent.children[0].children[0].children[0].children[11].rotation.x = 0;
  car.parent.children[0].children[0].children[0].children[12].rotation.x = 0;
  car.parent.children[0].children[0].children[0].children[13].rotation.x = 0;

  let loaderFence = new THREE.GLTFLoader();
  loaderFence.load("./env_textures/envBig.gltf", function (gltf) {
    // texture.flipY = false; // for glTF models only
    // car.material.map = "texture"; // <-- move here
    scene.add(gltf.scene);
    // PMREMGenerator.fromEquirectangular();
    fence = gltf.scene.children[2];
    console.log(fence);
    fence.castShadow = true;
    fence.receiveShadow = true;
    fencebody.position.x = fence.position.x;
    fencebody.position.y = fence.position.y;
    fencebody.position.z = fence.position.z;
    let bbfenceHelper = new THREE.BoundingBoxHelper(fence, 0xffffff); // all map??????
    scene.add(bbfenceHelper);
    // console.clear();
    // console.log(gltf.scene.children[2]);
  });

  let bbHelper = new THREE.BoundingBoxHelper(car, 0xffffff);
  // bbHelper.min.sub(car.position);
  // bbHelper.max.sub(car.position);
  scene.add(bbHelper);
  // console.log(bbHelper.position.x);
  // console.log(car.position.x);

  // bbHelper.position.x = car.position.x;
  // bbHelper.position.y = car.position.y;
  // bbHelper.position.z = car.position.z;
  // bbHelper.quaternion.x = car.quaternion.x;
  // bbHelper.quaternion.y = car.quaternion.y;
  // bbHelper.quaternion.z = car.quaternion.z;
  // bbHelper.quaternion.w = car.quaternion.w;

  // // PHYSICS BOXES (CANNON JS ?)
  // Setup our world
  let world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1), 0xffffff);
  const carBody = new CANNON.Body({ mass: 1 });
  carBody.addShape(carBodyShape);
  carBody.position.x = car.position.x;
  carBody.position.y = car.position.y;
  carBody.position.z = car.position.z;
  world.addBody(carBody);
  console.log(carBody);

  const fenceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1), 0xffffff);
  const fencebody = new CANNON.Body({ mass: 1 });
  fencebody.addShape(fenceShape);
  world.addBody(fencebody);
  console.log(fencebody);
  // //carbox
  // let carbox = new CANNON.Box(new CANNON.Vec3());
  // let carbody = new CANNON.Body({ mass: 5 });
  // carbody.addShape(carbox);
  // // console.log(carbody);
  // carbox.setFromObject(car);
  // console.log("Коробочка для машины", carbox);

  // //CANNON GROUND
  // let groundshape = new CANNON.Plane();
  // let groundbody = new CANNON.Body({ mass: 0 });
  // groundbody.addShape(groundshape);
  // groundbody.setFromObject(floor);
  // world.addBody(groundbody);
  // drive.addEventListener("click", makeDrive);

  // //CANNON FENCE
  // let fenceshape = new CANNON.Plane();
  // let fencebody = new CANNON.Body({ mass: 1 });
  // fencebody.addShape(fenceshape);
  // fencebody.setFromObject(fence);
  // world.addBody(fencebody);
}

drive.addEventListener("click", makeDrive);
// const roughnessMipmapper = new THREE.RoughnessMipmapper(renderer);

let loader = new THREE.GLTFLoader();
loader.load(
  "./mazda_rx8/sceneUpdated_withWheels and front rims QUALITY.gltf",
  function (gltf) {
    // car.material.map = "texture"; // <-- move here
    // texture.flipY = false; // for glTF models only

    scene.add(gltf.scene);
    // PMREMGenerator.fromEquirectangular();
    car = gltf.scene.children[0];
    car.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeBoundingBox();
        gltf.bBox = child.geometry.boundingBox; //<-- Actually get the variable
      }
    });
    car.castShadow = true;
    car.receiveShadow = true;
    console.clear();
    console.log(car);
    console.log(gltf.bBox);
    // const box = new THREE.BoxHelper(car, 0xffff00);
    // scene.add(box);
  }
);
init(); // запускаем всю сцену
animate(); // функция запускает анимацию

function init() {
  container = document.querySelector(".scene");

  //ДЕЛАЕМ СЦЕНУ
  scene = new THREE.Scene();

  let fov = 40;
  let aspect = container.clientWidth / container.clientHeight;
  let near = 0.1;
  let far = 200000;

  //ДЕЛАЕМ КАМЕРУ
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 50, 600);

  const ambient = new THREE.AmbientLight(0x404040, 3);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(50, 50, 100);
  scene.add(light);
  light.castShadow = true;

  //Сам dat GUI

  gui = new dat.GUI();
  // создаем ползунки вращения авто
  // gui.add(settings, "rotationX").min(-1.5).max(1.5).step(0.001);
  // gui.add(settings, "rotationY").min(-0.2).max(0.2).step(0.001);
  gui.add(settings, "rotationZ").min(-0.03).max(0.03).step(0.001);
  // папка с настроками цвета авто
  var guiBodyColors = gui.addFolder("Choose Body Color");
  guiBodyColors.add(settings, "bodyRed").min(0).max(0.7).step(0.005);
  guiBodyColors.add(settings, "bodyGreen").min(0).max(0.7).step(0.005);
  guiBodyColors.add(settings, "bodyBlue").min(0).max(0.7).step(0.005);
  guiBodyColors.open();
  //папка с настройками цвета дисков
  var guiRimsColors = gui.addFolder("Choose Rims Color");
  guiRimsColors.add(settings, "rimsRed").min(0).max(0.7).step(0.005);
  guiRimsColors.add(settings, "rimsGreen").min(0).max(0.7).step(0.005);
  guiRimsColors.add(settings, "rimsBlue").min(0).max(0.7).step(0.005);
  guiRimsColors.open();
  // gui.add(settings, "lightPower").min(0).max(10).step(0.5); - найти динамическое изменение света на модели

  // ДЕЛАЕМ РЕНДЕР
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);
  // Orbit Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  update();
}

function update() {
  if (drive.dataset.status === "OnStyle") {
    onStyle();
  }
  if (drive.dataset.status === "OnDrive") {
    onDrive();
  }
}
function onStyle() {
  // поворот модели
  car.rotation.x = settings.rotationX;
  car.rotation.y = settings.rotationY;
  car.rotation.z += settings.rotationZ;
  // цвет кузова
  let bodyIDcolor =
    car.parent.children[0].children[0].children[0].children[0].material.color;
  bodyIDcolor.r = settings.bodyRed;
  bodyIDcolor.g = settings.bodyGreen;
  bodyIDcolor.b = settings.bodyBlue;
  // цвет дисков
  let rimIDcolor =
    car.parent.children[0].children[0].children[0].children[11].material.color;
  rimIDcolor.r = settings.rimsRed;
  rimIDcolor.g = settings.rimsGreen;
  rimIDcolor.b = settings.rimsBlue;
  // четыре колеса
  // car.parent.children[0].children[0].children[0].children[11].rotation.x += 0.05;
  // car.parent.children[0].children[0].children[0].children[12].rotation.x += 0.05;
  // car.parent.children[0].children[0].children[0].children[13].rotation.x += 0.05;
  // car.parent.children[0].children[0].children[0].children[10].rotation.x += 0.05;
  //режим свободной езды
}
function onDrive(e) {
  // console.log(`Скорость: ${acceleration / 10}`);
  // console.log(
  //   `скорость вращения колеса, ${car.parent.children[0].children[0].children[0].children[10].rotation.x}`
  // );
  // console.log(`Координаты машины: x: ${parseInt(car.position.x)} y: ${parseInt(car.position.y)} z: ${parseInt(car.position.z)}`); - довольно странно

  var delta = clock.getDelta(); // seconds.
  var rotateAngle = (Math.PI / 4) * delta; // pi/2 radians (90 degrees) per second
  car.translateY(parseInt(-acceleration * delta));
  // порядок вращения колес
  let leftWheel = car.parent.children[0].children[0].children[0].children[12]; // левое переднее колесо
  let rightWheel = car.parent.children[0].children[0].children[0].children[13]; // правое переднее колесо
  let leftRim = car.parent.children[0].children[0].children[0].children[20]; // левая передняя шина
  let rightRim = car.parent.children[0].children[0].children[0].children[21]; // правая передняя шина
  leftWheel.rotation.order = "ZYX";
  rightWheel.rotation.order = "ZYX";

  if (acceleration > 0) {
    acceleration -= 0.0035 * parseInt(acceleration); // сила трения (?)
    if (rightWheel.rotation.z > 0) {
      rightWheel.rotation.z -= rotateAngle / 2;
      rightRim.rotation.z -= rotateAngle / 2;
      leftWheel.rotation.z -= rotateAngle / 2;
      leftRim.rotation.z -= rotateAngle / 2;
    }
    if (leftWheel.rotation.z < 0) {
      rightWheel.rotation.z += rotateAngle / 2;
      rightRim.rotation.z += rotateAngle / 2;
      leftWheel.rotation.z += rotateAngle / 2;
      leftRim.rotation.z += rotateAngle / 2;
    }
  }
  // СПОСОБ УМНЫХ ЛЮДЕЙ //

  // document.addEventListener("keydown", (event) => {
  //   console.log(event);
  //   let val = 0.05;
  //   let angleTurn = event.key == "d" ? -val : event.key == "a" ? val : 0;
  //   event.key == "w"
  //     ? ((rightWheel.rotation.x += 0.05), (leftWheel.rotation.x += 0.05))
  //     : event.key == "s"
  //     ? ((rightWheel.rotation.x -= 0.05), (leftWheel.rotation.x -= 0.05))
  //     : 0;
  //   console.log(
  //     `Поворот колеса = ${rightWheel.rotation.y} +  угол поворота ${angleTurn}`
  //   );
  //   leftWheel.rotation.y = THREE.MathUtils.clamp(
  //     leftWheel.rotation.y + angleTurn,
  //     -Math.PI * 0.25,
  //     Math.PI * 0.25
  //   );
  //   rightWheel.rotation.y = THREE.MathUtils.clamp(
  //     rightWheel.rotation.y + angleTurn,
  //     -Math.PI * 0.25,
  //     Math.PI * 0.25
  //   );
  // });

  // СПОСОБ НЕ ОЧЕНЬ УМНОГО МЕНЯ

  if (keyboard.pressed("W")) {
    if (acceleration <= 1400) acceleration += 20;
    console.log("Скорость = ", acceleration);
  }

  car.parent.children[0].children[0].children[0].children[10].rotation.x +=
    acceleration * 0.0005;
  car.parent.children[0].children[0].children[0].children[11].rotation.x +=
    acceleration * 0.0005;
  leftWheel.rotation.x += acceleration * 0.0005;
  rightWheel.rotation.x += acceleration * 0.0005;

  if (keyboard.pressed("S")) {
    if (acceleration >= 10) {
      acceleration -= 20;
      car.parent.children[0].children[0].children[0].children[10].rotation.x = 0;
      car.parent.children[0].children[0].children[0].children[11].rotation.x = 0;
      leftWheel.rotation.x = 0;
      rightWheel.rotation.x = 0;
    }
  }
  // rotate left/right/up/down
  if (keyboard.pressed("A")) {
    console.log(keyboard);
    if (leftWheel.rotation.z <= 0.9) {
      rightWheel.rotation.z += rotateAngle;
      rightRim.rotation.z += rotateAngle;
      leftWheel.rotation.z += rotateAngle;
      leftRim.rotation.z += rotateAngle;
    }
    if (acceleration > 20)
      car.rotateOnAxis(new THREE.Vector3(0, 0, 1), rotateAngle);
  }

  if (keyboard.pressed("D")) {
    if (rightWheel.rotation.z >= -0.9) {
      console.log(rightWheel.rotation.z);
      rightWheel.rotation.z -= rotateAngle;
      rightRim.rotation.z -= rotateAngle;
      leftWheel.rotation.z -= rotateAngle;
      leftRim.rotation.z -= rotateAngle;
    }
    if (acceleration > 20)
      car.rotateOnAxis(new THREE.Vector3(0, 0, 1), -rotateAngle);
  }

  if (keyboard.pressed("Z")) {
    // тревожная кнопка
    car.position.set(0, 0, 0, 0);
    car.rotation.set(0, 0, 0);
  }
  camera.position.z = car.position.z + 600;
  camera.lookAt(car.position);
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener("resize", onWindowResize); // почему-то перестало работать
