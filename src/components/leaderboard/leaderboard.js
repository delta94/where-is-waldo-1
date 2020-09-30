import * as firebase from 'firebase/app'
import 'firebase/firestore'
import PubSub from 'pubsub-js'

import { firebaseConfig } from '../../../firebase.config'
import '../../styles/leaderboard.css'

firebase.initializeApp(firebaseConfig)

class Leaderboard {
  constructor () {
    this.dataLeaderboard = []
    this.initListeners()
    this.getLeaderboardDataFromServer('level-1')

    /* Highlighting the first button when initializing the page */
    const buttonsSelectLevel = document.querySelector('.btn-select-level:first-child')
    buttonsSelectLevel.classList.add('btn-toggled')
  }

  initListeners () {
    /* Displaying the data from the server in the DOM */
    PubSub.subscribe('data_leaderboard_loaded', () => {
      this.displayDataFromServer()
    })

    const buttonsSelectLevel = document.querySelectorAll('.btn-select-level')
    buttonsSelectLevel.forEach(button => {
      /* Removing the old data and loading the selected-level data */
      button.addEventListener('click', () => {
        this.removeData()
        this.removeDataFromDOM()
        this.getLeaderboardDataFromServer(button.dataset.level)
        this.displayDataFromServer()
      })

      /* Highlighting the clicked button only */
      button.addEventListener('click', (e) => {
        buttonsSelectLevel.forEach(button => {
          button.classList.remove('btn-toggled')
        })
        e.currentTarget.classList.add('btn-toggled')
      })
    })
  }

  async getLeaderboardDataFromServer (levelId) {
    const collectionLeaderboard =
      firebase.firestore().collection('leaderboard')
        .doc(levelId).collection('leaderboard')
        .orderBy('time')
        .limit(20)

    const response = await collectionLeaderboard.get()
    response.forEach(responsePiece => {
      this.dataLeaderboard.push(responsePiece.data())
    })

    PubSub.publish('data_leaderboard_loaded')
  }

  displayDataFromServer () {
    const listPlayers = document.getElementById('leaderboard-list-players')
    const listEntryTemplate = document.getElementById('list-template')

    this.dataLeaderboard.forEach(entry => {
      const listEntry = listEntryTemplate.cloneNode(true)
      listEntry.removeAttribute('id')
      listEntry.firstElementChild.textContent = `Player ${entry.userName}`
      listEntry.lastElementChild.textContent =
        `Has finished in ${entry.time} seconds`
      listPlayers.append(listEntry)
    })
  }

  removeData () {
    this.dataLeaderboard = []
  }

  removeDataFromDOM () {
    const listPlayers = document.getElementById('leaderboard-list-players')
    const itemsList = listPlayers.querySelectorAll('.list-item')

    itemsList.forEach(item => {
      if (item.id !== 'list-template') {
        item.remove()
      }
    })
  }
}

const leaderboard = new Leaderboard()
console.log(leaderboard)
