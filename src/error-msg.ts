function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
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

	private hiddenValid = document.createElement("input");

	private hide(valid: boolean, el: HTMLElement): void {
		if (valid) {
			this.removeAttribute("show");
			el.removeAttribute("aria-invalid");
		} else {
			this.setAttribute("show", "");
			el.setAttribute("aria-invalid", "true");
		}
	}

	private getMakeId = (watch: string) => {
		const id = this.getAttribute("id");
		if (id) return id;
		const randomId = `${watch}-${Math.random().toString(36).substring(2, 9)}`;
		this.setAttribute("id", randomId);
		return randomId;
	};

	// TODO: Clean up this code
	// TODO: add ARIA for error messages
	public connectedCallback(): void {
		// attributes
		const watch = this.getAttribute("watch") || "";

		// parent form
		const form = this.closest("form");
		// Get all fields that match the name in this form
		const el = form?.querySelector(`:where(input, select, textarea, fieldset)[name=${watch}]`) as HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement;

		// If no form or fields then return
		if (!el) return;

		// Add random id to error message
		const id = this.getMakeId(watch);
		el.setAttribute("aria-describedby", id);

		console.log(`watching ${watch}`);

		el.addEventListener("toggle-error", () => {
			console.log("toggle-error", el);
			this.hide(el.checkValidity(), el);
		});

		if (isBlurField(el)) {
			el.addEventListener("blur", () => {
				console.log("blur", el);
				this.hide(el.checkValidity(), el);
			});
		}

		if (isChangeField(el)) {
			el.addEventListener("change", () => {
				this.hide(el.checkValidity(), el);
			});
		}

		if (el instanceof HTMLFieldSetElement) {
			// add attribute to fieldset
			el.setAttribute("has-error", "");
			// get all child fields
			const fieldsetFields = el.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
			// add extra hidden checkbox to set validity for the fieldset element and form
			this.addValidityField(el, watch);
			const min = Number(el.getAttribute("min") || 1);
			const max = Number(el.getAttribute("max") || fieldsetFields.length);

			// TODO: allow for this to change on input event after initial error state
			el.addEventListener("change", (event) => {
				this.fieldSetEventHandler(event, fieldsetFields, min, max);
				this.hide(el.querySelectorAll(":invalid").length === 0, el);
			});
			el.addEventListener("toggle-error", (event) => {
				this.fieldSetEventHandler(event, fieldsetFields, min, max);
				this.hide(el.querySelectorAll(":invalid").length === 0, el);
			});
		}
	}
	// TODO: Clean up this code
	private fieldSetEventHandler = (event: Event, fieldsetFields: NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, min: number, max: number) => {
		console.log("fieldset event", event, min, max);

		if (min || max) {
			// if min or max set then update validity hidden field based the fields in the fieldset
			const target = event.target;

			// if target is not an element
			if (!(target instanceof HTMLSelectElement || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

			// TODO: Does this need to be input (with a long debounce; longer if it has a pattern?) for groups of text input elements?
			// TODO: maybe if it's just a basic required with no pattern then it's just input event and not change or blur?

			if (Array.from(fieldsetFields).includes(target)) {
				console.log("change array", target);
				const checked = Array.from(fieldsetFields).filter((field) => {
					if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
						return field.checked;
					}
					return field.value;
				});
				if (checked.length >= min && checked.length <= max) {
					this.hiddenValid.checked = true;
					this.dispatchHiddenValid(true);
				} else {
					console.error(`invalid (min: ${min} max: ${max} checked: ${checked.length})`);
					this.dispatchHiddenValid(false);
				}
			}
		}

		// Check all elements in fieldset are valid
	};

	private dispatchHiddenValid(checked: boolean) {
		this.hiddenValid.checked = checked;
		this.hiddenValid.dispatchEvent(new Event("input", { bubbles: true }));
	}

	/**
	 * Adds a hidden validity field to the DOM element.
	 */
	private addValidityField(el: HTMLFieldSetElement, name: string) {
		const hiddenValid = this.hiddenValid;
		hiddenValid.type = "checkbox";
		hiddenValid.name = `action-fieldset-${name}`;
		hiddenValid.setAttribute("required", "");
		hiddenValid.style.display = "none";
		hiddenValid.value = "valid";
		el.append(hiddenValid);
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("error-msg", ErrorMsg);
