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


function reflectPoints(mirror, points, duplicate) {
  var _points = []
  for(var i = 0; i < points.length; i++ ) {
    var point = points[i]
    var distance = mirror.distanceToPoint(point)
    if(distance !== 0)
      _points.unshift(point.clone().addScaledVector(mirror.normal, distance*-2))
    else if(duplicate)
      _points.unshift(point.clone())
  }
  return _points
}


// Create a sine-like wave
//const curve = new THREE.SplineCurve( [

function createSpline(points, color) {
  const curve = new THREE.CatmullRomCurve3(
    points
  );
  curve.curveType = 'chordal'

  const geometry = new THREE.BufferGeometry().setFromPoints( curve.getPoints( 50 ) )

  const material = new THREE.LineBasicMaterial( { color } );

  // Create the final object to add to the scene
  return new THREE.Line( geometry, material )
}


var mirror = new THREE.Plane(new THREE.Vector3(1,0,0), 0)
var mirror2 = new THREE.Plane(new THREE.Vector3(0,1,0), 0)

var src_points = [
	new THREE.Vector3( -5, 0, 0.4),
	new THREE.Vector3( -3,  0.4, 0.17 ),
	new THREE.Vector3( 0,  0.6, 0 )
]


var _src_points = src_points.concat(reflectPoints(mirror, src_points, false))
var _src_points2 = reflectPoints(mirror2, _src_points, true).reverse()
console.log('_src',_src_points)
console.log('_src2',_src_points2)

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

function readAttribute(attribute) {
  var S = attribute.itemSize
  var out = new Array(attribute.array.length/S)
  if(S === 2) {
    for(var i = 0; i < attribute.array.length; i += S)
      out[i/S] = new THREE.Vector3(
        attribute.array[i], 
        attribute.array[i+1]
      )

  }
  else if(S === 3) {
    for(var i = 0; i < attribute.array.length; i += S)
      out[i/S] = new THREE.Vector3(
        attribute.array[i],
        attribute.array[i+1], 
        attribute.array[i+2]
      )
  }
  return out
}


//console.log(readAttribute(sp1.geometry.attributes.position))

function Face (a, b, c) {
  var n = b.clone().sub(a).cross(c.clone().sub(a)).normalize()
  return {
    a, b, c, normal: n
  }
}

function curvesToGeometry(geo, a, b) {
  var points_a = readAttribute(a.geometry.attributes.position)
  var points_b = readAttribute(b.geometry.attributes.position)
  var faces = []
  for(var i = 0; i < points_a.length-1; i++) {
    var j = geo.vertices.length
    geo.vertices.push(
      points_a[i].clone().add(a.position),
      points_a[i+1].clone().add(a.position),

      points_b[i].clone().add(b.position),
      points_b[i+1].clone().add(b.position)
    )
    geo.faces.push(
      new THREE.Face3(j+2, j+1, j+0),
      new THREE.Face3(j+1, j+2, j+3)
  //    new THREE.Face3(j+0, j+1, j+2),
    //  new THREE.Face3(j+3, j+2, j+1)
    )
  }
  return geo
}


var geometry = new THREE.Geometry()
curvesToGeometry(geometry, sp1, sp2)
curvesToGeometry(geometry, sp3, sp4)
curvesToGeometry(geometry, sp2, sp4)

geometry.computeFaceNormals();
geometry.computeVertexNormals();

console.log("GEOM", GEO=geometry)
//var m=    new THREE.MeshBasicMaterial( { color: "#ff0000" } )
var m=    new THREE.MeshLambertMaterial( { color: "#ff0000" } )
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

  // cube = line
   cube.rotation.x += speed;
   cube.rotation.y += speed;
  cube.rotation.z += -speed;
  
  // Render the scene
  renderer.render(scene, camera);


  requestAnimationFrame( render );

})();
