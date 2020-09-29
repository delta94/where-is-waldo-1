import PubSub from 'pubsub-js'

export class LevelSelector {
  static init () {
    this.initListeners()
  }

  static initListeners () {
    /* Notifying the Controller when the player clicks on a level option */
    const levelSelector = document.getElementById('level-selector')
    const optionsLevel = document.querySelectorAll('.level-option')

    optionsLevel.forEach(option => {
      option.addEventListener('click', (e) => {
        PubSub.publish('level_chosen', e.currentTarget.id)
        levelSelector.style.visibility = 'hidden'
      })
    })
  }
}
