import type ActionFormGroupCount from "./af-group-count";
function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
}

type HTMLFormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFieldSetElement;

export default class ActionFormError extends HTMLElement {
	constructor() {
		super();
	}

	private show(el: HTMLElement, valid: boolean = false): boolean {
		if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
			valid = valid || el.checkValidity();
		}
		if (valid) {
			this.removeAttribute("show");
			el.removeAttribute("aria-invalid");
		} else {
			this.setAttribute("show", "");
			el.setAttribute("aria-invalid", "true");
		}
		return valid;
	}

	private addAria = (target: HTMLFormElement) => {
		const id = this.getAttribute("id");
		if (id) return id;
		const randomId = `${target.id || target.name || target.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
		this.setAttribute("id", randomId);
		target.setAttribute("aria-describedby", randomId);
	};

	// TODO: Clean up this code
	// TODO: add ARIA for error messages
	public connectedCallback(): void {
		// get field ID from attribute
		const targetId = this.getAttribute("for") || "";

		const target = targetId ? document.getElementById(targetId) : this.closest("label")?.querySelector(`input, select, textarea, fieldset`);

		if (target?.matches("input, select, textarea, fieldset")) {
			const el = target as HTMLFormElement;

			console.log(`watching ${target.tagName.toLowerCase()} ${targetId}`);

			// Make id and add aria-describedby attribute to the target element
			this.addAria(el);

			if (target instanceof HTMLFieldSetElement) {
				// add min and max attributes to the fieldset and event listener
				this.addMinMaxField(target);
			} else {
				// add event type as a data attribute
				el.dataset.eventType = el.dataset.eventType || isChangeField(el) ? "change" : "blur";

				// add toggle-error event listener which is used to hide/show error message by af-step
				el.addEventListener("toggle-error", () => {
					// console.log("toggle-error", el.checkValidity(), el.name);
					this.show(el);
				});

				this.eventHandler = this.eventHandler.bind(el);

				// add event listeners for change and blur
				el.addEventListener(el.dataset.eventType, this.eventHandler);
			}
		}
	}

	private eventHandler = (event: Event) => {
		const target = event.target;
		if (!target) return;
		const el = target as HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement;
		// console.log("eventHandler", this, el);
		const valid = this.show(el);
		if (!valid && el.dataset.eventType !== "input") {
			el.dataset.eventType = el.dataset.eventType || isChangeField(el) ? "change" : "blur";
			el.removeEventListener(el.dataset.eventType, this.eventHandler);
			el.dataset.eventType = "input";
			el.addEventListener(el.dataset.eventType, this.eventHandler);
		}
	};

	// TODO: maybe convert this to it's own element fieldset-group-error
	private addMinMaxField(fieldset: HTMLFieldSetElement): void {
		const fields = fieldset.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
		const min = parseInt(this.getAttribute("min") || "1");
		const max = parseInt(this.getAttribute("max") || "0") || fields.length;
		let counter = fieldset.querySelector("af-group-count") as ActionFormGroupCount | null;
		if (!counter) {
			counter = document.createElement("af-group-count") as ActionFormGroupCount;
			counter.setAttribute("hidden", "");
			fieldset.append(counter);
		}
		counter.setAttribute("min", String(min)); // min = min;
		counter.setAttribute("max", String(max)); // max = max;

		fieldset.addEventListener("change", () => {
			const values = this.getValues(fields);
			if (!counter) return;
			counter.value = values.length;
			const isValid = counter.checkValidity();
			// console.log("🚀 ~ ErrorMsg ~ fieldset.addEventListener ~ isValid:", isValid);
			this.show(fieldset, isValid);
		});
	}

	private getValues(fields: NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): string[] {
		const values: string[] = [];
		fields.forEach((field) => {
			if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
				if (field.checked) values.push(field.value);
			} else {
				field.value && field.checkValidity() && values.push(field.value);
			}
		});
		return values;
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("af-error", ActionFormError);
