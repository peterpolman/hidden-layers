export default class Path {
  constructor(
    uid,
    path,
    strokeColor,
    iconColor,
    offset,
    map
  ) {
    return new google.maps.Polyline({
        uid: uid,
        path: path,
        strokeColor: strokeColor,
        strokeOpacity: 0.5,
        strokeWeight: 3,
        icons: [{
          icon: {
            path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
            fillColor: iconColor,
            fillOpacity: .75,
            anchor: new google.maps.Point(0,0),
            strokeWeight: 0,
            scale: .3
          },
          offset: offset
        }],
        map: map
    });
  }

  set(key, value) {
    debugger
    this[key] = value
  }

  get(key) {
    return this[key]
  }

  setMap(map) {
    this.setMap(map)
  }

}
