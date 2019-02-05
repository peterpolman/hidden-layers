import firebase from 'firebase/app'
import 'firebase/database'
import GoogleMapsLoader from 'google-maps'
import config from '../config.js'
import MapStyles from '../mapStyles.js'
import GridService from '../services/GridService'

export default class MapController {
    constructor() {
        this.route = null
        this.gridService = new GridService()
    }

    isPositionHidden(position, visibility) {
        let visibilityGeom = this.gridService.getVisibility(visibility.user, visibility.scout, visibility.wards)
        let visibilityPath = new google.maps.Polygon({paths: visibilityGeom})

        return google.maps.geometry.poly.containsLocation(position, visibilityPath)
    }

    getVisibleObjects(visibility, positions) {
        let visibilityGeom = this.gridService.getVisibility(visibility.user, visibility.scout, visibility.wards)
        let visibilityPath = new google.maps.Polygon({paths: visibilityGeom})

        MAP.data.forEach((feature) => MAP.data.remove(feature))
        MAP.data.add({geometry: new google.maps.Data.Polygon(visibilityGeom)})
        MAP.data.setStyle({fillColor: '#000', fillOpacity: .75, strokeWeight: 0, clickable: false})

        return {
            users: this.setMarkerVisibility(positions.users, visibilityPath),
            scouts: this.setMarkerVisibility(positions.scouts, visibilityPath),
            goblins: this.setMarkerVisibility(positions.goblins, visibilityPath),
            loot: this.setMarkerVisibility(positions.loot, visibilityPath),
            buildings: this.setMarkerVisibility(positions.buildings, visibilityPath),
        }

    }

    setMarkerVisibility(markers, visibilityPath) {
        for (let id in markers) {
            let isVisible = google.maps.geometry.poly.containsLocation(markers[id].marker.position, visibilityPath)
            markers[id].setVisible(!isVisible)
        }

        return markers
    }

    init() {
        return new Promise(function(resolve, reject) {
            GoogleMapsLoader.KEY = config.maps.key
            GoogleMapsLoader.LIBRARIES = ['geometry', 'places']
            GoogleMapsLoader.LANGUAGE = 'nl'
            GoogleMapsLoader.REGION = 'NL'
            GoogleMapsLoader.VERSION = '3.34'
            GoogleMapsLoader.load(function(google) {
                // Don't forget to credit the guy
                google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
                    var EarthRadiusMeters = 6378137.0 // meters
                    var lat1 = this.lat()
                    var lon1 = this.lng()
                    var lat2 = newLatLng.lat()
                    var lon2 = newLatLng.lng()
                    var dLat = (lat2 - lat1) * Math.PI / 180
                    var dLon = (lon2 - lon1) * Math.PI / 180
                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    var d = EarthRadiusMeters * c
                    return d
                }

                google.maps.Polyline.prototype.GetPointAtDistance = function(metres) {
                    // some awkward special cases
                    if (metres == 0)
                        return this.getPath().getAt(0)
                    if (metres < 0)
                        return null
                    if (this.getPath().getLength() < 2)
                        return null
                    var dist = 0
                    var olddist = 0
                    for (var i = 1; (i < this.getPath().getLength() && dist < metres); i++) {
                        olddist = dist;
                        dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1))
                    }
                    if (dist < metres) {
                        return null
                    }
                    var p1 = this.getPath().getAt(i - 2)
                    var p2 = this.getPath().getAt(i - 1)
                    var m = (metres - olddist) / (dist - olddist)
                    return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m)
                }

                const hour = new Date().getHours()
                const mapStyle = (hour >= 18 || hour <= 6)
                    ? MapStyles.night
                    : MapStyles.day
                const element = document.getElementById("home-map")
                const options = {
                    center: new google.maps.LatLng(52.366, 4.844),
                    zoom: 18,
                    minZoom: 10,
                    zoomControl: true,
                    disableDoubleClickZoom: true,
                    mapTypeControl: false,
                    scrollwheel: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    styles: mapStyle
                }
                const map = new google.maps.Map(element, options)

                window.MAP = map

                resolve(map)
            })
        })
    }
}
