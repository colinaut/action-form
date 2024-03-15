export default class ErrorMsg extends HTMLElement {
	constructor() {
		super();
	}

	// TODO: Clean up this code
	// TODO: add ARIA for error messages
	public connectedCallback(): void {
		console.log("connected");
		const form = this.closest("form");
		const forId = this.getAttribute("for");
		const el = form?.querySelector(`#${forId}`);
		if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
			if (el instanceof HTMLInputElement && ["text", "email", "tel", "password"].includes(el.type)) {
				el.addEventListener("blur", () => {
					if (!el.checkValidity()) {
						this.setAttribute("show", "");
					} else {
						this.removeAttribute("show");
					}
				});
			} else {
				el.addEventListener("change", () => {
					if (!el.checkValidity()) {
						this.setAttribute("show", "");
					} else {
						this.removeAttribute("show");
					}
				});
			}
		}
		if (el instanceof HTMLFieldSetElement) {
			const min = el.getAttribute("min");
			const max = el.getAttribute("max");
			if (min || max) {
				el.addEventListener("change", () => {
					const inputsChecked = Array.from(el.getElementsByTagName("input")).filter((input) => input.checked);
					if ((min && inputsChecked.length < parseInt(min)) || (max && inputsChecked.length > parseInt(max))) {
						this.setAttribute("show", "");
					} else {
						this.removeAttribute("show");
					}
				});
			}
		}
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("error-msg", ErrorMsg);
