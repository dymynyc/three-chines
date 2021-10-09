THREE = require('three')
require('three/examples/js/controls/OrbitControls')
require('three/examples/js/deprecated/Geometry')

console.log(THREE.OrbitControls)

var scene = new THREE.Scene();

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 3;
camera.position.y = -3;
camera.rotation.x = Math.PI/6

CAMERA = camera
// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// Configure renderer clear color
renderer.setClearColor("#000000", 1);

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight );

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera, renderer.domElement)

//Create a DirectionalLight and turn on shadows for the light
const light2 = new THREE.DirectionalLight( 0xffffff, 1, 100 );
light2.position.set( 0, -10, 10 ); //default; light shining from top
light2.castShadow = true; // default false
scene.add( light2 );


var cube = new THREE.Mesh(
  new THREE.IcosahedronGeometry( 1, 0)
  , new THREE.MeshLambertMaterial( { color: "#433F81" } )
);
//scene.add(cube)


// SPLINE **

var {reflectPoints, createSpline, curvesToGeometry} = require('./index')(THREE)

var mirror = new THREE.Plane(new THREE.Vector3(1,0,0), 0)
var mirror2 = new THREE.Plane(new THREE.Vector3(0,1,0), 0)

var src_points = [
	new THREE.Vector3( -5, 0, 0.4),
	new THREE.Vector3( -3,  0.4, 0.17 ),
	new THREE.Vector3( 0,  0.6, 0 )
]

var _src_points = src_points.concat(reflectPoints(mirror, src_points, false))
var _src_points2 = reflectPoints(mirror2, _src_points, true).reverse()

var sp1 = SP1 = createSpline(_src_points, 0xff0000)
scene.add(sp1)

var sp2 = SP2 = createSpline(_src_points, 0x00ff00)
sp2.position.z = -1
sp2.geometry.scale(0.95,0.6,1)
scene.add(sp2)

var sp3 = SP3 = createSpline(_src_points2, 0x00ff00)
scene.add(sp3)

var sp4 = SP4 = createSpline(_src_points2, 0x00ff00)
sp4.position.z = -1
sp4.geometry.scale(0.95,0.6,1)
scene.add(sp4)



//move this stuff into a chine hull creator
var geometry = new THREE.Geometry()
curvesToGeometry(geometry, sp1, sp2)
curvesToGeometry(geometry, sp3, sp4)
curvesToGeometry(geometry, sp2, sp4)
geometry.computeFaceNormals();
geometry.computeVertexNormals();


console.log("GEOM", GEO=geometry)
var m=    new THREE.MeshBasicMaterial( { color: "#ff0000" } )
//var m=    new THREE.MeshLambertMaterial( { color: "#ff0000" } )
//var m=    new THREE.MeshPhongMaterial( { color: "#ff0000" } )
//m.wireframe = true
scene.add(
  new THREE.Mesh(
    geometry.toBufferGeometry(),
    //new THREE.MeshPhongMaterial( { color: "#ff0000" } )
    m
  )
)
//*/

var speed = 0.01
// Render Loop

var frame = 1/60
var _ts = performance.now() / 1000
;(function render () {

  controls.update()
  
  // Render the scene
  renderer.render(scene, camera);

  requestAnimationFrame( render );

})();
