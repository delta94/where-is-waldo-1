import * as firebase from 'firebase/app'
import 'firebase/firestore'
import PubSub from 'pubsub-js'

export class Model {
  static async getBackgroundImageFromServer () {
    try {
      const bgImages = firebase.firestore().collection('images')

      const response = await bgImages.doc('background-1').get()
      const responseObject = response.data()

      PubSub.publish('background_loaded', responseObject.URL)
    } catch (error) {
      console.log('(When getting the background image): ' + error)
    }
  }
}
