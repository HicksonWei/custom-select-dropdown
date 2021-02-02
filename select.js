export default class Select {
	constructor(element) {
		this.element = element
		this.options = getFormattedOptions(element.querySelectorAll('option'))
		this.customElement = document.createElement('div')
		this.labelElement = document.createElement('span')
		this.optionsCustomElement = document.createElement('ul')
		// this 指的就是 class Select
		setupCustomElement(this)
		element.style.display = 'none'
		// 將 this.customElement 銜接在 element (參數) 的後方 (插入 DOM)
		element.after(this.customElement)
	}

	// 找到 options 中 selected 為 true 的物件 (只會有一個)
	get selectedOption() {
		return this.options.find(option => option.selected)
	}

	get selectedOptionIndex() {
		return this.options.indexOf(this.selectedOption)
	}

	// 改變目標物件的數值
	selectValue(value) {
		const newSelectedOption = this.options.find(option => {
			return option.value === value
		})
		const prevSelectedOption = this.selectedOption
		prevSelectedOption.selected = false
		prevSelectedOption.element.selected = false

		newSelectedOption.selected = true
		newSelectedOption.element.selected = true

		this.labelElement.innerText = newSelectedOption.label

		this.optionsCustomElement
			.querySelector(`[data-value="${prevSelectedOption.value}"]`)
			.classList.remove('selected')

		const newCustomElement = this.optionsCustomElement.querySelector(
			`[data-value="${newSelectedOption.value}"]`
		)

		newCustomElement.classList.add('selected')
		// 確保selected選項在可視範圍內
		newCustomElement.scrollIntoView({ block: 'nearest' })
	}
}

// function 寫在 class 外面即為 private function，不會被 Select 調用
function setupCustomElement(select) {
	select.customElement.classList.add('custom-select-container')
	// tabindex="0" => 在 Tab 順序中加入一個元素，同時賦予該元素 focus 狀態 (即使該元素原本沒有 focus 狀態)
	// tabindex="-1" => 在 Tab 順序中移除一個元素
	select.customElement.tabIndex = 0

	select.labelElement.classList.add('custom-select-value')
	select.labelElement.innerText = select.selectedOption.value
	select.customElement.append(select.labelElement)

	select.optionsCustomElement.classList.add('custom-select-options')
	// 對每一個 option 物件做更動
	select.options.forEach(option => {
		const optionElement = document.createElement('li')
		optionElement.classList.add('custom-select-option')
		// classList.toggle 如果只有一個參數 (class)，有 class 則刪，無 class 則加
		// classList.toggle 如果有第二個參數 (true/false)，true 則加 class，false 則刪除 class
		optionElement.classList.toggle('selected', option.selected)
		optionElement.innerText = option.label
		optionElement.dataset.value = option.value
		optionElement.addEventListener('click', () => {
			select.selectValue(option.value)
			select.optionsCustomElement.classList.remove('show')
		})
		select.optionsCustomElement.append(optionElement)
	})
	select.customElement.append(select.optionsCustomElement)

	select.labelElement.addEventListener('click', () => {
		select.optionsCustomElement.classList.toggle('show')
	})

	// blur 時隱藏 option list
	select.customElement.addEventListener('blur', () => {
		select.optionsCustomElement.classList.remove('show')
	})

	let debounceTimeout
	let searchTerm = ''
	// 鍵盤操作
	select.customElement.addEventListener('keydown', e => {
		switch (e.code) {
			case 'Space':
				select.optionsCustomElement.classList.toggle('show')
				break
			case 'ArrowUp':
				const prevOption = select.options[select.selectedOptionIndex - 1]
				if (prevOption) {
					select.selectValue(prevOption.value)
				}
				break
			case 'ArrowDown':
				const nextOption = select.options[select.selectedOptionIndex + 1]
				if (nextOption) {
					select.selectValue(nextOption.value)
				}
				break
			case 'Enter':
			case 'Escape':
				select.optionsCustomElement.classList.remove('show')
				break
			default:
				clearTimeout(debounceTimeout)
				searchTerm += e.key
				// 輸入間隔超過0.5秒就會重置searchTerm
				debounceTimeout = setTimeout(() => {
					searchTerm = ''
				}, 500)

				const searchedOption = select.options.find(option => {
					return option.label.toLowerCase().startsWith(searchTerm)
				})
				if (searchedOption) select.selectValue(searchedOption.value)
		}
	})
}

// 將 NodeList (option) 換成陣列包多個物件
function getFormattedOptions(optionElements) {
	return [...optionElements].map(optionElement => {
		return {
			value: optionElement.value,
			label: optionElement.label,
			selected: optionElement.selected,
			element: optionElement
		}
	})
}
