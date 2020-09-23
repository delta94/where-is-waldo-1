import * as firebase from 'firebase/app'
import 'firebase/firestore'
import PubSub from 'pubsub-js'

export class Model {
  constructor () {
    this.coordinates = ''
  }

  async getBackgroundImageFromServer () {
    try {
      const bgImages = firebase.firestore().collection('images')

      const response = await bgImages.doc('background-1').get()
      const responseObject = response.data()

      /* Sending it to the Controller */
      PubSub.publish('background_loaded', responseObject.URL)
    } catch (error) {
      console.log('(When getting the background image): ' + error)
    }
  }

  async getCoordinatesFromServer () {
    try {
      const coordinates = firebase.firestore().collection('coordinates')

      const response = await coordinates.doc('odlaw').get()
      const odlawCoordinatesObject = await response.data()

      this.coordinates = odlawCoordinatesObject
    } catch (error) {
      console.log('(When getting the coordinates): ' + error)
    }
  }

  checkIfCharacterFound (userCoordinates) {
    const { userX, userY } = userCoordinates

    if (userY > this.coordinates.yMin &&
        userY < this.coordinates.yMax &&
        userX > this.coordinates.xMin &&
        userX < this.coordinates.xMax) {
      console.log('Found Oldaw!')
      return true
    } else {
      return false
    }
  }
}
