import goldSrc from '../assets/img/coinstack.png';

export default class Gold {
  constructor(
    uid,
    id,
    position,
    size,
    amount
  ) {
    this.amount = amount
    this.marker = new google.maps.Marker({
      uid: uid,
      id: id,
      position: new google.maps.LatLng(position.lat, position.lng),
      amount: amount,
      icon: {
        url: goldSrc,
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 1, size)
      }
    })
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }

}
