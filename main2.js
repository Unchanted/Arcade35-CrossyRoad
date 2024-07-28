'use strict';

// GLOBALS
let scene, renderer, player, camera;
const lanes = [];
let done = true;
let hitCount = 0;
const collidableVehicle = [];
const trucksArray = [];
const carsArray = [];
const vehicleColors = ['red', 'blue', 'lightgreen', 'yellow', 'black'];
const treeMatrix = [];

function main() {
    initializeScene();
    initializeCamera();
    initializeLights();
    initializeScoreDisplay();

    generateLaneArray(800);
    createLanes();
    playerObject();
    carAnimate();
    truckAnimate();

    animate();
}

function initializeScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('green');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
}

function initializeCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 300, -310);
    camera.rotation.set(60 * Math.PI / 180, -180 * Math.PI / 180, 0);
    camera.updateProjectionMatrix();
}

function initializeLights() {
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(-100, -100, 200);
    light.castShadow = true;
    scene.add(light);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    scene.add(hemiLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.75);
    backLight.position.set(200, 200, 0);
    backLight.castShadow = true;
    scene.add(backLight);
}

function initializeScoreDisplay() {
    const score = document.createElement('div');
    score.style.position = 'absolute';
    score.style.width = '7%';
    score.style.height = '7%';
    score.style.backgroundColor = 'white';
    score.style.top = '0%';
    score.style.left = '2%';
    score.style.fontSize = '300%';
    score.style.fontFamily = 'Sans-serif';
    document.body.appendChild(score);
}

function generateLaneArray(size) {
    for (let x = 0; x < size; x++) {
        lanes[x] = (Math.floor((Math.random() * 2) + 1)) === 1 ? 'road' : 'grass';
    }
}

function createLanes() {
    lanes.forEach((laneType, index) => {
        if (laneType === 'road') {
            new Road(index);
        } else {
            new Grass(index);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    setUpKeyControls();
    score.innerHTML = `${Math.floor(player.position.z / 80) + 2}`;
    renderer.render(scene, camera);
    runOver();
}

class Road {
    constructor(index) {
        this.createRoad(index);
        this.createVehicles(index);
    }

    createRoad(index) {
        const highway = new THREE.Mesh(
            new THREE.BoxGeometry(800, 1, 80, 1),
            new THREE.MeshPhongMaterial({ color: 'gray' })
        );

        const bound = new THREE.Mesh(
            new THREE.BoxGeometry(2300, 1, 80, 1),
            new THREE.MeshPhongMaterial({ color: 'darkgrey' })
        );

        bound.position.set(0, -1, index * 80);
        highway.position.set(0, 0, index * 80);
        scene.add(bound);
        scene.add(highway);
    }

    createVehicles(index) {
        const vehicleRand = Math.floor((Math.random() * 10) + 1);
        if (vehicleRand % 2 === 0) {
            trucksArray.push(this.createTruck((Math.random() * 900) + 1, index * 80));
        } else {
            carsArray.push(this.createCar((Math.random() * 900) + 1, index * 80));
        }
    }

    createTruck(x, z) {
        const trucker = new THREE.Group();
        const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

        const base = new THREE.Mesh(
            new THREE.BoxGeometry(200, 10, 40),
            new THREE.MeshLambertMaterial({ color: 0xb4c6fc, flatShading: true })
        );
        base.position.z = 20;
        collidableVehicle.push(base);
        trucker.add(base);

        const cargo = new THREE.Mesh(
            new THREE.BoxGeometry(150, 80, 60),
            new THREE.MeshPhongMaterial({ color: 0xb4c6fc, flatShading: true })
        );
        cargo.position.set(30, 30, 20);
        cargo.castShadow = true;
        cargo.receiveShadow = true;
        collidableVehicle.push(cargo);
        trucker.add(cargo);

        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(50, 60, 50),
            [
                new THREE.MeshPhongMaterial({ color, flatShading: true }),
                new THREE.MeshPhongMaterial({ color, flatShading: true }),
                new THREE.MeshPhongMaterial({ color, flatShading: true }),
                new THREE.MeshPhongMaterial({ color, flatShading: true }),
                new THREE.MeshPhongMaterial({ color, flatShading: true }),
                new THREE.MeshPhongMaterial({ color, flatShading: true })
            ]
        );
        cabin.position.set(-80, 20, 20);
        collidableVehicle.push(cabin);
        trucker.add(cabin);
    }

    createTruckWheel() {
        return new THREE.Mesh(
            new THREE.BoxGeometry(24, 24, 56),
            new THREE.MeshLambertMaterial({ color: 0x333333, flatShading: true })
        );
    }

    createCarWheel() {
        return new THREE.Mesh(
            new THREE.BoxGeometry(20, 20, 15),
            new THREE.MeshLambertMaterial({ color: 0x333333, flatShading: true })
        );
    }
}

// Assuming Grass is another class similar to Road with its own implementation
class Grass {
    constructor(index) {
        // Implementation for Grass class
    }
}

main();
