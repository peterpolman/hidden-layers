import firebase from 'firebase';
import maleSrc from '../assets/img/user-male.png';
import femaleSrc from '../assets/img/user-female.png';

export default class MarkerService {
  constructor() {
    this.map = null
    this.markers = firebase.database().ref('markers')
    this.offsetRef = firebase.database().ref('.info/serverTimeOffset')
    this.estimatedServerTimeMs = null
    this.userMarkers = []
    this.directionMarkers = []
    this.avatars = {
      male: maleSrc,
      female: femaleSrc
    }
    this.directionsService = null
  }

  listen(map) {
    this.map = map
    this.directionsService = new google.maps.DirectionsService();

    this.markers.on('child_added', function(snap) {
      this.onChildAdded(snap.key, snap.val())
    }.bind(this));

    this.markers.on('child_changed', function(snap) {
      this.onChildChanged(snap.key, snap.val());
    }.bind(this));

    this.markers.on('child_removed', function(snap) {
      this.onChildRemoved(snap.key);
    }.bind(this));

    this.offsetRef.on("value", function(snap) {
      const offset = snap.val();
      this.estimatedServerTimeMs = new Date().getTime() + offset;
    }.bind(this));
  }

  walk(uid, fromLatlng, toLatlng, travelMode) {
    this.directionsService.route({
      origin: fromLatlng,
      destination: toLatlng,
      travelMode: travelMode
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {

        const data = {
          uid: uid,
          path: []
        }

        for (var i = 0; i < response.routes[0].overview_path.length; i++) {
          data.path.push({
            lat: response.routes[0].overview_path[i].lat(),
            lng: response.routes[0].overview_path[i].lng()
          })
        }

        const key = this.directionMarkers.length
        this.createMarker(key, data)

      } else {
        console.warn('Directions request failed due to ' + status);
      }
    }.bind(this));
  }

  onChildAdded(key, data) {
    this.directionMarkers[key] = data;

    const sphericalLib = google.maps.geometry.spherical;

    var pointDistances = [];
    var pointZero = new google.maps.LatLng(data.path[0]);
    var totalDist = sphericalLib.computeDistanceBetween(
      pointZero,
      new google.maps.LatLng(data.path[data.path.length - 1])
    );

    var path = [];

    for (var i = 0; i < data.path.length; i++) {
        var latlng = new google.maps.LatLng(data.path[i])
        path.push(latlng)
        pointDistances[i] = 100 * sphericalLib.computeDistanceBetween(latlng, pointZero) / totalDist;
    }

    var line = new google.maps.Polyline({
        path: path,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 0,
        icons: [{
            icon: {
              path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
              fillColor: '#FF0000',
              fillOpacity: .75,
              anchor: new google.maps.Point(0,0),
              strokeWeight: 0,
              scale: .3
            },
            offset: '100%'
        }],
    });

    line.setMap(this.map)

    var index = 0;
    var count = 0;
    var offset;

    var id = window.setInterval(function() {
      count = (count + 1) % 200;
      offset = count / 2;

      var icons = line.get('icons')
      icons[0].offset = (offset) + '%'

      line.set('icons', icons)

      if (line.get('icons')[0].offset == "99.5%") {
        icons[0].offset = '100%'
        line.set('icons', icons)
        window.clearInterval(id)
        line.setMap(null)
        this.removeMarker(key)
      }
    }.bind(this))
  }

  onChildChanged(key, data) {
    console.log(`Child timestamp updated`);
  }

  onChildRemoved(key) {
    // this.directionMarkers[key].setMap(null)
    // this.directionMarkers.splice(key, 1);
  }

  createMarker(key, data) {
    this.markers.child(key).set(data)
    this.markers.child(key).update({
      '/timestamp': firebase.database.ServerValue.TIMESTAMP
    });
  }

  removeMarker(key) {
    return this.markers.child(key).remove()
  }

  createUserMarker(uid, data, me) {
    const userMarker = new google.maps.Marker({
      id: uid,
      position: (data.position != null) ? new google.maps.LatLng(data.position.lat, data.position.lng) : null,
      icon: {
        url: this.avatars[data.gender],
        size: new google.maps.Size(40, 40),
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0,0),
      },
      animation: (me === true) ? google.maps.Animation.DROP : null
    });

    return this.userMarkers[uid] = userMarker;
  }

  updateUserMarker(uid, data) {
    this.userMarkers[uid]

    return this.userMarkers[uid]
  }

}
