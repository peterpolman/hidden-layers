export default class Path {
  constructor(
    uid,
    path,
    strokeColor,
    iconColor,
    map
  ) {
    var lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 1,
      scale: 3,
      fillColor: strokeColor
    };

    return new google.maps.Polyline({
        uid: uid,
        path: path,
        strokeColor: strokeColor,
        strokeOpacity: 0,
        strokeWeight: 0,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '10px'
        }],
        map: map
    });
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }

  setMap(map) {
    this.setMap(map)
  }

}
