import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {Sky} from "three/examples/jsm/objects/Sky.js";
import {ParametricGeometry} from "three/examples/jsm/geometries/ParametricGeometry.js";
import {ParametricGeometries} from "three/examples/jsm/geometries/ParametricGeometries.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {SMAAPass} from "three/examples/jsm/postprocessing/SMAAPass.js";
import {BokehPass} from "three/examples/jsm/postprocessing/BokehPass.js";
import {SSAOPass} from "three/examples/jsm/postprocessing/SSAOPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/shaderpass.js";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import * as YUKA from "yuka";

// ASSETS
// Load in assets and any animations
const animatedMan = new URL("/public/Man.glb", import.meta.url);
const animatedMan2 = new URL("/public/Man2.glb", import.meta.url);
const benchModel = new URL("/public/bench.glb", import.meta.url);
const churchModel = new URL("/public/church2.glb", import.meta.url);
const stallModel = new URL("/public/market_stalls.glb", import.meta.url);
const statueModel = new URL("/public/statue1.glb", import.meta.url);
const statue2Model = new URL("/public/statue2.glb", import.meta.url);
const tescoOutsideModel = new URL("/public/tescos_outside.glb", import.meta.url);
const tescoLogo = new URL("/public/tesco_Logo.glb", import.meta.url);
const tesco1Model = new URL("/public/tescos1.glb", import.meta.url);
const tesco2Model = new URL("/public/tescos2.glb", import.meta.url);
const tesco3Model = new URL("/public/tescos3.glb", import.meta.url);
const tescoAssets = new URL("/public/tescoAssets.glb", import.meta.url);
const tescoAssetsLow = new URL("/public/tescoAssets_LowQuality.glb", import.meta.url);
const exitDoor = new URL("/public/exitDoor.glb", import.meta.url);

// Load the textures
const brickTexture = new THREE.TextureLoader().load("/public/textures/brick.jpg");
const redBrickTexture = new THREE.TextureLoader().load("/public/textures/redBrick/jpg");
// const groundTexture = new THREE.TextureLoader().load("/public/textures/ground.jpg");
// const greyTexture = new THREE.TextureLoader().load("/public/textures/grey.jpg");
// const stoneTexture = new THREE.TextureLoader().load("/public/textures/stone.jpg");
// const tileTexture = new THREE.TextureLoader().load("/public/textures/tile.jpg");
const whiteBrickTexture = new THREE.TextureLoader().load("/public/textures/whiteBrick.jpg");
const churchBrickTexture = new THREE.TextureLoader().load("/public/textures/ChurchBrick.jpg");
// Wrapping the textures (making the jpg smaller and repeating it sequentially)
redBrickTexture.wrapS = THREE.RepeatWrapping;
redBrickTexture.wrapT = THREE.RepeatWrapping;
redBrickTexture.repeat.set(10, 10);
brickTexture.wrapS = THREE.RepeatWrapping;
brickTexture.wrapT = THREE.RepeatWrapping;
brickTexture.repeat.set(40, 40);
whiteBrickTexture.wrapS = THREE.RepeatWrapping;
whiteBrickTexture.wrapT = THREE.RepeatWrapping;
whiteBrickTexture.repeat.set(10, 10);
churchBrickTexture.wrapS = THREE.RepeatWrapping;
churchBrickTexture.wrapT = THREE.RepeatWrapping;
churchBrickTexture.repeat.set(20, 20);

// INITIALISING
// Create the main scene
const scene = new THREE.Scene();

// Create the outdoor scene
const outdoors = new THREE.Scene();
// Create an indoor scene
const tescos = new THREE.Scene();
// Create a camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Define renderer with anti-aliasing (multisampling (MSAA) enabled)
const renderer = new THREE.WebGLRenderer({antialias: true});
// Set the ratio to the screen and the area of our interactive model
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );

// Enable the shadow-map
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Enable detection of on-click events
renderer.domElement.addEventListener("click", onMouseClick);
// renderer.domElement.addEventListener('mousemove', onMouseMove);

// Render the 3D model on the webpage
document.body.appendChild(renderer.domElement);
// Take in to account window resizing
window.addEventListener("resize", () => {
	this._OnWindowResize();
}, false);



// CAMERA
// Define the orbit controls to view everywhere
const controls = new OrbitControls(camera, renderer.domElement);
// Define various speeds for the orbit controls
controls.panSpeed = 3;
controls.rotateSpeed = 3;
controls.zoomSpeed = 3;

// Define the camera boundaries
controls.maxDistance = 40;
controls.minDistance = 1;

// Adjust the camera view target
// controls.target = new THREE.Vector3(0,0,0,)

// Define camera effects
controls.enableDampling = true;
controls.dampingFactor = 0.5;

// Define arrow key controls for the camera
controls.keys = {
	LEFT: "ArrowLeft",
	UP: "ArrowUp",
	RIGHT: "ArrowRight",
	BOTTOM: "ArrowDown"
};
controls.listenToKeyEvents(window);
// Define the key speed for the arrow control
controls.keyPanSpeed = 20;

// Define the initial camera position
camera.position.x = 8;
camera.position.y = 7;
camera.position.z = 13;
// Ensure view is directed at the initial scene
camera.lookAt(scene.position);

// Define save and load states for the camera
window.addEventListener("keydown", function(e) {
	if(e.code === "KeyS")
		controls.saveState();
	if(e.code === "KeyL")
		controls.reset();
	if(e.code === "KeyQ")
		camera.position.set(0, 28, 0);
});



