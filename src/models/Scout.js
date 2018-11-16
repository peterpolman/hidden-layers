import scoutSrc from '../assets/img/user-me.png';

export default class Scout {
  constructor(
    uid,
    position,
    map,
    size,
    mode
  ) {
    return new google.maps.Marker({
      uid: uid,
      mode: mode,
      position: position,
      map: map,
      icon: {
        url: scoutSrc,
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
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
