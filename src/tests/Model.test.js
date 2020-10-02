import { Model } from '../components/Model'

describe('initCharactersToFind', () => {
  test(`The fetched coordinates from the server are converted to a character
    that the player needs to find`, () => {
    const model = new Model()
    model.coordinatesArray = [{
      characterName: 'odlaw',
      xMax: 269,
      xMin: 222,
      yMax: 430,
      yMin: 348
    }]
    model.initCharactersToFind()
    expect(model.gameProgress).toEqual({ odlaw: false })
  })

  test('There can be multiple characters', () => {
    const model = new Model()
    model.coordinatesArray = [
      {
        characterName: 'odlaw',
        xMax: 269,
        xMin: 222,
        yMax: 430,
        yMin: 348
      },
      {
        characterName: 'wizard',
        xMax: 671,
        xMin: 612,
        yMax: 420,
        yMin: 348
      },
      {
        characterName: 'waldo',
        xMax: 565,
        xMin: 514,
        yMax: 408,
        yMin: 345
      }
    ]
    model.initCharactersToFind()
    expect(model.gameProgress).toEqual({
      odlaw: false,
      wizard: false,
      waldo: false
    })
  })
})

describe('getCoordinatesFromServer', () => {
  test(`Fetched coordinates from the first level should be stored in
    coordinatesArray`, async () => {
    const level1FireBaseInfo = [
      {
        characterName: 'odlaw',
        xMax: 269,
        xMin: 222,
        yMax: 430,
        yMin: 348
      },
      {
        characterName: 'waldo',
        xMax: 565,
        xMin: 514,
        yMax: 408,
        yMin: 345
      },
      {
        characterName: 'wizard',
        xMax: 671,
        xMin: 612,
        yMax: 420,
        yMin: 348
      }
    ]
    const model = new Model()
    model.getCoordinatesFromServer = jest.fn((levelId) => {
      if (levelId === 'level-1') {
        level1FireBaseInfo.forEach(pieceInfo => {
          model.coordinatesArray.push(pieceInfo)
        })
      }
    })
    model.getCoordinatesFromServer('level-1')
    expect(model.coordinatesArray).toEqual([
      {
        characterName: 'odlaw',
        xMax: 269,
        xMin: 222,
        yMax: 430,
        yMin: 348
      },
      {
        characterName: 'waldo',
        xMax: 565,
        xMin: 514,
        yMax: 408,
        yMin: 345
      },
      {
        characterName: 'wizard',
        xMax: 671,
        xMin: 612,
        yMax: 420,
        yMin: 348
      }
    ])
  })
})

describe('getBackgroundImageFromServer', () => {
  test('The fetched data from the server is a URL of an image', () => {
    const model = new Model()
    model.getBackgroundImageFromServer = jest.fn((levelId) => {
      return 'https://firebasestorage.googleapis.com/...'
    })

    expect(model.getBackgroundImageFromServer())
      .toMatch(/^(https:\/\/)|(http:\/\/).*/)
  })
})

describe('checkIfCharacterFound', () => {
  const model = new Model()
  model.coordinatesArray = [
    {
      characterName: 'odlaw',
      xMax: 269,
      xMin: 222,
      yMax: 430,
      yMin: 348
    },
    {
      characterName: 'waldo',
      xMax: 565,
      xMin: 514,
      yMax: 408,
      yMin: 345
    },
    {
      characterName: 'wizard',
      xMax: 671,
      xMin: 612,
      yMax: 420,
      yMin: 348
    }
  ]

  test(`Given the coordinates and the name of a character the function returns
    the object from coordinatesArray with corresponding values`, () => {
    expect((model.checkIfCharacterFound(555, 384, 'waldo'))).toEqual({
      characterName: 'waldo',
      xMax: 565,
      xMin: 514,
      yMax: 408,
      yMin: 345
    })
  })

  test(`When the given coordinates or name don't match an object
    in the coordinatesArray the function returns undefined`, () => {
    expect((model.checkIfCharacterFound(11, 99, 'wizard'))).toEqual(undefined)
  })
})

describe('checkIfRecordSet', () => {
  let leaderboardFireBaseMock = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  ]

  const model = new Model()

  model.checkIfRecordSet = jest.fn((levelId) => {
    let isRecord = false

    if (levelId === 'level-1') {
      leaderboardFireBaseMock.forEach(entry => {
        if (model.secondsTakenToBeat < entry) {
          isRecord = true
        }
      })
    }

    if (leaderboardFireBaseMock.length < 20) isRecord = true
    return isRecord
  })

  test(`If the player has found all characters faster than
    anyone on the leaderboard return true`, () => {
    model.secondsTakenToBeat = 5

    expect(model.checkIfRecordSet('level-1')).toEqual(true)
  })

  test(`If the player has NOT found all characters faster than
    anyone on the leaderboard return false`, () => {
    model.secondsTakenToBeat = 33

    expect(model.checkIfRecordSet('level-1')).toEqual(false)
  })

  test(`If leaderboard length is less than 20 entries the player's result is
    considered a record and the function returns true`, () => {
    leaderboardFireBaseMock = [1, 2, 3, 4]
    model.secondsTakenToBeat = 33

    expect(model.checkIfRecordSet('level-1')).toEqual(true)
  })
})

describe('updateGameProgressData', () => {
  test('Given a character name change gameProgress object', () => {
    const model = new Model()
    model.updateGameProgressData('waldo')
    expect(model.gameProgress.waldo).toEqual(true)
  })

  test('Given another character name change gameProgress object', () => {
    const model = new Model()
    model.updateGameProgressData('odlaw')
    expect(model.gameProgress.odlaw).toEqual(true)
  })
})

describe('resetGameData', () => {
  const model = new Model()
  model.timestampSeconds = { test: 'test' }
  model.secondsTakenToBeat = 33
  model.gameProgress = { test: 'test' }
  model.coordinatesArray = [test]
  model.levelId = 'level-1'

  test(`The function resets necessary properties.
    It does NOT affect coordinatesArray and levelId
      when there is no argument passed`, () => {
    model.resetGameData()
    expect(model.timestampSeconds).toEqual({})
    expect(model.secondsTakenToBeat).toEqual(0)
    expect(model.gameProgress).toEqual({})

    expect(model.coordinatesArray).not.toEqual([])
    expect(model.levelId).not.toEqual('')
  })

  test(`When true passed as an argument the function resets
    coordinatesArray and levelId as well`, () => {
    model.resetGameData(true)
    expect(model.timestampSeconds).toEqual({})
    expect(model.secondsTakenToBeat).toEqual(0)
    expect(model.gameProgress).toEqual({})

    expect(model.coordinatesArray).toEqual([])
    expect(model.levelId).toEqual('')
  })
})
