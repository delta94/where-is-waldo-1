import {
  createElement,
  convertToNumberFromCSS
} from '../utilities/helperFunctions'

import PubSub from 'pubsub-js'

export class View {
  constructor () {
    this.isBoxTargetClicked = false
    this.isMenuSearchClicked = false

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
        option.addEventListener('click', () => {
          console.log('Works!')
        })
      })
    })
  }

  loadBackgroundImage (URL) {
    const imgBackground = document.getElementById('img-background')
    imgBackground.src = URL
  }

  placeBoxTarget (e) {
    const rootElement = document.getElementById('app')

    /* Removing the element when clicked outside of it */
    this.isBoxTargetClicked = !this.isBoxTargetClicked

    /* Checking if there is a box created already. If so deleting it */
    const previousBoxTarget = document.getElementById('box-target')
    if (previousBoxTarget) previousBoxTarget.remove()

    if (this.isBoxTargetClicked) {
      const boxTarget = createElement('div', null, 'box-target', rootElement)
      const boxTargetHeight =
        convertToNumberFromCSS(window.getComputedStyle(boxTarget).height)
      const boxTargetWidth =
        convertToNumberFromCSS(window.getComputedStyle(boxTarget).width)

      /* Placing boxTarget on the coordinates of the user's click */
      boxTarget.style.left = e.pageX - (boxTargetWidth / 2) + 'px'
      boxTarget.style.top = e.pageY - (boxTargetHeight / 2) + 'px'

      /* Sending the coordinates of the click to the Controller */
      PubSub.publish('background_clicked', {
        userX: e.offsetX,
        userY: e.offsetY
      })
    }
  }

  displaySearchMenu (e) {
    const rootElement = document.getElementById('app')

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
      menuSearchContainer.style.left = e.pageX + 40 + 'px'
      menuSearchContainer.style.top = e.pageY - 15 + 'px'

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
}
