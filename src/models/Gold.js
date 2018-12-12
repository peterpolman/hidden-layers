import goldSrc from '../assets/img/coin.png';

export default class Gold {
  constructor(
    uid,
    position,
    size,
    map
  ) {
    var marker = new google.maps.Marker({
      uid: uid,
      position: new google.maps.LatLng(position.lat, position.lng),
      map: map,
      icon: {
        url: goldSrc,
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 2, size)
      }
    })

    return marker;
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }

}