// LIGHTING
// Outdoor scene light
// Create and add ambient lighting
const ambient = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambient);
// Create and add hemisphere light
const hemi = new THREE.HemisphereLight(0xffffbb, 0x080820, 2.8);
scene.add(hemi);
// Create and add directional light
const directional = new THREE.DirectionalLight(0xffffff, 2.0);
directional.position.set(0, 30, -50);
directional.target.position.set(0, 0, 0);

// Assign shadows to be created by the selected light sources
function shadows(lightChosen) {
	// Ensure a shadow is created for directional light
	lightChosen.castShadow = true;
	lightChosen.shadow.bias = -0.001;
	// Set the shadow quality
	lightChosen.shadow.mapSize.width = 6000;
	lightChosen.shadow.mapSize.height = 6000;
	lightChosen.shadow.camera.near = 0.01;
	lightChosen.shadow.camera.far = 500.0;
	// Shadows are only casted on objects closeby
	lightChosen.shadow.camera.left = -50;
	lightChosen.shadow.camera.right = 50;
	lightChosen.shadow.camera.top = 50;
	lightChosen.shadow.camera.bottom = -50;
	lightChosen.target.updateMatrixWorld();
};
shadows(directional);
outdoors.add(directional);
outdoors.add(THREE.DirectionalLight.target);

// Add the cast shadow function for models
function castShadow(modelName) {
	modelName.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
		}
	});
}

// View light location
const helper = new THREE.DirectionalLightHelper(directional, 100);
outdoors.add(helper);

// Tesco scene light
// Add a point light light from above for the indoor scene
const indoorLight = new THREE.PointLight(0xFFFFFF, 200.0);
indoorLight.position.set(0,10,0);
indoorLight.lookAt(-12,0,12);
indoorLight.castShadow = true;
const indoorLight2 = new THREE.PointLight(0xFFFFFF, 200.0);
indoorLight2.position.set(0,10,0);
indoorLight2.lookAt(12,0,-12);
// Ensure the point light creates a shadow
indoorLight2.castShadow = true;
tescos.add(indoorLight);
tescos.add(indoorLight2);

// Types of shadowmaps in order of easiness
// renderer.shadowMap.type = THREE.BasicShadowMap;
// renderer.shadowMap.type = THREE.PCFShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap;



// SCENE
// // Create a flat plane
// const roadWidth = 10;
// const roadLength = 100;
// const geometry = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 1);
// const material = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
// const road = new THREE.Mesh(geometry, material);
// // Rotate the road to lie on the XZ plane
// road.rotation.x = -Math.PI / 2;
// // Add the road to the scene
// scene.add(road);

// Add in the sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);
// sky.material.uniforms.mieCoefficient.value = 0.005;
// sky.material.uniforms.mieDirectionalG.value = 0.7;
renderer.toneMappingExposure = 0.5;

// Add in the sun
const sun = new THREE.Vector3();
let elevation = 0.5;
let azimuthAngle = 180;
const phi = THREE.MathUtils.degToRad(90 - elevation);
const theta = THREE.MathUtils.degToRad(azimuthAngle);
sun.setFromSphericalCoords(1, phi, theta);
// Copy this position to the shader
sky.material.uniforms.sunPosition.value.copy(sun);

// Create the parametric ground function
function parametricGroundFunction(u, v, target) {
    const scale = 500;
    const segments = 500;

    // Scale the u and v parameters based on the number of segments
    const uu = u * segments;
    const vv = v * segments;

    // Calculate the coordinates for the current point in the target vector
    const x = uu * scale;
    const y = vv * scale;
    const z = Math.sin(uu * Math.PI) * Math.cos(vv * Math.PI) * scale;

    // Set the coordinates for the current point in the target vector
    target.set(x, y, z);
}

