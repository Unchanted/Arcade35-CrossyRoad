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
