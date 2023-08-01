import * as BABYLON from '@babylonjs/core';

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
  var scene = new BABYLON.Scene(engine);

  // Camera
  var camera = new BABYLON.ArcRotateCamera(
    "camera",
    BABYLON.Tools.ToRadians(45),
    BABYLON.Tools.ToRadians(45),
    5,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // Light
  var light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Cube
  var cubeX = 1;
  var cubeY = 1;
  var cubeZ = 1;

  //make a shape with 6 sides of above sizes
  var cube = BABYLON.MeshBuilder.CreateBox(
    "cube",
    {
      width: cubeX,
      height: cubeY,
      depth: cubeZ,
    },
    scene
  );

  // Enable picking on the cube
  cube.isPickable = true;

  // Variables for handling dragging
  var isDragging = false;
  var startingPointerPosition;
  var selectedFaceIndex;
  var isCubeSelected = false;
  var isCubeMoved = false;
  var isMousePressed = false;


  const resetData = () => {
    isCubeSelected = false;
    cube.material.diffuseColor = new BABYLON.Color3(1, 1, 1); // Restore cube's material color
    camera.attachControl(canvas, true); // Restore camera movement
    isDragging = false;
    isCubeMoved = false;
    isMousePressed = false;
    selectedFaceIndex = null;
  }

  // Event listener for pointer down on the scene
  canvas.addEventListener("pointerdown", function (evt) {
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    // Check if any mesh is clicked
    if (pickResult.hit && pickResult.pickedMesh === cube) {

      isMousePressed = true;

      if (isCubeSelected) {
        startingPointerPosition = new BABYLON.Vector3(evt.clientX, evt.clientY, 0);
        const faceId = pickResult.faceId / 2;
        selectedFaceIndex = 2 * Math.floor(faceId)
      } else {
        isCubeSelected = true;
        // Highlight the selected face

        cube.material = cube.material || new BABYLON.StandardMaterial("cubeMat", scene);
        //make only selected face yellow
        cube.material.diffuseColor = new BABYLON.Color3(1, 1, 0);

        isDragging = true;
        // Prevent camera movement while dragging
        camera.detachControl(canvas);
      }
    }
    else if (isCubeSelected) {
      resetData();
    }
  });



  // Event listener for pointer drag when isCubeSelected on the scene and extrude the selected face
  canvas.addEventListener("pointermove", function (evt) {

    if (!isDragging || !isCubeSelected || !isMousePressed) return;


    var currentPointerPosition = new BABYLON.Vector3(evt.clientX, evt.clientY, 0);
    var dragDistance = new BABYLON.Vector3(evt.clientX, evt.clientY, 0).subtract(startingPointerPosition).length() / 100;
    console.log(dragDistance);

    // increase the size of the cube by the drag distance in the direction of the selected face
// 0 is positive Z
// 2 is negative Z
// 4 is positive X
// 6 is negative X
// 8 is positive Y
// 10 is negative Y

    switch (selectedFaceIndex) {
      case 0:
        cubeZ += dragDistance;
        break;
      case 2:
        cubeZ -= dragDistance;
        break;
      case 4:
        cubeX += dragDistance;
        break;
      case 6:
        cubeX -= dragDistance;
        break;
      case 8:
        cubeY += dragDistance;
        break;
      case 10:
        cubeY -= dragDistance;
        break;
    }

    // update the size of the cube
    cube.scaling = new BABYLON.Vector3(cubeX, cubeY, cubeZ);

    // Update the starting pointer position for the next move
    startingPointerPosition = currentPointerPosition;

    isCubeMoved = true;
    //resetData();

  });

  canvas.addEventListener("pointerup", function (evt) {
    if (isCubeMoved) {
      resetData();
    }
  });

  return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});