var unfold = require('three-unfold')
module.exports = function (THREE) {

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

  function faceNormal (vA, vB, vC) {
		return vC.clone().sub(vB).cross( vA.clone().sub(vB) ).normalize()
  }

  function curvesToGeometry(geo, a, b) {
    var origin = new THREE.Vector3(0, 0, 0)
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
      
      var f_a = geo.vertices[j+2]
      var f_b = geo.vertices[j+1]
      var f_c = geo.vertices[j+0]
      var normal = faceNormal(f_a, f_b, f_c)
      var oa = origin.clone().sub(f_a)
       
      console.log('normal', normal.dot(oa), normal, oa)

      if(normal.dot(oa) < 0)
        geo.faces.push(
          new THREE.Face3(j+2, j+1, j+0),
          new THREE.Face3(j+1, j+2, j+3)
        )
      else
        geo.faces.push(
          new THREE.Face3(j+0, j+1, j+2),
          new THREE.Face3(j+3, j+2, j+1)
        )
    }
    geo.computeFaceNormals()
    return geo
  }
  return {reflectPoints, createSpline, curvesToGeometry}
}