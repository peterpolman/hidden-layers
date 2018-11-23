import scoutSrc from '../assets/img/wolf-1.png';

export default class Scout {
  constructor(
    uid,
    position,
    size,
    mode
  ) {
    return new google.maps.Marker({
      uid: uid,
      mode: mode,
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
    this.setPosition(new google.maps.LatLng(position))
  }
}
