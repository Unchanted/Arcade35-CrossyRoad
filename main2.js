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

    
    function animate(){
        requestAnimationFrame(animate);
        TWEEN.update();
        //stats.update();
        setUpKeyControls();
        score.innerHTML = `${Math.floor(player.position.z / 80) + 2}`;
        renderer.render(scene, camera);
        runOver();
        
    }
    animate();
    
}

    //function that generates a strip of road and either one or 2 trucks for that lane 
   class road{
       
       constructor(x){
           //playable road 
            const highway = new THREE.Mesh(
                new THREE.BoxGeometry(800,1,80,1),
                new THREE.MeshPhongMaterial({color: 'gray'})
            );        

           //out of bounds road
            const bound = new THREE.Mesh(
                new THREE.BoxGeometry(2300,1,80,1),
                new THREE.MeshPhongMaterial({color: 'darkgrey'})
            );       

            var vehicleRand = Math.floor((Math.random() * 10) + 1);
            let  i = 0;
            if(vehicleRand % 2 === 0){
                trucksArray.push(this.truck((Math.random()*900)+1,x*80));
                i++;
            }
            else{
                carsArray.push(this.car((Math.random()*900)+1,x*80));
                i++;
            }

            bound.position.set(0,-1,x*80);
            highway.position.set(0,0,x*80);
            scene.add(bound);
            scene.add(highway);
           }
       
        //function to create the wheels of cars or trucks 
        truckWheel() {
                const t_wheel = new THREE.Mesh( 
                new THREE.BoxGeometry( 24, 24, 56), 
                new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
                );
                return t_wheel;
            }

        carWheel() {
                const c_wheel = new THREE.Mesh( 
                new THREE.BoxGeometry( 20, 20, 15), 
                new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
                );
                return c_wheel;
            }



        //function to create a truck    
        truck(x,z) {
            const trucker = new THREE.Group();
            const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];


            const base = new THREE.Mesh(
                new THREE.BoxGeometry( 200, 10, 40 ), 
                new THREE.MeshLambertMaterial( { color: 0xb4c6fc, flatShading: true } )
            );
            base.position.z = 20;
            collidableVehicle.push(base);
            trucker.add(base);

            const cargo = new THREE.Mesh(
              new THREE.BoxGeometry( 150, 80, 60 ), 
              new THREE.MeshPhongMaterial( { color: 0xb4c6fc, flatShading: true } )
            );

            cargo.position.set(30,30,20);
              cargo.castShadow = true;
            cargo.receiveShadow = true;
            collidableVehicle.push(cargo);
            trucker.add(cargo);

            const cabin = new THREE.Mesh(
              new THREE.BoxGeometry( 50, 60, 50 ), 
              [
                new THREE.MeshPhongMaterial( { color, flatShading: true } ), // back
                new THREE.MeshPhongMaterial( { color, flatShading: true}) ,
                new THREE.MeshPhongMaterial( { color, flatShading: true } ),
                new THREE.MeshPhongMaterial( { color, flatShading: true } ),
                new THREE.MeshPhongMaterial( { color, flatShading: true } ), // top
                new THREE.MeshPhongMaterial( { color, flatShading: true } ) // bottom
              ]
            );
            cabin.position.set(-80,20,20); 
            collidableVehicle.push(cabin);
            trucker.add(cabin);


            const frontWheel = this.truckWheel();
            frontWheel.position.set(-76,-20,20);
            collidableVehicle.push(frontWheel);
            trucker.add(frontWheel);

            const middleWheel = this.truckWheel();
            middleWheel.position.set(-20,-20,20);
            collidableVehicle.push(middleWheel);
            trucker.add(middleWheel);

            const backWheel = this.truckWheel();
            backWheel.position.set(60,-20,20);
            collidableVehicle.push(backWheel);
            trucker.add(backWheel);


            trucker.position.set(x,20,z);
            

            scene.add(trucker);


            return trucker;

          } 

            //function that creates car
        car(x,z) {
              const car = new THREE.Group();
              const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

              const frame = new THREE.Mesh(
                new THREE.BoxBufferGeometry(100,20,50 ), 
                new THREE.MeshPhongMaterial( { color, flatShading: true } )
              );
              frame.position.y = 10;
              frame.castShadow = true;
              frame.receiveShadow = true;
              collidableVehicle.push(frame);
              car.add(frame);

              const cabin = new THREE.Mesh(
                new THREE.BoxBufferGeometry( 60, 24, 35), 
                [
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ), // top
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ) // bottom
                ]
              );

              cabin.position.set(-10,20,0);
              //cabin.castShadow = true;
              //cabin.receiveShadow = true;
              collidableVehicle.push(cabin);
              car.add( cabin );

              const backLeftWheel = this.carWheel();
              backLeftWheel.position.set(-36,5,-20);
              car.add( backLeftWheel );

              const backRightWheel = this.carWheel();
              backRightWheel.position.set(-36,5,20);
              car.add(backRightWheel);

              const frontLeftWheel = this.carWheel();
              frontLeftWheel.position.set(36, 5, -20);
                //collidableVehicle.push(frontLeftWheel);
              car.add( frontLeftWheel );

              const frontRightWheel = this.carWheel();
              frontRightWheel.position.set(36, 5, 20);
                //collidableVehicle.push(frontRightWheel);
              car.add( frontRightWheel );

              //car.castShadow = true;
              //car.receiveShadow = false;

              car.position.set(x,20,z);
                //collidableVehicle.push(car);
              scene.add(car);

              return car;  
            }
       
       
    }
