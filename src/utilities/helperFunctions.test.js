import { convertToNumberFromCSS } from './helperFunctions'

test('Given a CSS property the function returns a number', () => {
  expect(convertToNumberFromCSS('50px')).toEqual(50)
})

test('The number can be one-digit', () => {
  expect(convertToNumberFromCSS('5px')).toEqual(5)
})

test('The number can be three-digit', () => {
  expect(convertToNumberFromCSS('500px')).toEqual(500)
})
