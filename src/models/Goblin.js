import goblinSrc from '../assets/img/goblin-1.png';

export default class Gold {
  constructor(
    uid,
    position,
    size
  ) {
		this.greetings = [
			"I got what you need.",
			"Got the best deals anywheres.",
			"Can I lighten up that coin purse for ya?",
			"You break it, you buy it.",
			"I ain't got it, you don't want it.",
			"Cha-ching!",
			"Have I got a deal for you.",
			"This stuff sells itself.",
			"I know a buyer when I see one.",
			"I ain't getting paid to chat.",
			"Smart mouth, huh?",
			"Heheh, big shot huh?",
			"It's my way or the highway, pal!",
			"No loitering, whatever that means.",
			"I got no respect around here.",
			"You looking at me?",
			"Yo, can I help you with something?",
			"What's the word on the street?",
			"Yeah, yeah.",
			"I've seen you around here before?",
			"What's shaking?",
			"G.T.L, friend: Gambling, Tinkering, Laundry!",
			"Wazzup?",
			"Yeah, what ya want?",
			"Well, spit it out!",
			"Heeey, how ya doing?",
			"Yo!",
			"Don't waste my time!",
			"What!?",
			"Quickly, quickly!",
			"Go, go!",
			"Make sense!"
		]

    this.uid = uid
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(position.lat, position.lng),
      label: null,
      icon: {
        labelOrigin: new google.maps.Point(-10, -10),
        url: goblinSrc,
        size: new google.maps.Size(size, size),
        scaledSize: new google.maps.Size(size, size),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(size / 1, size)
      }
    })

  }

  setLabel(text) {
    if (text == 0) {
      text = 'MISS'
    }

		this.marker.setLabel({
			text: text.toString(),
			color: '#FA2A00',
			fontWeight: 'bold',
			fontSize: '14px',
			fontFamily: 'Avenir'
		})

		this.labelTimer = setTimeout(function() {
			this.marker.setLabel(null)
			clearTimeout(this.labelTimer)
		}.bind(this), 1000)
	}

  talk() {
    return `Goblin: ${this.greetings[Math.floor(Math.random() * this.greetings.length)]}`;
  }

  set(key, value) {
    this[key] = value
  }

  get(key) {
    return this[key]
  }

}
