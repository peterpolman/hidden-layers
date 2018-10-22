import GoogleMapsLoader from 'google-maps';

export default class DirectionService {
  constructor() {
    this.routePath = {}
    this.routeMarkers = []
    this.routeCoords = []
  }

  createRoute(directions) {
    const route = directions.routes[0].legs[0];
    const icon = {
      path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
      fillColor: '#FF0000',
      fillOpacity: .6,
      anchor: new google.maps.Point(0,0),
      strokeWeight: 0,
      scale: .2
    }

    this.routeCoords.push(new google.maps.LatLng({
      lat: route.steps[0].start_location.lat(),
      lng: route.steps[0].start_location.lng()
    }))

    for (var i = 0; i < route.steps.length; i++) {
      const marker = new google.maps.Marker({
        position: route.steps[i].end_location,
        map: this.map,
        icon: icon
      });

      this.routeMarkers.push(marker);

      if (route.steps[i].start_location) {
        var coords = new google.maps.LatLng({
          lat: route.steps[i].end_location.lat(),
          lng: route.steps[i].end_location.lng()
        });
        this.routeCoords.push(coords)
      }

    }

    this.routePath = new google.maps.Polyline({
      path: this.routeCoords,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: .8,
      strokeWeight: 2
    });

    const rp = {
      path: this.routePath,
      markers: this.routeMarkers
    }

    return rp

  }

}
