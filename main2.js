

'use strict'; 

//   GLOBALS ==========================================================================//
var scene, renderer, player, camera;
//array that holds the assignments of either road or grass -- necessary for generating them later
var lanes = [];
// variable to that is created when the playerObject function is run. Allows for the players position to be used by other functions
var player;
// true when the player movement is complete and false when its incomplete
var done = true; 
// Because the vehicle collision function is run when each frame is rendered a global is needed to determine each time the player collides with a car
var hitCount = 0;
// Array that holds all the vehicles and to be used to in the collisionVehicle function to test for collisions between the player and vehicles
var collidableVehicle = [];
// Array which holds all of the truck objects and will be used to animate the trucks 
var trucksArray = [];
// Array which holds all of the car objects and will be used to animate the cars  
var carsArray = [];
//colors for the vehicles
var vehicleColors = ['red','blue','lightgreen','yellow','black'];
// Array for the trees
var treeMatrix = [];




function main(){
    
    //var stats = initStats();
    var carsArray = [];
    //creates the scene and gives it a skyblue background
    scene = new THREE.Scene();
    scene.background =  new THREE.Color('green');
    
    //renders the scene in the browser
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    
    //creates the camera and sets its initial placement
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0,300, -310);
    camera.rotation.set(60*Math.PI/180, -180*Math.PI/180, 0);
    camera.updateProjectionMatrix();
    
    // light sources
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(-100, -100, 200);
    light.castShadow = true;
    //light.shadowDarkness = 0.75;
    scene.add(light);
    
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    scene.add(hemiLight);
    
    var backLight = new THREE.DirectionalLight(0xffffff, .75);
    backLight.position.set(200, 200,0);
    backLight.castShadow = true;
    scene.add(backLight);
    
    // score display
    var score = document.createElement('div');
    score.style.position = 'absolute';
    score.style.width = 7+'%';//100 + 'px';
    score.style.height = 7+'%';//50 + 'px';
    score.style.backgroundColor = "white";
    score.style.top = 0 + '%';
    score.style.left = 2 + '%';
    score.style.fontSize = 300 + '%';
    score.style.fontFamily = 'Sans-serif';
    document.body.appendChild(score);      
    
    
    
    //function that is used to generate an array with road and grass randomly assigned. It is used later in when the road and grass are actually created. 
    function generateLaneArray(size){
        for(let x= 0; x < size; x++){
            if((Math.floor((Math.random() * 2) + 1)) === 1)
                lanes[x] = 'road';
            else
                lanes[x] = 'grass';
        }
        return lanes;
    }
    
     //function that uses the lanes[] to call the grass() and road() functions, which are placed in the scene
   function lane(){
       let count = 0;
        lanes.forEach(function(x){
            if(x === 'road'){
                let stripOfRoad = new road(count);
                count++;
            }
            else{
               let stripOfGrass = new grass(count);
                count++;
            }
        });
        
 }   
    
    
    generateLaneArray(800);  
    lane();
    playerObject();
    carAnimate();
    truckAnimate();


