import firebase from 'firebase';

import PathService from '../services/PathService';

import Scout from '../models/Scout';
import User from '../models/User';

import Ward from '../models/Ward'

const jsts = require('jsts')

export default class MarkerController {
  constructor(uid) {
    this.uid = uid
    this.map = null

    this.pathService = new PathService
    this.connectedRef = firebase.database().ref('.info/connected')
    this.usersRef = firebase.database().ref('users')
    this.scoutsRef = firebase.database().ref('scouts')
    this.wardsRef = null

    this.myUserMarker = null
    this.myScoutMarker = null
    this.userMarkers = []
    this.scoutMarkers = []
    this.wardMarkers = []

    this.userInfoWindow = null
    this.scoutInfoWindow = null

    this.isWalking = false
  }

  listen(map) {
    this.map = map
    this.wardsRef = firebase.database().ref('wards').child(this.uid)
    this.pathService.listen(this.map)
    this.userInfoWindow = new google.maps.InfoWindow({
      isHidden: false
    });
    this.scoutInfoWindow = new google.maps.InfoWindow({
      isHidden: false
    });

    const userConnectionsRef = this.usersRef.child(this.uid).child('connections');
    const lastOnlineRef = this.usersRef.child(this.uid).child('lastOnline');

    this.connectedRef.on('value', function(snap) {
      if (snap.val() === true)  {
        const connection = userConnectionsRef.push();

        connection.onDisconnect().remove();
        connection.set(true);
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      }
    });

    this.usersRef.on('child_added', function(snap) {
      if (snap.key != this.uid) {
        console.log(`[ADD] User ${snap.key}`);
        this.onUserAdded(snap.key, snap.val())
      }
      else {
        this.onMyUserAdded(snap.key, snap.val())
      }
    }.bind(this));

    this.usersRef.on('child_changed', function(snap) {
      if (snap.key != this.uid) {
        console.log(`[CHANGE] User ${snap.key}`);
        this.onUserChanged(snap.key, snap.val())
      }
      else {
        this.onMyUserChanged(snap.key, snap.val())
      }

      var visibility = this.setGrid()
      this.discover(visibility)
    }.bind(this));

    this.scoutsRef.on('child_added', function(snap) {
      if (snap.key != this.uid) {
        console.log(`[ADD] Scout ${snap.key}`);
        this.onScoutAdded(snap.key, snap.val())
      }
      else {
        this.onMyScoutAdded(snap.key, snap.val())
      }
    }.bind(this));

    this.scoutsRef.on('child_changed', function(snap) {
      if (snap.key != this.uid) {
        console.log(`[CHANGE] Scout ${snap.key}`);
        this.onScoutChanged(snap.key, snap.val());
      }
      else {
        this.onMyScoutChanged(snap.key, snap.val());
      }

      var visibility = this.setGrid()
      this.discover(visibility)
    }.bind(this));

    this.wardsRef.on('child_added', function(snap) {
      this.onWardAdded(snap.key, snap.val());

      var visibility = this.setGrid()
      this.discover(visibility)
    }.bind(this));

    this.wardsRef.on('child_removed', function(snap) {
      this.onWardRemoved(snap.key, snap.val());

      var visibility = this.setGrid()
      this.discover(visibility)
    }.bind(this));

  }

  createWard(data) {
    if (this.wardMarkers.length < 5) {
      const id = this.createMarkerId(data.position)
      data['id'] = id
      this.wardsRef.child(id).set(data)
    }
    else {
      alert('Remove a ward first by tapping it.');
    }
  }

  removeWard(id) {
    this.wardsRef.child(id).remove()
  }

  createMarkerId(latLng) {
    const id = (latLng.lat + "_" + latLng.lng)
    return id.replace(/\./g,'')
  }

  onWardRemoved(id, val) {
    this.wardMarkers[id].setMap(null)
    delete this.wardMarkers[id]
  }