// Add in the ground
const groundGeometry = new ParametricGeometry(parametricGroundFunction, 50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.castShadow = false;
ground.receiveShadow = true;
ground.rotation.x = -Math.PI / 2;
ground.position.set(-1000, 0, 1000);
outdoors.add(ground);

// Add parametric walls
// function parametricWallFunction(u, v, target) {
//     const scale = 500;
//     const segments = 500;

//     // Scale the u and v parameters based on the number of segments
//     const uu = u * segments;
//     const vv = v * segments;

//     // Calculate the coordinates for the current point in the target vector
//     const x = uu * scale;
//     const y = vv * scale;
//     const z = Math.sin(uu * Math.PI) * Math.cos(vv * Math.PI) * scale;

//     // Set the coordinates for the current point in the target vector
//     target.set(x, y, z);
// }

// const geometry = new ParametricGeometry(ParametricGeometries.cube, 25, 25 );
// const material2 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const klein = new THREE.Mesh( geometry, material2 );
// scene.add( klein );

// const ground = new THREE.Mesh(
// 	new THREE.PlaneGeometry(2000, 2000, 8, 8),
// 	new THREE.MeshStandardMaterial({
// 		color: 0x808080,
// 	})
// );
// ground.castShadow = false;
// ground.receiveShadow = true;
// ground.rotation.x = -Math.PI / 2;
// outdoors.add(ground);


// Define the loading manager
// GLTF is faster to read than FBX
const loadingManager = new GLTFLoader();

// Based on distance and based on ray-casting
// Adjust the model used based (asset vs simple)
// Also adjust the model mesh type based (normal vs phong)

// Position simple phong objects in the correct positions
function simpleObject(size, position, colour, sceneName){
	const geometry = new THREE.BoxGeometry(size);
	const material = new THREE.MeshPhongMaterial({ color: colour});
	const object = new THREE.Mesh(geometry, material);
	object.castShadow = true;
	object.receiveShadow = true;
	object.scale.set(scale);
	object.rotation.set(rotation);
	object.position.set(position);
	sceneName.add(statue1A);
}

// Initialise all LoDs for both scenes
const lodStatueModel = new THREE.LOD();
const lodStatue2Model = new THREE.LOD();
const lodbench1Model = new THREE.LOD();
const lodbench1rModel = new THREE.LOD();
const lodbench2Model = new THREE.LOD();
const lodbench2rModel = new THREE.LOD();
const lodbench3Model = new THREE.LOD();
const lodbench3rModel = new THREE.LOD();
const lodbench4Model = new THREE.LOD();
const lodbench4rModel = new THREE.LOD();
const lodstallModel = new THREE.LOD();
const lodchurchModel = new THREE.LOD();
const lodtescoLogo = new THREE.LOD();
outdoors.add(lodStatueModel);
outdoors.add(lodStatue2Model);
outdoors.add(lodbench1Model);
outdoors.add(lodbench1rModel);
outdoors.add(lodbench2Model);
outdoors.add(lodbench2rModel);
outdoors.add(lodbench3Model);
outdoors.add(lodbench3rModel);
outdoors.add(lodbench4Model);
outdoors.add(lodbench4rModel);
outdoors.add(lodstallModel);
outdoors.add(lodtescoLogo);
outdoors.add(lodchurchModel);

const lodtescoScene = new THREE.LOD();
const lodtescoScene2 = new THREE.LOD();
const lodtescoScene3 = new THREE.LOD();
tescos.add(lodtescoScene);
tescos.add(lodtescoScene2);
tescos.add(lodtescoScene3);

// Initialise progressive LOD
const lodtescoBuilding = new THREE.LOD;
const lodredBuilding = new THREE.LOD;
outdoors.add(lodtescoBuilding);
outdoors.add(lodredBuilding);

// Create a statue
// Phong geometry merging two objects
const statue1ATopGeometry = new THREE.BoxGeometry(1.5, 6, 1.5);
const statue1ABaseGeometry = new THREE.BoxGeometry(4, 1, 4);
const statue1AMaterial = new THREE.MeshPhongMaterial({ color: 0x808080});
const statue1ATop = new THREE.Mesh(statue1ATopGeometry, statue1AMaterial);
const statue1ABase = new THREE.Mesh(statue1ABaseGeometry, statue1AMaterial);
const statue1A = new THREE.Group();
statue1A.add(statue1ATop);
statue1A.add(statue1ABase);
statue1A.castShadow = true;
statue1A.receiveShadow = true;
statue1ABase.position.set(0, -2.5, 0);
statue1A.position.set(4,3,-6);
//outdoors.add(statue1A);
// Show the basic geometry when we are more than 20 units away
lodStatueModel.addLevel(statue1A, 30);

// The first statue asset
loadingManager.load(statueModel.href, function(gltf) {
	// Add the model to the scene
	const statue1B = gltf.scene;
	// Add the shadow to the model
	statue1B.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
		}
	});
	statue1B.scale.set(0.016,0.016,0.016);
	statue1B.position.set(4,0,-6);
	lodStatueModel.addLevel(statue1B, 0);
}, undefined, function(error) {
	console.error(error);
});

// Create the second statue
// Phong geometry
const statue2A = statue1ATop.clone();
statue2A.scale.set(0.6, 0.6, 0.6);
statue2A.position.set(-1, (3*0.6), 6.8);
statue2A.castShadow = false;
lodStatue2Model.addLevel(statue2A, 30);

// The second statue asset
loadingManager.load(statue2Model.href, function(gltf) {
	// Add the model to the scene
	const statue2B = gltf.scene;
	// Add the shadow to the model
	statue2B.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	statue2B.scale.set(55, 55, 55);
	statue2B.rotation.set(0,THREE.MathUtils.degToRad(90),0);
	statue2B.position.set(-1, 0, 6.8);
	//lodStatueModel.addLevel(statueB, 0);
	lodStatue2Model.addLevel(statue2B, 0);
}, undefined, function(error) {
	console.error(error);
});

// Create a simple phong bench
const benchGeometry = new THREE.BoxGeometry(1.5, 0.5, 3);
const benchMaterial = new THREE.MeshPhongMaterial({ color: 0x808080});
const bench = new THREE.Mesh(benchGeometry, benchMaterial);
bench.castShadow = false;
bench.receiveShadow = false;
bench.rotation.set(0,2,0);
bench.position.set(-1,0.25,-1);
lodbench1Model.addLevel(bench, 26);

// Create more simple phong benches
const bench1r = bench.clone();
bench1r.rotation.set(0,-2,0);
bench1r.position.set(8, 0.25, -1);
lodbench1rModel.addLevel(bench1r, 26);

const bench2 = bench.clone();
bench2.position.set(-1, 0.25, 4);
lodbench2Model.addLevel(bench2, 26);
const bench2r = bench.clone();
bench2r.rotation.set(0,-2,0);
bench2r.position.set(8, 0.25, 4);
lodbench2rModel.addLevel(bench2r, 26);

const bench3 = bench.clone();
bench3.position.set(-1, 0.25, 9);
lodbench3Model.addLevel(bench3, 26);
const bench3r = bench.clone();
bench3r.rotation.set(0,-2,0);
bench3r.position.set(8, 0.25, 9);
lodbench3rModel.addLevel(bench3r, 26);

const bench4 = bench.clone();
bench4.position.set(-1, 0.25, 14);
lodbench4Model.addLevel(bench4, 26);
const bench4r = bench.clone();
bench4r.rotation.set(0,-2,0);
bench4r.position.set(8, 0.25, 14);
lodbench4rModel.addLevel(bench4r, 26);

