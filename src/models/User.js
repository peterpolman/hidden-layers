import maleSrc from '../assets/img/user-male.png';
import femaleSrc from '../assets/img/user-female.png';

export default class User {
  constructor(
    uid,
    position,
    gender,
    size,
    me
  ) {
    this.avatars = {
      male: maleSrc,
      female: femaleSrc,
    }
    return new google.maps.Marker({
      uid: uid,
      position: new google.maps.LatLng(position.lat, position.lng),
      icon: {
        url: this.avatars[gender],
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
      },
      animation: (me === true) ? google.maps.Animation.DROP : null
    });
  }
}
