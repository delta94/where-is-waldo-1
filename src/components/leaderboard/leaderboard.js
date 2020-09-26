import * as firebase from 'firebase/app'
import 'firebase/firestore'
import PubSub from 'pubsub-js'

import { firebaseConfig } from '../../../firebase.config'
import '../../styles/leaderboard.css'

firebase.initializeApp(firebaseConfig)

class Leaderboard {
  constructor () {
    this.dataLeaderboard = []
    this.getLeaderboardDataFromServer()

    /* Displaying the data from the server in the DOM */
    PubSub.subscribe('data_leaderboard_loaded', () => {
      this.displayDataFromServer()
    })
  }

  async getLeaderboardDataFromServer () {
    const collectionLeaderboard =
      firebase.firestore().collection('leaderboard')

    const response = await collectionLeaderboard.get()
    response.forEach(responsePiece => {
      this.dataLeaderboard.push(responsePiece.data())
    })

    PubSub.publish('data_leaderboard_loaded')
  }

  displayDataFromServer () {
    const listPlayers = document.getElementById('list-players')
    const listEntryTemplate = document.getElementById('list-template')

    this.dataLeaderboard.forEach(entry => {
      const listEntry = listEntryTemplate.cloneNode(true)
      listEntry.removeAttribute('id')
      listEntry.firstElementChild.textContent = `Player ${entry.userName}`
      listEntry.lastElementChild.textContent = 'In test seconds'
      listPlayers.append(listEntry)
    })
  }
}

const leaderboard = new Leaderboard()
console.log(leaderboard)
