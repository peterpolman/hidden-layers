import maleSrc from '../assets/img/knight-1.png';
import femaleSrc from '../assets/img/archer-1.png';

export default class User {
  constructor(
    uid,
    position,
    gender,
    username,
    email,
    size,
    map,
    me
  ) {
    this.avatars = {
      male: maleSrc,
      female: femaleSrc,
    }
    return new google.maps.Marker({
      uid: uid,
      position: new google.maps.LatLng(position.lat, position.lng),
      username: username,
      email: email,
      map: map,
      icon: {
        url: this.avatars[gender],
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 2, size / 1)
      },
      animation: (me === true) ? google.maps.Animation.DROP : null
    });
  }
}
