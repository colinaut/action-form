export default class FormGroup extends HTMLElement {
	constructor() {
		super();
	}

	private fields = this.querySelectorAll("input, select, textarea");

	public connectedCallback(): void {
		console.log("connected");

		const form = this.closest("form");
		const watchId = this.getAttribute("watch");
		if (form && watchId) {
			// disable all fields in the group
			this.fields.forEach((field) => {
				field.setAttribute("disabled", "");
			});
			// Set up event listeners
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
			this.fields.forEach((field) => {
				field.removeAttribute("disabled");
			});
		} else {
			this.removeAttribute("show");
			this.fields.forEach((field) => {
				field.setAttribute("disabled", "");
			});
		}
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("form-group", FormGroup);
