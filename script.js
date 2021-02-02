import Select from './select.js'

// 雖然這裡只有用到一個 data-custom，但這樣寫有利於擴充
const selectElements = document.querySelectorAll('[data-custom]')

selectElements.forEach(selectElement => {
  console.log(new Select(selectElement))
})