// Add the bench assets
loadingManager.load(benchModel.href, function(gltf) {
	// Add the model to the scene
	const bench1B = gltf.scene;
	// Add the shadow to the model
	bench1B.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	bench1B.scale.set(1.8, 1.4, 1.8);
	bench1B.rotation.set(0, (2 + THREE.MathUtils.degToRad(90)), 0);
	bench1B.position.set(-1,0,-1);
	lodbench1Model.addLevel(bench1B, 0);

	const bench1rB = bench1B.clone();
	bench1rB.rotation.set(0,(-2 + THREE.MathUtils.degToRad(90)),0);
	bench1rB.position.set(8, 0, -1);
	lodbench1rModel.addLevel(bench1rB, 0);
	
	const bench2B = bench1B.clone();
	bench2B.position.set(-1, 0, 4);
	lodbench2Model.addLevel(bench2B, 0);
	const bench2rB = bench1B.clone();
	bench2rB.rotation.set(0,(-2 + THREE.MathUtils.degToRad(90)),0);
	bench2rB.position.set(8, 0, 4);
	lodbench2rModel.addLevel(bench2rB, 0);
	
	const bench3B = bench1B.clone();
	bench3B.position.set(-1, 0, 9);
	lodbench3Model.addLevel(bench3B, 0);
	const bench3rB = bench1B.clone();
	bench3rB.rotation.set(0,(-2 + THREE.MathUtils.degToRad(90)),0);
	bench3rB.position.set(8, 0, 9);
	lodbench3rModel.addLevel(bench3rB, 0);
	
	const bench4B = bench1B.clone();
	bench4B.position.set(-1, 0, 14);
	lodbench4Model.addLevel(bench4B, 0);
	const bench4rB = bench1B.clone();
	bench4rB.rotation.set(0,(-2 + THREE.MathUtils.degToRad(90)),0);
	bench4rB.position.set(8, 0, 14);
	lodbench4rModel.addLevel(bench4rB, 0);

}, undefined, function(error) {
	console.error(error);
});

// Add an outdoor market stall
const stallGeometry = new THREE.BoxGeometry(1, 1, 4);
const stallMaterial = new THREE.MeshPhongMaterial({ color: 0x808080});
const stall = new THREE.Mesh(stallGeometry, stallMaterial);
stall.castShadow = false;
stall.receiveShadow = false;
stall.rotation.set(0,THREE.MathUtils.degToRad(180),0);
stall.position.set(14,0.5,7);
lodstallModel.addLevel(stall, 22);

// Add the stall asset
loadingManager.load(stallModel.href, function(gltf) {
	// Add the model to the scene
	const stallB = gltf.scene;
	// Add the shadow to the model
	stallB.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	stallB.scale.set(2.5, 2.5, 2.5);
	stallB.position.set(15,0,7);
	lodstallModel.addLevel(stallB, 0);

}, undefined, function(error) {
	console.error(error);
});

// Add the buildings
const tescosTopGeometry = new THREE.BoxGeometry(20, 6, 16);
const tescosBaseGeometry = new THREE.BoxGeometry(20, 6, 16);
const tescosTopMaterial = new THREE.MeshPhongMaterial({ map: whiteBrickTexture});
const tescosBottomMaterial = new THREE.MeshPhongMaterial({ map: whiteBrickTexture});
const tescosTop = new THREE.Mesh(tescosTopGeometry, tescosTopMaterial);
const tescosBase = new THREE.Mesh(tescosBaseGeometry, tescosBottomMaterial);
const tescosBuilding = new THREE.Group();
tescosBuilding.add(tescosTop);
tescosBuilding.add(tescosBase);
tescosTop.castShadow = true;
tescosTop.receiveShadow = true;
tescosBase.castShadow = true;
tescosBase.receiveShadow = true;
tescosTop.rotation.set(0,2.5,0);
tescosTop.position.set(0,0,-30);
tescosBase.rotation.set(0,2.5,0);
tescosBase.position.set(0,6,-30);
tescosBuilding.position.set(4,3,-6);
lodtescoBuilding.addLevel(tescosBuilding, 0);

// Add multi-texture resolution to the tesco building
const tescosTopGeometryLow = new THREE.BoxGeometry(20, 6, 16);
const tescosBaseGeometryLow = new THREE.BoxGeometry(20, 6, 16);
const tescosTopMaterialLow = new THREE.MeshPhongMaterial({ color: 0xe6d8b3});
const tescosBottomMaterialLow = new THREE.MeshPhongMaterial({ color: 0xe8e7e6});
const tescosTopLow = new THREE.Mesh(tescosTopGeometryLow, tescosTopMaterialLow);
const tescosBaseLow = new THREE.Mesh(tescosBaseGeometryLow, tescosBottomMaterialLow);
const tescosBuildingLow = new THREE.Group();
tescosBuildingLow.add(tescosTopLow);
tescosBuildingLow.add(tescosBaseLow);
tescosTopLow.castShadow = true;
tescosTopLow.receiveShadow = true;
tescosBaseLow.castShadow = true;
tescosBaseLow.receiveShadow = true;
tescosTopLow.rotation.set(0,2.5,0);
tescosTopLow.position.set(0,0,-30);
tescosBaseLow.rotation.set(0,2.5,0);
tescosBaseLow.position.set(0,6,-30);
tescosBuildingLow.position.set(4,3,-6);
lodtescoBuilding.addLevel(tescosBuildingLow, 24);

