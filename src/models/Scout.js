import scoutSrc from '../assets/img/wolf-1.png';

import firebase from 'firebase';
import config from '../config.js'

import Path from './Path';

export default class Scout {
  constructor(
    uid,
    position,
    size,
    mode
  ) {

    // Don't forget to credit the guy
    google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
      var EarthRadiusMeters = 6378137.0; // meters
      var lat1 = this.lat();
      var lon1 = this.lng();
      var lat2 = newLatLng.lat();
      var lon2 = newLatLng.lng();
      var dLat = (lat2-lat1) * Math.PI / 180;
      var dLon = (lon2-lon1) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = EarthRadiusMeters * c;
      return d;
    }

    google.maps.Polyline.prototype.GetPointAtDistance = function(metres) {
      // some awkward special cases
      if (metres == 0) return this.getPath().getAt(0);
      if (metres < 0) return null;
      if (this.getPath().getLength() < 2) return null;
      var dist=0;
      var olddist=0;
      for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
        olddist = dist;
        dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
      }
      if (dist < metres) {
        return null;
      }
      var p1= this.getPath().getAt(i-2);
      var p2= this.getPath().getAt(i-1);
      var m = (metres-olddist)/(dist-olddist);
      return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
    }

    this.scoutRef = firebase.database().ref('scouts').child(uid)

    this.path = null
    this.pathTimer = []

    this.mode = 'STANDING'

    this.marker = new google.maps.Marker({
      uid: uid,
      position: new google.maps.LatLng(position.lat, position.lng),
      icon: {
        url: scoutSrc,
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 2, size / 2)
      }
    });
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }

  setPosition(position) {
    this.marker.setPosition(new google.maps.LatLng(position))
  }

  walk(data, map) {
    var now = (new Date).getTime()
    var elapsed = (now - data.timestamp)
    var offset = (elapsed / 1000) * 1.4 // 1 ms / fps (requestAnimationFrame updates 60 fps)

    this.path = new Path(data.uid, data.path, '#3D91CB', '#3D91CB', map);

    var walk = function() {
      offset = offset + 1.4; // Walking speed should be 1.4m per second with a x10 speed modifier

      var position = this.path.GetPointAtDistance(offset);
      this.marker.setPosition(position)

      window.dispatchEvent(new CustomEvent('map_discover'))

      this.update({position: {
          lat: position.lat(),
          lng: position.lng()
        }
      })

      if (offset >= data.totalDist) {
        window.clearInterval(this.pathTimer)

        this.update({
          path: null,
          totalDist: 0,
          mode: "STANDING",
          position: data.path[data.path.length - 1]
        })
      }
    }

    this.pathTimer = window.setInterval(walk.bind(this), 200)
  }

  stop() {
    return this.scoutRef.update({mode: "STANDING", path: null})
  }

  update(data) {
    return this.scoutRef.update(data);
  }
}
