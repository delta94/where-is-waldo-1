export function createElement (tag, className, elementId, parentElement) {
  const element = document.createElement(tag)
  if (className) element.classList.add(className)
  if (elementId) element.id = elementId
  if (parentElement) parentElement.append(element)
  return element
}

export function convertToNumberFromCSS (property) {
  let result = ''

  /* Returning only numbers */
  for (let i = 0; i < property.length; i++) {
    if (!isNaN(property[i])) result += property[i]
  }

  return +result
}