const bootsTopGeometry = new THREE.BoxGeometry(20, 9, 16);
const bootsBaseGeometry = new THREE.BoxGeometry(20, 3, 16);
const bootsTopMaterial = new THREE.MeshPhongMaterial({ color: 0xe0e0e0});
const bootsBottomMaterial = new THREE.MeshPhongMaterial({ color: 0x001069});
const bootsTop = new THREE.Mesh(bootsTopGeometry, bootsTopMaterial);
const bootsBase = new THREE.Mesh(bootsBaseGeometry, bootsBottomMaterial);
const bootsBuilding = new THREE.Group();
bootsBuilding.add(bootsTop);
bootsBuilding.add(bootsBase);
bootsTop.castShadow = true;
bootsTop.receiveShadow = true;
bootsBase.castShadow = true;
bootsBase.receiveShadow = true;
bootsTop.rotation.set(0,0,0);
bootsTop.position.set(0,4.5,-30);
bootsBase.rotation.set(0,0,0);
bootsBase.position.set(0,-1.5,-30);
bootsBuilding.position.set(0,3,9);
bootsBuilding.rotation.set(0,THREE.MathUtils.degToRad(90),0);
outdoors.add(bootsBuilding);

// function createBuilding(width, color1, color2, position) {
//     const newBuildingGeometry = new THREE.BoxGeometry(10, width, 16);
//     const newBuilding2Geometry = new THREE.BoxGeometry(10, width, 16);
//     const newBuildingMaterial = new THREE.MeshPhongMaterial({ color: color1 });
//     const newBuilding2Material = new THREE.MeshPhongMaterial({ color: color2 });
//     const newBuildingTop = new THREE.Mesh(newBuildingGeometry, newBuildingMaterial);
//     const newBuildingBase = new THREE.Mesh(newBuilding2Geometry, newBuilding2Material);
//     const newBuilding = new THREE.Group();

//     newBuilding.add(newBuildingTop);
//     newBuilding.add(newBuildingBase);

//     newBuildingTop.castShadow = true;
//     newBuildingTop.receiveShadow = true;
//     newBuildingBase.castShadow = true;
//     newBuildingBase.receiveShadow = true;

//     newBuildingTop.rotation.set(0, 0, 0);
//     newBuildingTop.position.set(0, 0, -30);

//     newBuildingBase.rotation.set(0, 0, 0);
//     newBuildingBase.position.set(0, 6, -30);

//     newBuilding.position.set(position);
//     newBuilding.rotation.set(0, THREE.MathUtils.degToRad(90), 0);

//     outdoors.add(newBuilding);
// }

const newBuildingGeometry = new THREE.BoxGeometry(10, 6, 16);
const newBuilding2Geometry = new THREE.BoxGeometry(10, 6, 16);
const newBuildingMaterial = new THREE.MeshPhongMaterial({ color: 0xab825c});
const newBuilding2Material = new THREE.MeshPhongMaterial({ color: 0x8B0000});
const newBuildingTop = new THREE.Mesh(newBuildingGeometry, newBuildingMaterial);
const newBuildingBase = new THREE.Mesh(newBuilding2Geometry, newBuilding2Material);
const newBuilding = new THREE.Group();
newBuilding.add(newBuildingTop);
newBuilding.add(newBuildingBase);
newBuildingTop.castShadow = true;
newBuildingTop.receiveShadow = true;
newBuildingBase.castShadow = true;
newBuildingBase.receiveShadow = true;
newBuildingTop.rotation.set(0,0,0);
newBuildingTop.position.set(0,0,-30);
newBuildingBase.rotation.set(0,0,0);
newBuildingBase.position.set(0,6,-30);
newBuilding.position.set(0,3,-7);
newBuilding.rotation.set(0,THREE.MathUtils.degToRad(90),0);
lodredBuilding.addLevel(newBuilding, 24);

// Add multi-testure resolution to the red building
const newBuildingGeometryLow = new THREE.BoxGeometry(10, 6, 16);
const newBuilding2GeometryLow = new THREE.BoxGeometry(10, 6, 16);
const newBuildingMaterialLow = new THREE.MeshPhongMaterial({ map: brickTexture});
const newBuilding2MaterialLow = new THREE.MeshPhongMaterial({ map: redBrickTexture});
const newBuildingTopLow = new THREE.Mesh(newBuildingGeometryLow, newBuildingMaterialLow);
const newBuildingBaseLow = new THREE.Mesh(newBuilding2GeometryLow, newBuilding2MaterialLow);
const newBuildingLow = new THREE.Group();
newBuildingLow.add(newBuildingTopLow);
newBuildingLow.add(newBuildingBaseLow);
newBuildingTopLow.castShadow = true;
newBuildingTopLow.receiveShadow = true;
newBuildingBaseLow.castShadow = true;
newBuildingBaseLow.receiveShadow = true;
newBuildingTopLow.rotation.set(0,0,0);
newBuildingTopLow.position.set(0,0,-30);
newBuildingBaseLow.rotation.set(0,0,0);
newBuildingBaseLow.position.set(0,6,-30);
newBuildingLow.position.set(0,3,-7);
newBuildingLow.rotation.set(0,THREE.MathUtils.degToRad(90),0);
lodredBuilding.addLevel(newBuildingLow, 0);

const greggsGeometry = new THREE.BoxGeometry(16, 12, 8);
const greggsMaterial = new THREE.MeshPhongMaterial({ color: 0xccbe99});
const greggsBuilding = new THREE.Mesh(greggsGeometry, greggsMaterial);
greggsBuilding.castShadow = true;
greggsBuilding.receiveShadow = true;
greggsBuilding.rotation.set(0,THREE.MathUtils.degToRad(180),0);
greggsBuilding.position.set(-30,6,-16);
outdoors.add(greggsBuilding);

