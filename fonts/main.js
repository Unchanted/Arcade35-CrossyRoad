'use strict'; 

//   GLOBALS ==========================================================================//
var scene, renderer, player, camera;
//array that holds the assignments of either road or grass -- necessary for generating them later
var lanes = [];
var trucker;
var player;
var done = true; 
var treeCollision;
var hitTarget;
var treeCount = 0;
 var treeNum = 0;
var treeMesh;
var collidableVehicle = [];
//an array for the trucks 
    var trucksArray = [];
//array for the cars 
    var carsArray = [];
//colors for the vehicles
    var vehicleColors = ['red','blue','lightgreen','yellow','black'];
var treeMatrix = [];




function main(){
    
    var stats = initStats();
    var carsArray = [];
    //creates the scene and gives it a skyblue background
    scene = new THREE.Scene();
    scene.background =  new THREE.Color('green');
    
    //renders the scene in the browser
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    //renderer.shadowMap.Enabled = true;
    document.body.appendChild(renderer.domElement);
    
    //creates the camera and sets its initial placement
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0,300, -310);
     camera.rotation.set(60*Math.PI/180, -180*Math.PI/180, 0);
    camera.updateProjectionMatrix();
    
    
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
                road(count);
                count++;
            }
            else{
               grass(count);
                count++;
            }
        });
        
 }     

//function that generates a strip of road and either one or 2 trucks for that lane 
   function road(x){
       
       //playable road 
        var road_geo = new THREE.BoxGeometry(800,1,80,1);
        var road_mat = new THREE.MeshPhongMaterial({color: 'gray'});         
        var road = new THREE.Mesh(road_geo, road_mat);  
       
       //out of bounds road
        var bound_geo = new THREE.BoxGeometry(2300,1,80,1);
        var bound_mat = new THREE.MeshPhongMaterial({color: 'darkgrey'});
        var bound = new THREE.Mesh(bound_geo, bound_mat);
       
       
        var vehicleRand = Math.floor((Math.random() * 10) + 1);
        let  i = 0;
        if(vehicleRand % 2 === 0){
            trucksArray.push(truck((Math.random()*900)+1,x*80));
            i++;
        }
        else{
            carsArray.push(car((Math.random()*900)+1,x*80));
            i++;
        }
        

        bound.position.set(0,-1,x*80);
        road.position.set(0,0,x*80);
        scene.add(bound);
        scene.add(road);
    }
    
    //function that generates a strip of grass and 1-5 trees for that strip of grass. 
   function grass(x){
       
        const grass = new THREE.Mesh(
             new THREE.BoxGeometry(800,10,80,1), 
             new THREE.MeshLambertMaterial({color: 'green'})
        );
       
        const out = new THREE.Mesh(
            new THREE.BoxGeometry(2000,10,80,1),
            new THREE.MeshLambertMaterial({color: 'darkgreen'})
        );
       
        //number of trees in one strip
        var treeCount = Math.floor((Math.random() * 4) + 1);
       //number of trees total
        var treeNumber = 0;
        treeMatrix[x] = [];
        let innerArray = [];
       
        for(treeCount; treeCount >0; treeCount--){
            
            var treeGrid =Math.floor((Math.random()*8) + 1);
            if(treeCount % 3 ==0){
               innerArray.push(tree((400 - treeGrid*100),x*80)); 
            }
            else{
               innerArray.push(tree((-400 + treeGrid*100),x*80));
            } 
            
        }
        treeMatrix[x].push(innerArray);
       
        grass.position.set(0,0,x*80);
        out.position.set(0,-1,x*80);
        scene.add(out);
        scene.add(grass);
   }
         
    
    // function that creates trees -- made up of a trunk and a leaf
    function tree(x,z){
        

        treeMesh = new THREE.Group();
        
        const trunk = new THREE.Mesh(
            new THREE.CubeGeometry(25,60,25),
            new THREE.MeshLambertMaterial({color: 0x9A6169})
        ); 
        trunk.position.set(x,10, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeMesh.add(trunk);
        
        const leaf = new THREE.Mesh(
            new THREE.CubeGeometry(50,50,50,2,2,2),
             new THREE.MeshLambertMaterial({wireframe: false, color: 'lightgreen'})
        );
        leaf.position.set(x,50,z);
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        treeMesh.add(leaf);
        
        const cage = new THREE.Mesh(
            new THREE.CubeGeometry(70,80,70,5,5,5),
            new THREE.MeshLambertMaterial({wireframe: true, visible:false})
        );
        cage.position.set(x,50,z);
        treeMesh.add(cage);
        scene.add(cage);
        
        scene.add(treeMesh);
        return cage;
        
    }

 //function that creates the character the player uses
    function player(){
        
        
        player = new  THREE.Mesh(
            new THREE.BoxGeometry(30,30,50,50,50,50),
            //new THREE.MeshLambertMaterial({visible : true, color: 'gray', wireframe: true})
            new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('cow.jpg')})
        );   
         
        player.position.set(0,20,-160);
        player.name = 'player';
        player.castShadow = true;
        player.receiveShadow = true;
        scene.add(player);
        return player;
    }
    
   /* const truckFrontTexture = new Texture(30,30,[{x: 15, y: 0, w: 10, h: 30 }]);
const truckRightSideTexture = new Texture(25,30,[{x: 0, y: 15, w: 10, h: 10 }]);
const truckLeftSideTexture = new Texture(25,30,[{x: 0, y: 5, w: 10, h: 10 }]);*/
   
    //function to create the wheels of cars or trucks -- here I have only implemented trucks.
    function truckWheel() {
        const t_wheel = new THREE.Mesh( 
        new THREE.BoxGeometry( 24, 24, 56), 
        new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
        );
        return t_wheel;
    }
    
     function carWheel() {
        const c_wheel = new THREE.Mesh( 
        new THREE.BoxGeometry( 20, 20, 15), 
        new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
        );
        return c_wheel;
    }
    
    
    
