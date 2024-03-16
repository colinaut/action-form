function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
}
function isCheckboxOrRadio(field: Element): boolean {
	return field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type);
}
function isBlurField(field: Element): boolean {
	return (
		(field instanceof HTMLInputElement && ["text", "email", "tel", "password", "date", "month", "number", "datetime-local", "time", "url", "week"].includes(field.type)) ||
		field instanceof HTMLTextAreaElement
	);
}

export default class ErrorMsg extends HTMLElement {
	constructor() {
		super();
	}

	private checkElementValidity(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
		if (!el.checkValidity()) {
			this.setAttribute("show", "");
		} else {
			this.removeAttribute("show");
		}
	}

	// TODO: Clean up this code
	// TODO: add ARIA for error messages
	public connectedCallback(): void {
		// attributes
		const watch = this.getAttribute("watch") || "";
		console.log("connected", watch);

		const min = this.getAttribute("min");
		const max = this.getAttribute("max");

		// parent form
		const form = this.closest("form");
		// Get all fields that match the name in this form
		const fields = form?.querySelectorAll(`[name=${watch}]`);
		// If no form or fields then return
		if (!form || !fields || fields.length === 0) return;

		fields.forEach((field) => {
			// If field is not an input, textarea, or select then return
			if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;

			if (isBlurField(field)) {
				field.addEventListener("blur", () => {
					console.log("blur", field);

					this.checkElementValidity(field);
				});
			}

			if (isChangeField(field)) {
				field.addEventListener("change", () => {
					// If this is a checkbox or radio and min or max set then grab all of them and compare min and max values
					if (isCheckboxOrRadio(field) && (min || max)) {
						const inputsChecked = Array.from(fields).filter((input) => input instanceof HTMLInputElement && input.checked);
						if ((min && inputsChecked.length < parseInt(min)) || (max && inputsChecked.length > parseInt(max))) {
							this.setAttribute("show", "");
						} else {
							this.removeAttribute("show");
						}
					} else {
						this.checkElementValidity(field);
					}
				});
			}
		});
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("error-msg", ErrorMsg);