// Add the church 
const churchGeometry = new THREE.BoxGeometry(16, 18, 8);
const churchMaterial = new THREE.MeshPhongMaterial({ color: 0xc9c3b1});
const churchA = new THREE.Mesh(churchGeometry, churchMaterial);
churchA.castShadow = true;
churchA.receiveShadow = true;
churchA.rotation.set(0,THREE.MathUtils.degToRad(180),0);
churchA.position.set(6,9,28);
lodchurchModel.addLevel(churchA, 26);

// Add the church model
loadingManager.load(churchModel.href, function(gltf) {
	// Add the model to the scene
	const churchB = gltf.scene;
	// Add the shadow to the model
	churchB.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			const newMaterial = new THREE.MeshPhongMaterial({ map: churchBrickTexture});
			child.material = newMaterial;
		}
	});
	churchB.scale.set(0.5, 0.5, 0.5);
	churchB.rotation.set(0,THREE.MathUtils.degToRad(90),0);
	churchB.position.set(6,-0.1,45);
	//lodStatueModel.addLevel(statueB, 0);
	lodchurchModel.addLevel(churchB, 0);
}, undefined, function(error) {
	console.error(error);
});

// Add the Tesco logo
loadingManager.load(tescoLogo.href, function(gltf) {
	// Add the model to the scene
	const tescoLogoModel = gltf.scene;
	// Add the shadow to the model
	tescoLogoModel.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
		}
	});
	tescoLogoModel.scale.set(0.05, 0.05, 0.05);
	tescoLogoModel.rotation.set(THREE.MathUtils.degToRad(90), 0, THREE.MathUtils.degToRad(-50));
	tescoLogoModel.position.set(13,9,-30);
	lodtescoLogo.addLevel(tescoLogoModel, 0);
}, undefined, function(error) {
	console.error(error);
});

// Add the indoor Tescos scene
loadingManager.load(tescoAssets.href, function(gltf) {
	// Add the model to the scene
	const tescoScene = gltf.scene;
	// Add the shadow to the model
	tescoScene.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
		}
	});
	tescoScene.scale.set(0.4, 0.4, 0.4);
	tescoScene.position.set(0,0,0);
	lodtescoScene.addLevel(tescoScene, 0);

	const tescoScene2 = tescoScene.clone();
	tescoScene2.position.set(-6,0,0);
	lodtescoScene2.addLevel(tescoScene2, 0);

	const tescoScene3 = tescoScene.clone();
	tescoScene3.position.set(-12,0,0);
	lodtescoScene3.addLevel(tescoScene3, 0);

}, undefined, function(error) {
	console.error(error);
});

// Add the lower quality Tesco assets
loadingManager.load(tescoAssetsLow.href, function(gltf) {
	// Add the model to the scene
	const tescoSceneLow = gltf.scene;
	// Add the shadow to the model
	tescoSceneLow.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
		}
	});
	tescoSceneLow.scale.set(0.4, 0.4, 0.4);
	tescoSceneLow.position.set(0,0,0);
	lodtescoScene.addLevel(tescoSceneLow, 8);

	const tescoSceneLow2 = tescoScene.clone();
	tescoSceneLow2.position.set(-6,0,0);
	lodtescoScene2.addLevel(tescoSceneLow2, 8);

	const tescoSceneLow3 = tescoScene.clone();
	tescoSceneLow3.position.set(-12,0,0);
	lodtescoScene3.addLevel(tescoSceneLow3, 8);

}, undefined, function(error) {
	console.error(error);
});

// Add the exit door which returns back to the original scene
let exitScene;
loadingManager.load(exitDoor.href, function(gltf) {
	// Add the model to the scene
	exitScene = gltf.scene;
	// Add the shadow to the model
	exitScene.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
		}
	});
	exitScene.scale.set(1.5, 1.5, 1.5);
	exitScene.position.set(5,0,-6);
	tescos.add(exitScene);

}, undefined, function(error) {
	console.error(error);
});

// Define the outdoor scene border
const borderGeometry = new THREE.BoxGeometry(36,36,36);
const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
borderMesh.position.y = 18;
outdoors.add(borderMesh);

// Define the indoor scene border
const borderGeometryTescos = new THREE.BoxGeometry(16,16,16);
const borderMeshTescos = new THREE.Mesh(borderGeometryTescos, borderMaterial);
borderMeshTescos.position.y = 8;
tescos.add(borderMeshTescos);

// Create a plane geometry for the floor
const floorGeometry = new THREE.PlaneGeometry(44, 44);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xeef0dd, side: THREE.DoubleSide });
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = Math.PI / -2;
floorMesh.position.set(0, 0, 0);
tescos.add(floorMesh);

const tescosArea = new THREE.BoxGeometry(44, 44, 44);
const tescosMaterial = new THREE.MeshBasicMaterial({ color: 0xd1d4bc, side: THREE.DoubleSide });
const tescosBound = new THREE.Mesh(tescosArea, tescosMaterial);
tescosBound.castShadow = true;
tescosBound.receiveShadow = true;
tescosBound.position.set(0, 0, 0);
tescos.add(tescosBound);



// AI AND ANIMATION
// Define the transformation array
let transformation = [];
// Define the model transformation function
function transform(modelName, transformation) {
	if (transformation) {
		modelName.scale.set(transformation[0], transformation[1], transformation[2]);
		modelName.rotation.set(transformation[3], transformation[4], transformation[5]);
		modelName.position.set(transformation[6], modelName.position.y = transformation[7], modelName.position.z = transformation[8]);
	}	
};