//function to create a truck    
function truck(x,z) {
    trucker = new THREE.Group();
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
    
    
    const frontWheel = new truckWheel();
    frontWheel.position.set(-76,-20,20);
    collidableVehicle.push(frontWheel);
    trucker.add(frontWheel);
  
    const middleWheel = new truckWheel();
    middleWheel.position.set(-20,-20,20);
    collidableVehicle.push(middleWheel);
    trucker.add(middleWheel);

    const backWheel = new truckWheel();
    backWheel.position.set(60,-20,20);
    collidableVehicle.push(backWheel);
    trucker.add(backWheel);
    
    
    trucker.position.set(x,20,z);
    //collidableVehicle.push(trucker);
    
    scene.add(trucker);
    
    
    return trucker;
    
  } 

  //function that creates car
function car(x,z) {
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
      new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),//, map: carBackTexture } ),
      new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),//, map: carFrontTexture } ),
      new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),//, map: carRightSideTexture } ),
      new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),//, map: carLeftSideTexture } ),
      new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ), // top
      new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ) // bottom
    ]
  );

  cabin.position.set(-10,20,0);
  //cabin.castShadow = true;
  //cabin.receiveShadow = true;
  collidableVehicle.push(cabin);
  car.add( cabin );
  
  const backLeftWheel = new carWheel();
  backLeftWheel.position.set(-36,5,-20);
  car.add( backLeftWheel );
    
  const backRightWheel = new carWheel();
  backRightWheel.position.set(-36,5,20);
  car.add(backRightWheel);

  const frontLeftWheel = new carWheel();
  frontLeftWheel.position.set(36, 5, -20);
    //collidableVehicle.push(frontLeftWheel);
  car.add( frontLeftWheel );
    
  const frontRightWheel = new carWheel();
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
    
    
    //animation loop for the trucks -- trucks move at 3 different speeds and go back to the start when they moved too far
    // need to figure out how to make the trucks look smooth --> likely has to do with the fps and the fact they are moving 3,5,7 units at a time
    function truckAnimate(){
        
       function truckTween(x,time){
                var start = {x: 700}; 
                var end =   {x: -700};
                var truckForward = new TWEEN.Tween(start)
                .to(end,time)
                .repeat(Infinity)
                .start();

            truckForward.onUpdate(function(){
                trucksArray[x].position.x = start.x;
            }); 
        }
        
        for(let i = 0; i < trucksArray.length; i++){    
            var rand = Math.floor(Math.random()*(8000-5000+1)+5000);
            truckTween(i, rand);
            
        }
        
        
    }
    
    function carAnimate(){
      
        function carTween(x,time){
                var start = {x: -600}; 
                var end =   {x: 600};
                var carForward = new TWEEN.Tween(start)
                .to(end,time)
                .repeat(Infinity)
                .start();
            
            carForward.onUpdate(function(){
                carsArray[x].position.x = start.x;
            }); 
        }
        
        for(let i = 0; i < carsArray.length; i++){    
            var rand = Math.floor(Math.random()*(5000-1000+1)+1000);
            carTween(i, rand);
            
        }
       
        
    }
 generateLaneArray(1000);  
    lane();
    player();
    
    
    
        
    function right(){
        var playerPosition = new THREE.Vector3();
        playerPosition.setFromMatrixPosition(player.matrixWorld);
        
        var start = {x:playerPosition.x, y:0, z:playerPosition.z};
        var end = {x : (playerPosition.x-80), y:0, z:playerPosition.z};
        var tweenR = new TWEEN.Tween(start)
        .to(end, 150)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
                
        var bool = false;
        done = false;
        
        tweenR.onUpdate(function(){
            let z = start.z / 80;        
            if(z >= 0){
                    if(lanes[z] === 'grass'){
                        for(let i = 0; i < treeMatrix[z][0].length; i++){
                            if(Math.abs(end.x - treeMatrix[z][0][i].position.x) < 50){
                                tweenR.stop();
                                bool = true;
                                done = true;
                            }

                        } 
                        if(!bool){
                            player.position.x = start.x; 
                        }
                    }
                    else{
                        player.position.x = start.x;
                    }
                }
                else{
                    player.position.x = start.x;
                }
            
            
        });
        
        tweenR.onComplete(function(){
            done = true;
        });

    }
  
    

    function left() {
    const playerPosition = new THREE.Vector3();
    playerPosition.setFromMatrixPosition(player.matrixWorld);

    const start = { x: playerPosition.x, y: 0, z: playerPosition.z };
    const end = { x: playerPosition.x + 80, y: 10, z: playerPosition.z };
    const tweenL = new TWEEN.Tween(start)
        .to(end, 150)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    let done = false;

    tweenL.onUpdate(() => {
        const z = start.z / 80;
        if (z >= 0 && lanes[z] === 'grass') {
            const collision = treeMatrix[z][0].some(tree => Math.abs(end.x - tree.position.x) < 50);
            if (collision) {
                tweenL.stop();
                done = true;
            } else {
                player.position.x = start.x;
            }
        } else {
            player.position.x = start.x;
        }
    });

    tweenL.onComplete(() => {
        done = true;
    });
    }

