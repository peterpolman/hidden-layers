import knightSrc from '../assets/img/knight-1.png';
import archerSrc from '../assets/img/archer-1.png';

export default class User {
  constructor(
    uid,
    position,
    userClass,
    username,
    email,
    size
  ) {
    const avatars = {
      knight: knightSrc,
      archer: archerSrc,
    }

    this.marker = new google.maps.Marker({
      uid: uid,
      position: new google.maps.LatLng(position.lat, position.lng),
      username: username,
      email: email,
      icon: {
        url: avatars[userClass],
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 2, size / 1)
      }
    });
  }

  setPosition(position) {
    this.marker.setPosition(position)
  }
}