// The entity manager for all the walking humans
const entityManager = new YUKA.EntityManager();
function sync(entity, renderComponenet) {
	renderComponenet.matrix.copy(entity.worldMatrix);
	if (entity.position) {
        entity.position.clamp(new THREE.Vector3(-18, -5, -18), new THREE.Vector3(18, 5, 18));

	// const forbiddenMinX = -50;
	// const forbiddenMaxX = 0;
	// const forbiddenMinY = 100;
	// const forbiddenMaxY = 150;
	// const forbiddenMinZ = -25;
	// const forbiddenMaxZ = 25;

	// // Define the forbidden region
	// if (
	// 	object.position.x >= forbiddenMinX &&
	// 	object.position.x <= forbiddenMaxX &&
	// 	object.position.y >= forbiddenMinY &&
	// 	object.position.y <= forbiddenMaxY &&
	// 	object.position.z >= forbiddenMinZ &&
	// 	object.position.z <= forbiddenMaxZ
	// ) {
	// 	// Adjust position if in forbidden region
	// 	// For example, you can set its position to the boundary of the forbidden region
	// 	object.position.x = Math.max(forbiddenMinX, Math.min(object.position.x, forbiddenMaxX));
	// 	object.position.y = Math.max(forbiddenMinY, Math.min(object.position.y, forbiddenMaxY));
	// 	object.position.z = Math.max(forbiddenMinZ, Math.min(object.position.z, forbiddenMaxZ));
	// }
    }
}
// Add scene detail
// Define the animation loader function
let mixer;
loadingManager.load(animatedMan2.href, function(gltf) {
	// Define the animation handler function
	// function mixerFunction(modelName, animationName) {
	// 	// Define the mixer
	// 	mixer = new THREE.AnimationMixer(modelName);
	// 	const clips = gltf.animations;
	// 	// Define the correct animation clip
	// 	const clip = THREE.AnimationClip.findByName(clips, animationName);
	// 	const action = mixer.clipAction(clip);
	// 	action.play();
	// 	return mixer;
	// };
	
	// Add the model to the scene
	const walkingMan = gltf.scene;
	castShadow(walkingMan);
	transform(walkingMan, [1,1,1,0,0,0,0,0,0])
	const clips = gltf.animations;
	const humans = new THREE.AnimationObjectGroup();
	mixer = new THREE.AnimationMixer(humans);
	const clip = THREE.AnimationClip.findByName(clips, "Walk");
	const action = mixer.clipAction(clip);
	action.play();
	// mixer = mixerFunction(walkingMan, "Walk");

	for(let i = 0; i < 50; i++) {
		const humanClone = SkeletonUtils.clone(walkingMan);
		humanClone.matrixAutoUpdate = false;
		outdoors.add(humanClone);
		humans.add(humanClone);

		const vehicle = new YUKA.Vehicle();
		vehicle.setRenderComponent(humanClone, sync);

		const wanderBehaviour = new YUKA.WanderBehavior();
		vehicle.steering.add(wanderBehaviour);

		entityManager.add(vehicle);

		vehicle.position.x = 2.5 - Math.random() * 5;
		vehicle.position.z = 2.5 - Math.random() * 5;
		vehicle.rotation.fromEuler(0, 2 * Math.PI * Math.random(), 0);
	}

}, undefined, function(error) {
	console.error(error);
});

// var walkingMan2 = SkeletonUtils.clone(walkingMan);
// walkingMan2.position.set(10,10,10);
// outdoors.add(walkingMan2);
// function mixerFunction(modelName, animationName) {
// 	// Define the mixer
// 	mixer = new THREE.AnimationMixer(modelName);
// 	const clips = gltf.animations;
// 	// Define the correct animation clip
// 	const clip = THREE.AnimationClip.findByName(clips, animationName);
// 	const action = mixer.clipAction(clip);
// 	action.play();
// 	return mixer;
// };
// mixer2 = mixerFunction(walkingMan, "Walk");

// SCENE 2
// No need for a cube-map as we have the indoors 
// if we click the model
// hide scene 1, load scene 2
// if (camera.position === THREE.Vector3(1,1,1)) {

// };

// Create the objects
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add(cube);


