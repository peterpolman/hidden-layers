import firebase from 'firebase';

export default class PathService {
  constructor() {
  }

  route(uid, fromLatlng, toLatlng, travelMode) {
    const directionsService = new google.maps.DirectionsService()

    return new Promise(function (resolve, reject) {
      directionsService.route({ origin: fromLatlng, destination: toLatlng, travelMode: travelMode }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          const sphericalLib = google.maps.geometry.spherical
          const route = response.routes[0].overview_path
          const totalDist = sphericalLib.computeDistanceBetween( route[0], route[route.length - 1])

          if (totalDist < 5000) {
            const data = {
              mode: travelMode,
              uid: uid,
              position: {
                lat: fromLatlng.lat(),
                lng: fromLatlng.lng()
              },
              totalDist: totalDist,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
              path: []
            }

            for (var i = 0; i < route.length; i++) {
              data.path[i] = { lat: route[i].lat(), lng: route[i].lng() }
            }

            resolve(data);
          }
          else {
            reject(`Don't go so far! 5000 meter is max.`);
          }
        } else {
          reject(`Directions request failed due to ${status}`);
        }
      });
    }.bind(this));
  }
}