function up(){
        var playerPosition = new THREE.Vector3();
        playerPosition.setFromMatrixPosition(player.matrixWorld);
                
        var camStart = {x:0, y:300, z:(playerPosition.z - 200)};
        var camEnd = {x :0, y:300, z:(playerPosition.z - 180)};
        var tweenCam = new TWEEN.Tween(camStart)
        .to(camEnd, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
        
        var start = {x:playerPosition.x, y:0, z:playerPosition.z};
        var end = {x :playerPosition.x, y:0, z:(playerPosition.z + 80)};
        var tweenUp = new TWEEN.Tween(start)
        .to(end, 150)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
        
        var bool = false;
        done = false;
        let camStop = 0;
         
        
        tweenUp.onUpdate(function(){
            let z = end.z / 80;
            if(z >= 0){
                if(lanes[z] === 'grass'){
                    for(let i = 0; i < treeMatrix[z][0].length; i++){
                        if(Math.abs(end.x - treeMatrix[z][0][i].position.x) < 50){
                            tweenUp.stop();
                            //tweenCam.stop();
                            bool = true;
                            done = true;
                        }

                    } 
                    if(!bool){
                        player.position.z = start.z; 
                    }
                }
                else{
                    player.position.z = start.z;
                }
            }
            else{
               player.position.z = start.z;
            }            
        });
        
         tweenCam.onUpdate(function(){
                camera.position.z = camStart.z; 
        });
        
        tweenUp.onComplete(function(){
            done = true;
        });
        
}