// Older combined functions for the model and animation loader
// // Define the loading manager
// // GLTF is faster to read than FBX
// const loadingManager = new GLTFLoader();
// // Define the transformation array
// let transformation = [];
// // Define the model loader function
// function loadModel(modelName, sceneName, transformation) {
// 	// Turn this into a function, so it is easy to call, with input name for href and the animation we want
// 	loadingManager.load(modelName, function(gltf) {
// 		// Add the model to the scene
// 		const model = gltf.scene;
// 
// 		// Add the necessary tranformation
// 		if (transformation) {
// 			model.rotation.x = transformation[0];
// 			model.rotation.x = transformation[1];
// 			model.rotation.x = transformation[2];
// 			model.position.x = transformation[3];
// 			model.position.y = transformation[4];
// 			model.position.z = transformation[5];
// 			model.scale.set = (transformation[6], transformation[7], transformation[8]);	
// 		}
//
// 	  // Add the shadow to the model
// 		model.traverse((child) => {
// 			if (child.isMesh) {
// 				child.castShadow = true;
// 			}
// 	  	});
// 		sceneName.add(model);
// 	}, undefined, function(error) {
// 	  console.error(error);
// 	});
//   }
//
// // Initialise the mixer
// let mixer;
// // Define the animation loader function
// function loadAnimation(modelName, animationName, sceneName, transformation) {
//   // Turn this into a function, so it is easy to call, with input name for href and the animation we want
//   loadingManager.load(modelName, function(gltf) {
//     // Add the model to the scene
// 	const model = gltf.scene;
//
// 	// Add the necessary transformation
// 	if (transformation) {
// 		model.rotation.x = transformation[0];
// 		model.rotation.y = transformation[1];
// 		model.rotation.z = transformation[2];
// 		model.position.x = transformation[3];
// 		model.position.y = transformation[4];
// 		model.position.z = transformation[5];
// 		model.scale.set(transformation[6], transformation[7], transformation[8]);	
// 	}
//
// 	// Add the cast shadow
// 	model.traverse((child) => {
//         if (child.isMesh) {
//             child.castShadow = true;
//         }
//     });
//     sceneName.add(model);
//
// 	// Define the mixer
//     mixer = new THREE.AnimationMixer(model);
//     const clips = gltf.animations;
//
// 	// Define the correct animation clip
//     const clip = THREE.AnimationClip.findByName(clips, animationName);
//     const action = mixer.clipAction(clip);
//     action.play();
//   }, undefined, function(error) {
//     console.error(error);
//   });
// }
// Load the walk animation
// loadAnimation(animatedMan.href, "Walk", scene, [0, 0, 0, 0, 0, 0, 1, 1, 1]);
// loadAnimation(animatedMan.href, "Walk", scene, [0, 2, 0, 4, 0, 0, 1, 1, 1]);
// loadAnimation(animatedMan.href, "Walk", scene, [1, 2, 0, 4, 0, 0, 1, 1, 1]);



// RAYCASTING
scene.add(outdoors);
// Advaced LoD - mult-texture resolution (far away = colours instead of textures and no shadows)
function onMouseMove(event){
	// The mouse position
	const mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// The intersection point between the plane and the casted ray
	// const intersectionPoint = new THREE.Vector3();
	// // The direction of the plane
	// const planeNormal = new THREE.Vector3();
	// // The created plane when moving the mouse
	// const plane = new THREE.Plane();
	// The ray cast between the camera and the mouse
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	// Attempted implementation at advanced LoD (considering multi-texture resolution)
	// if (raycaster.intersectObject(tescosBuilding).length > 0) {
	// 	// Change texture depending on distance
	// 	tescosTop.castShadow = false;
	// 	tescosTop.receiveShadow = false;
	// 	tescosBase.castShadow = false;
	// 	tescosBase.receiveShadow = false;
	// 	tescosTop.material = THREE.MeshPhongMaterial({ map: whiteBrickTexture});
	// 	// Get rid of shadow depending on distance
	// } else {
	// 	tescosTop.material = THREE.MeshPhongMaterial({ color: 0xf0f0f0});
	// };

	// if (raycaster.intersectObject(walkingMan).length > 0) {
	// 	var object = raycaster.intersectObject(walkingMan, true)[0].object;
	// 	object.color.material.set(0xffff00);
	// }
}


function onMouseClick(event) {
	// The mouse position
	const mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// The intersection point between the plane and the casted ray
	// const intersectionPoint = new THREE.Vector3();
	// // The direction of the plane
	// const planeNormal = new THREE.Vector3();
	// // The created plane when moving the mouse
	// const plane = new THREE.Plane();
	// The ray cast between the camera and the mouse
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);

	if (raycaster.intersectObject(tescosBuilding).length > 0) {
		scene.remove(outdoors)
		scene.add(tescos)
		// Re-position the camera
		controls.maxDistance = 28;
		camera.position.x = 8;
		camera.position.y = 7;
		camera.position.z = 13;
		camera.lookAt(scene.position);
		controls.enablePan = false;
	};
			// Define the initial camera position
	if (raycaster.intersectObject(exitScene).length > 0) {
		scene.remove(tescos);
		scene.add(outdoors);
		// Re-position the camera
		controls.maxDistance = 40;
		camera.position.x = 8;
		camera.position.y = 7;
		camera.position.z = 13;
		camera.lookAt(scene.position);
		controls.enablePan = true;
	};

};



// POST-PROCESSING
// Create the composer to combine post-processing passes
var composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
// Creates a glow effect around bright areas (the sun)
composer.addPass(new UnrealBloomPass({x: 1024, y: 1024}, 2.0, 0.0, 200.0));
// Fast approximate anti-aliasing, however results in grainy textures
// composer.addPass(new ShaderPass(FXAAShader));
// Use anti-aliasing to smooth rendered object appearance
composer.addPass(new SMAAPass(window.innerWidth, window.innerHeight));
// Slight blur on out-of-focus areas
composer.addPass(new BokehPass(scene, camera, {
	focus: 0.5,
	aperture: 0.0002,
	maxblur: 0.0001,
	width: window.innerWidth,
	height: window.innerHeight
}));
// Ambient occlusion, however distorts shadows when softening
// composer.addPass(new SSAOPass(scene, camera, window.innerWidth, window.innerHeight, 16))



// ANIMATIONS
// Define the animations
const time = new YUKA.Time();
const clock = new THREE.Clock();
function animate() {

    // if (walkingMan) {
    //     walkingMan.rotation.x += 0.05;
    // }
	requestAnimationFrame( animate );

	const clockDelta = clock.getDelta();
	if(mixer)
		mixer.update(clockDelta);
	const delta = time.update().getDelta();
	entityManager.update(delta);

	// Prevent the camera from going underground
	camera.position.clamp(new THREE.Vector3(-40,0,-40), new THREE.Vector3(40,40,40));
	// Update the orbit controls
	controls.update();
	// Render the scene and camera
	composer.render();
	renderer.setClearColor( 0xffffff );
}

animate();