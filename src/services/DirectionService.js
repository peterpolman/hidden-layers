export default class DirectionService {
    constructor() {

    }

	travelPath(destination) {
		// request directions. See https://docs.mapbox.com/api/navigation/#directions for details
		var url = "https://api.mapbox.com/directions/v5/mapbox/driving/"+[origin, destination].join(';')+"?geometries=geojson&access_token=" + config.accessToken
		fetchFunction(url, function(data){

			// extract path geometry from callback geojson, and set duration of travel
			var options = {
				path: data.routes[0].geometry.coordinates,
				duration: 10000
			}

			// start the truck animation with above options, and remove the line when animation ends
			truck.followPath(
				options,
				function() {
					tb.remove(line);
				}
			);

			// set up geometry for a line to be added to map, lofting it up a bit for *style*
			var lineGeometry = options.path
				.map(function(coordinate){
					return coordinate.concat([15])
				})

			// create and add line object
			line = tb.line({
				geometry: lineGeometry,
				width: 5,
				color: 'steelblue'
			})

			tb.add(line);

			// set destination as the new origin, for the next trip
			origin = destination;
		})
	}

	//convenience function for fetch
	fetchFunction(url, cb) {
		fetch(url)
			.then(
				function(response){
					if (response.status === 200) {
						response.json()
							.then(function(data){
								cb(data)
							})
					}
				}
			)
	}
}
