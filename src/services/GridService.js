const jsts = require('jsts')

export default class GridService {
  constructor () {
  }

  discover(markers, visibility) {
    for (let uid in markers) {
      var isHidden = google.maps.geometry.poly.containsLocation(markers[uid].position, visibility)
      markers[uid].setVisible(!isHidden)
    }

    return markers
  }

  circlePath(center, radius, points) {
    var a = [], p = 360 / points, d = 0;

    for (var i = 0; i < points; ++i, d+= p) {
      a.push(google.maps.geometry.spherical.computeOffset(center, radius, d));
    }

    // JSTS geometry needs same end as start latlng
    a[points] = a[0]

    return a
  }

  createMarkerId(latLng) {
    const id = (latLng.lat + "_" + latLng.lng)
    return id.replace(/\./g,'')
  }

  setGrid(myUserMarker, myScoutMarker = null, myWardMarkers = []) {
    const outerBounds = [
      new google.maps.LatLng({lng: -11.3600718975, lat: 40.4630057984}),
      new google.maps.LatLng({lng: 31.5241158009, lat: 40.4630057984}),
      new google.maps.LatLng({lng: 31.5241158009, lat: 57.032878786}),
      new google.maps.LatLng({lng: -11.3600718975, lat: 57.032878786})
    ];

    var visibility = []
    visibility.push(outerBounds)

    var geoms = {}

    var myUserMarkerPath = this.circlePath(myUserMarker.position, 100, 256)
    var myUserMarkerPoly = new google.maps.Polygon({
      paths: [myUserMarkerPath]
    })
    myUserMarkerPoly.path = myUserMarkerPath
    var userGeom = this.jstsPoly(myUserMarkerPoly);
    userGeom.id = this.createMarkerId({lat: myUserMarkerPath[0].lat(), lng: myUserMarkerPath[0].lng()})
    geoms[userGeom.id] = userGeom;

    if (myScoutMarker != null) {
      var myScoutMarkerPath = this.circlePath(myScoutMarker.position, 50, 256)
      var myScoutMarkerPoly = new google.maps.Polygon({
        paths: [myScoutMarkerPath]
      })
      myScoutMarkerPoly.path = myScoutMarkerPath
      var scoutGeom = this.jstsPoly(myScoutMarkerPoly);
      scoutGeom.id = this.createMarkerId({lat: myScoutMarkerPath[0].lat(), lng: myScoutMarkerPath[0].lng()})
      geoms[scoutGeom.id] = scoutGeom;
    }

    var myWardMarkersPath = []

    myWardMarkers.length = 0

    if (myWardMarkers != []) {
      for (var id in myWardMarkers) {
        myWardMarkers.length++

        var wardPath = this.circlePath(myWardMarkers[id].position, 50, 256)
        var wardPoly = new google.maps.Polygon({
          paths: [wardPath]
        })
        wardPoly.path = wardPath
        var wardGeom = this.jstsPoly(wardPoly);
        wardGeom.id = this.createMarkerId({lat: wardPath[0].lat(), lng: wardPath[0].lng()})
        geoms[wardGeom.id] = wardGeom;
      }
    }

    var allGeoms = geoms

    for (var i in geoms) {
      for (var j in geoms) {
        if ( geoms[i].intersects(geoms[j]) && (i != j) ) {

          geoms[i] = geoms[i].union(geoms[j])

          delete geoms[j]
        }
      }
    }

    for (var geomIndex in geoms) {
      visibility.push( this.jsts2googleMaps(geoms[geomIndex]) )
    }

    return visibility
  }

  jstsPoly(poly) {
    var geometryFactory = new jsts.geom.GeometryFactory();

    return geometryFactory.createPolygon(geometryFactory.createLinearRing(this.googleMaps2JSTS( poly.getPath() )));
  }

  googleMaps2JSTS(boundaries) {
    var coordinates = [];
    for (var i = 0; i < boundaries.getLength(); i++) {
      coordinates.push(new jsts.geom.Coordinate(
        boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
    }

    return coordinates;
  };

  jsts2googleMaps(geometry) {
    var coordArray = geometry.getCoordinates();
    var GMcoords = [];
    for (var i = 0; i < coordArray.length; i++) {
      GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
    }

    return GMcoords;
  }
}
