function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
}
function isBlurField(field: Element): boolean {
	return (
		(field instanceof HTMLInputElement && ["text", "email", "tel", "password", "date", "month", "number", "datetime-local", "time", "url", "week"].includes(field.type)) ||
		field instanceof HTMLTextAreaElement
	);
}

export default class FormGroup extends HTMLElement {
	constructor() {
		super();
	}

	private groupFields = this.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

	public connectedCallback(): void {
		console.log("connected");

		const form = this.closest("form");
		const watch = this.getAttribute("watch");
		if (form && watch) {
			// disable all fields in the group
			this.groupFields.forEach((field) => {
				field.setAttribute("disabled", "");
			});
			// Set up event listeners for field matching the name
			const namedFields = form.querySelectorAll(`:where(input, select, textarea)[name=${watch}]`) as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
			if (namedFields.length === 0) return;

			namedFields.forEach((field) => {
				if (isBlurField(field)) {
					field.addEventListener("blur", () => {
						this.show(field.value);
					});
				}
				if (isChangeField(field)) {
					field.addEventListener("change", () => {
						if (field.matches("[type=checkbox], [type=radio]")) {
							const values = Array.from(namedFields)
								.filter((el) => el instanceof HTMLInputElement && el.checked)
								.map((el) => el.value);
							this.show(values);
						} else {
							this.show(field.value);
						}
					});
				}
			});
		}
	}

	private checkMatches(value: string | string[]): boolean {
		const showIf = this.getAttribute("showIf") || "";
		if (Array.isArray(value)) {
			return value.includes(showIf);
		} else {
			return showIf === value;
		}
	}

	private show(value: string | string[]): void {
		// TODO: add regex support and or includes support
		// TODO: change for checked to showIfChecked
		if (this.checkMatches(value)) {
			this.setAttribute("show", "");
			this.groupFields.forEach((field) => {
				field.removeAttribute("disabled");
			});
		} else {
			this.removeAttribute("show");
			this.groupFields.forEach((field) => {
				field.setAttribute("disabled", "");
			});
		}
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("form-group", FormGroup);
