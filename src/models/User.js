import knightSrc from '../assets/img/knight-1.png';
import archerSrc from '../assets/img/archer-1.png';

export default class User {
  constructor(
    uid,
    position,
    userClass,
    username,
    email,
    size,
    map,
    me
  ) {
    this.avatars = {
      knight: knightSrc,
      archer: archerSrc,
    }
    return new google.maps.Marker({
      uid: uid,
      position: new google.maps.LatLng(position.lat, position.lng),
      username: username,
      email: email,
      map: map,
      icon: {
        url: this.avatars[userClass],
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 2, size / 1)
      },
      animation: (me === true) ? google.maps.Animation.DROP : null
    });
  }
}
