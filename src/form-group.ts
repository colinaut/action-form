export default class FormGroup extends HTMLElement {
	constructor() {
		super();
	}

	public connectedCallback(): void {
		console.log("connected");

		const form = this.closest("form");
		const watchId = this.getAttribute("watch");
		if (form && watchId) {
			const watchField = form.querySelector(`#${watchId}`);
			if (watchField instanceof HTMLInputElement || watchField instanceof HTMLSelectElement || watchField instanceof HTMLTextAreaElement) {
				if (watchField instanceof HTMLInputElement && ["text", "email", "tel", "password"].includes(watchField.type)) {
					watchField.addEventListener("blur", () => {
						this.show(watchField.value);
					});
				} else {
					watchField.addEventListener("change", () => {
						if (watchField instanceof HTMLInputElement && watchField.matches("[type=checkbox], [type=radio]")) {
							const value = watchField.checked ? "checked" : "";
							this.show(value);
						} else {
							this.show(watchField.value);
						}
					});
				}
			}
		}
	}

	private show(value: string): void {
		const showIf = this.getAttribute("showIf") || "";
		if (value === showIf) {
			this.setAttribute("show", "");
		} else {
			this.removeAttribute("show");
		}
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("form-group", FormGroup);