  onWardAdded(id, data) {
    const ward = new Ward(this.uid, data.position, 40, this.map)

    ward.addListener('click', function(e) {
      this.removeWard(id)
    }.bind(this))

    this.wardMarkers[id] = ward
  }

  discover(visibility) {
    for (let uid in this.userMarkers) {
      var isHidden = google.maps.geometry.poly.containsLocation(this.userMarkers[uid].position, visibility)
      this.userMarkers[uid].setVisible(!isHidden)
    }
    for (let uid in this.scoutMarkers) {
      var isHidden = google.maps.geometry.poly.containsLocation(this.scoutMarkers[uid].position, visibility)
      this.scoutMarkers[uid].setVisible(!isHidden)
    }
  }

  onMyUserAdded(uid, data) {
    this.myUserMarker = new User(uid, data.position, data.userClass, data.username, data.email, 50, this.map, true);
    this.myUserMarker.addListener('click', function(e){
      const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

      this.userInfoWindow.setContent(content);
      this.userInfoWindow.open(this.map, this.myUserMarker);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.myUserMarker.setMap(this.map);
    this.map.panTo(this.myUserMarker.position)
  }

  onMyUserChanged(uid, data) {
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
    this.myUserMarker.setPosition(latlng)
  }

  onMyScoutAdded(uid, data) {
    this.myScoutMarker = new Scout(uid, data.position, 40, data.mode);
    this.myScoutMarker.addListener('click', function(e) {
      const username = this.myUserMarker.username
      const content = `<strong>Scout [${username}]</strong><br><small>Last move: ${new Date(data.timestamp).toLocaleString("nl-NL")}</small>`

      this.scoutInfoWindow.setContent(content);
      this.scoutInfoWindow.open(this.map, this.myScoutMarker);

      this.map.panTo(e.latLng)

      var customEvent = new CustomEvent('cursor_changed', { detail: "SCOUT" })
      window.dispatchEvent(customEvent);

    }.bind(this))

    this.myScoutMarker.setMap(this.map);

    this.isWalking = (this.myScoutMarker.mode == "WALKING")
  }

  onMyScoutChanged(uid, data) {
    this.myScoutMarker.setPosition(data.position)
    this.myScoutMarker.set('mode', data.mode)
    this.isWalking = (this.myScoutMarker.mode == "WALKING")
  }

  onUserAdded(uid, data) {
    this.userMarkers[uid] = new User(uid, data.position, data.userClass, data.username, data.email, 50, this.map, false);
    this.userMarkers[uid].addListener('click', function(e){
      const content = `<strong>${data.username}</strong><br><small>Last online: ${new Date(data.lastOnline).toLocaleString("nl-NL")}</small>`

      this.userInfoWindow.setContent(content);
      this.userInfoWindow.open(this.map, this.userMarkers[uid]);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.userMarkers[uid].setVisible(true);
  }

  onUserChanged(uid, data) {
    const latlng = new google.maps.LatLng(data.position.lat, data.position.lng)
    this.userMarkers[uid].setPosition(latlng)
  }

  onUserRemoved(uid) {
    this.userMarkers[uid].setMap(null)
    delete this.userMarkers[uid]
  }

  createUser(uid, data) {
    this.usersRef.child(uid).set(data)
  }

  updateUser(uid, data) {
    this.usersRef.child(uid).update(data);
  }

  removeUser(uid) {
    this.usersRef.child(uid).remove();
  }

  onScoutAdded(uid, data) {
    this.scoutMarkers[uid] = new Scout(uid, data.position, 40, data.mode);
    this.scoutMarkers[uid].addListener('click', function(e) {
      const username = this.userMarkers[uid].username
      const content = `<strong>Scout [${username}]</strong><br><small>Last move: ${new Date(data.timestamp).toLocaleString("nl-NL")}</small>`

      this.scoutInfoWindow.setContent(content);
      this.scoutInfoWindow.open(this.map, this.scoutMarkers[uid]);

      this.map.panTo(e.latLng)
    }.bind(this))

    this.scoutMarkers[uid].setMap(this.map);
    this.scoutMarkers[uid].setVisible(false)
  }

  onScoutChanged(uid, data) {
    this.scoutMarkers[uid].setPosition(data.position)
    this.scoutMarkers[uid].set('mode', data.mode)
  }

  // onScoutRemoved(uid) {
  //   console.log(`[REMOVE] SCOUT ${uid}`);
  // }

  send(fromLatlng, toLatlng) {
    fromLatlng = this.myScoutMarker.position
    this.pathService.route(this.uid, fromLatlng, toLatlng, "WALKING")
  }

  createScout(uid, data) {
    this.scoutsRef.child(uid).set(data)
  }

  // updateScout(uid, data) {
  //   this.scoutsRef.child(uid).update(data)
  // }

  // removeScout(uid, data) {
  //   this.scoutsRef.child(uid).remove()
  // }

  circlePath(center, radius, points) {
    var a = [], p = 360 / points, d = 0;

    for (var i = 0; i < points; ++i, d+= p) {
      a.push(google.maps.geometry.spherical.computeOffset(center, radius, d));
    }

    // JSTS geometry needs same end as start latlng
    a[points] = a[0]

    return a
  }

  setGrid() {
    const outerBounds = [
      new google.maps.LatLng({lng: -11.3600718975, lat: 40.4630057984}),
      new google.maps.LatLng({lng: 31.5241158009, lat: 40.4630057984}),
      new google.maps.LatLng({lng: 31.5241158009, lat: 57.032878786}),
      new google.maps.LatLng({lng: -11.3600718975, lat: 57.032878786})
    ];

    var visibility = []
    visibility.push(outerBounds)

    var geoms = {}

    var myUserMarkerPath = this.circlePath(this.myUserMarker.position, 200, 256)
    var myUserMarkerPoly = new google.maps.Polygon({
      paths: [myUserMarkerPath]
    })
    myUserMarkerPoly.path = myUserMarkerPath
    var userGeom = this.jstsPoly(myUserMarkerPoly);
    userGeom['id'] = this.createMarkerId({lat: myUserMarkerPath[0].lat(), lng: myUserMarkerPath[0].lng()})
    geoms[userGeom.id] = userGeom;

    if (this.myScoutMarker != null) {
      var myScoutMarkerPath = this.circlePath(this.myScoutMarker.position, 100, 256)
      var myScoutMarkerPoly = new google.maps.Polygon({
        paths: [myScoutMarkerPath]
      })
      myScoutMarkerPoly.path = myScoutMarkerPath
      var scoutGeom = this.jstsPoly(myScoutMarkerPoly);
      scoutGeom['id'] = this.createMarkerId({lat: myScoutMarkerPath[0].lat(), lng: myScoutMarkerPath[0].lng()})
      geoms[scoutGeom.id] = scoutGeom;
    }

    var myWardMarkersPath = []

    this.wardMarkers.length = 0
    if (this.wardMarkers != []) {
      for (var id in this.wardMarkers) {
        this.wardMarkers.length++

        var wardPath = this.circlePath(this.wardMarkers[id].position, 50, 256)
        var wardPoly = new google.maps.Polygon({
          paths: [wardPath]
        })
        wardPoly.path = wardPath
        var wardGeom = this.jstsPoly(wardPoly);
        wardGeom['id'] = this.createMarkerId({lat: wardPath[0].lat(), lng: wardPath[0].lng()})
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

    // Should not be removed once out of the bounds_changed event
    this.map.data.forEach(function(feature) {
      this.map.data.remove(feature);
    }.bind(this))

    this.map.data.add({ geometry: new google.maps.Data.Polygon(visibility) })
    this.map.data.setStyle({
      fillColor: '#000',
      fillOpacity: .75,
      strokeWeight: 0,
      clickable: false
    });

    return new google.maps.Polygon({ paths: visibility })
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
