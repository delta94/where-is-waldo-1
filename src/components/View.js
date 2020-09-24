import {
  createElement,
  convertToNumberFromCSS
} from '../utilities/helperFunctions'

import PubSub from 'pubsub-js'

export class View {
  constructor () {
    this.isBoxTargetClicked = false
    this.isMenuSearchClicked = false
    this.currentClickCoordinates = {}

    this.initListeners()
    this.resetGameDOM()
  }

  initListeners () {
    /* The user clicks on the background */
    const imgBackground = document.getElementById('img-background')
    imgBackground.addEventListener('click', this.placeBoxTarget.bind(View))
    imgBackground.addEventListener('click', this.displaySearchMenu.bind(View))

    /* Adding listeners to search menu options
      WHEN search menu has been created */
    PubSub.subscribe('search_menu_created', (msg, options) => {
      options.forEach(option => {
        option.addEventListener(
          'click',
          this.sendUserClickData.bind(View, option)
        )
      })
    })
  }

  loadBackgroundImage (URL) {
    const imgBackground = document.getElementById('img-background')
    imgBackground.src = URL
  }

  placeBoxTarget (e) {
    const rootElement = document.getElementById('game-field')

    /* Removing the element when clicked outside of it */
    this.isBoxTargetClicked = !this.isBoxTargetClicked

    /* Checking if there is a box created already. If so deleting it */
    const previousBoxTarget = document.getElementById('box-target')
    if (previousBoxTarget) previousBoxTarget.remove()

    if (this.isBoxTargetClicked) {
      const boxTarget = createElement('div', null, 'box-target', rootElement)
      const boxTargetWidth =
        convertToNumberFromCSS(window.getComputedStyle(boxTarget).width)

      /* Placing boxTarget on the coordinates of the user's click */
      boxTarget.style.left = e.offsetX - (boxTargetWidth / 2) + 'px'
      boxTarget.style.top = e.offsetY + 'px'

      /* Saving the coordinates of the click to use later */
      this.currentClickCoordinates = {
        userX: e.offsetX,
        userY: e.offsetY
      }
    } else {
      /* Deleting the current coordinates once the player clicks
        outside of the menu */
      this.currentClickCoordinates = {}
    }
  }

  displaySearchMenu (e) {
    const rootElement = document.getElementById('game-field')

    /* Removing the element when clicked outside of it */
    this.isMenuSearchClicked = !this.isMenuSearchClicked

    /* Checking if there is a menu created already. If so deleting it */
    const previousMenuSearch = document.getElementById('menu-search-container')
    if (previousMenuSearch) previousMenuSearch.remove()

    if (this.isMenuSearchClicked) {
      /* Creating a search menu */
      const menuSearchContainer =
        createElement('div', null, 'menu-search-container', rootElement)

      const optionWaldo = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-waldo',
        menuSearchContainer
      )
      optionWaldo.textContent = 'Waldo'

      const optionOdlaw = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-odlaw',
        menuSearchContainer
      )
      optionOdlaw.textContent = 'Odlaw'

      const optionWizard = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-wizard',
        menuSearchContainer
      )
      optionWizard.textContent = 'Wizard'

      /* Placing menuSearchContainer on the coordinates of the user's click */
      menuSearchContainer.style.left = e.offsetX + 40 + 'px'
      menuSearchContainer.style.top = e.offsetY + 15 + 'px'

      /* Notifying this.initListeners() function so that
        it can create event listeners for the options */
      PubSub.publish('search_menu_created', [
        optionWaldo,
        optionOdlaw,
        optionWizard
      ])
    }
  }

  updateGameProgressDOM (characterName) {
    const characterCheckbox =
      document.getElementById(`checkbox-${characterName}`)

    characterCheckbox.checked = true
  }

  resetGameDOM () {
    const checkboxes = document.querySelectorAll('#header-progress input')
    checkboxes.forEach(checkbox => {
      checkbox.checked = false
    })
  }

  sendUserClickData (eventTarget) {
    const characterNameLowerCase = eventTarget.textContent.toLowerCase()

    const userData = Object.assign(this.currentClickCoordinates, {
      nameChosen: characterNameLowerCase
    })

    /* Sending the coordinates of the click and the character name
    that the player has chosen in the menu to the Controller */
    PubSub.publish('user_clicked', userData)
  }

  markCharacterFound () {
    const rootElement = document.getElementById('game-field')
    const boxTarget = document.getElementById('box-target')

    if (boxTarget) {
      const mark = boxTarget.cloneNode(true)

      mark.removeAttribute('id')
      mark.classList.add('mark')

      rootElement.append(mark)
    } else {
      throw new Error(`(When marking the found character):
                        The boxTarget is not found.`)
    }
  }
}
