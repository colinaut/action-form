function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
}
function isBlurField(field: Element): boolean {
	return (
		(field instanceof HTMLInputElement && ["text", "email", "tel", "password", "date", "month", "number", "datetime-local", "time", "url", "week"].includes(field.type)) ||
		field instanceof HTMLTextAreaElement
	);
}

export default class ActionFieldSet extends HTMLElement {
	constructor() {
		super();
	}

	private groupFields = this.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

	public connectedCallback(): void {
		const form = this.closest("form");
		const watch = this.getAttribute("watch");
		if (form && watch) {
			console.log(`watching ${watch}`);
			// disable all fields in the group
			this.groupFields.forEach((field) => {
				field.setAttribute("disabled", "");
			});
			// Set up event listeners for field matching the name
			const namedFields = form.querySelectorAll(`:where(input, select, textarea, fieldset)[name=${watch}]`) as NodeListOf<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLFieldSetElement
			>;

			if (namedFields.length === 0) return;

			// allow watching fieldset for validity changes
			namedFields.forEach((field) => {
				if (field instanceof HTMLFieldSetElement) {
					// check if the field in the fieldset are valid
					field.addEventListener("change", () => {
						this.show(field.querySelectorAll(":invalid").length === 0);
					});
				} else if (isBlurField(field)) {
					field.addEventListener("blur", () => {
						this.show(this.checkMatches([field.value]));
					});
				} else if (isChangeField(field)) {
					field.addEventListener("change", () => {
						if (field.matches("[type=checkbox], [type=radio]")) {
							const checkedFields = Array.from(namedFields).filter((el) => el instanceof HTMLInputElement && el.checked) as HTMLInputElement[];
							this.show(this.checkMatches(checkedFields.map((el) => el.value)));
						} else {
							this.show(this.checkMatches([field.value]));
						}
					});
				}
			});
		}
	}

	private checkMatches(values: string[]): boolean {
		const showIf = this.getAttribute("showIf") || "";
		return values.some((value) => {
			// TODO: test the regex pattern
			if (this.hasAttribute("regex")) {
				const regex = new RegExp(value);
				return regex.test(showIf);
			} else {
				return showIf === value;
			}
		});
	}

	private show(show: boolean): void {
		if (show) {
			this.removeAttribute("hidden");
			this.groupFields.forEach((field) => {
				field.removeAttribute("disabled");
			});
		} else {
			this.setAttribute("hidden", "");
			this.groupFields.forEach((field) => {
				field.setAttribute("disabled", "");
			});
		}
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("action-fieldset", ActionFieldSet);
