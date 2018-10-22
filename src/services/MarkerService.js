import meSrc from '../assets/img/user-me.png';
import maleSrc from '../assets/img/user-male.png';
import femaleSrc from '../assets/img/user-female.png';

export default class MarkerService {
  constructor() {
    this.userMarkers = []
    this.directionMarkers = []
    this.avatars = {
      me: meSrc,
      male: maleSrc,
      female: femaleSrc
    }
  }

  createMarkerId(latLng) {
    return latLng.lat() + "_" + latLng.lng()
  }

  createUserMarker(uid, data, me) {
    const userMarker = new google.maps.Marker({
      id: uid,
      position: new google.maps.LatLng(data.position.lat, data.position.lng),
      icon: {
        url: (me) ? this.avatars.me : this.avatars[data.gender],
        size: new google.maps.Size(40, 40),
        scaledSize: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0,0)
      },
      animation: google.maps.Animation.BOUNCE
    });

    return this.userMarkers[uid] = userMarker;
  }

  updateUserMarker(uid, data) {
    this.userMarkers[uid]

    return this.userMarkers[uid]
  }

  createDirectionMarker(latlng, map) {
    const id = this.createMarkerId(latlng);
    const options = {
      id: id,
      position: latlng,
      animation: google.maps.Animation.BOUNCE
    }
    const directionMarker = new google.maps.Marker(options);

    return this.directionMarkers[id] = directionMarker;
  }

  onDirectionMarkerRightClick(e) {
    var id = this.createMarkerId(e.latLng);
    var marker = this.markers[id];
    var position = marker.getPosition();

    delete this.markers[id];
    marker.setMap(null)

    // We skip the first result in the array since it is the observer object
    for (var i = 0; i < this.routeMarkers.length; i++) {
      this.routeMarkers[i].setMap(null)
      delete this.routeMarkers[i];
    }

    this.routeMarkers = [{}];

    this.map.panTo(position);
  }

}
