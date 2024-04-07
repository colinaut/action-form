import type ActionFormGroupCount from "./af-group-count";
function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
}

type HTMLFormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFieldSetElement;

function isHTMLFormElement(el: Element): el is HTMLFormElement {
	return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el instanceof HTMLFieldSetElement;
}

export default class ActionFormError extends HTMLElement {
	constructor() {
		super();
	}

	private show(el: HTMLElement, valid: boolean = false): boolean {
		if (isHTMLFormElement(el)) {
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

	private addAria = (target: HTMLElement) => {
		if (!isHTMLFormElement(target)) return;
		const id = this.getAttribute("id") || `${target.id || target.name || target.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
		this.setAttribute("id", id);
		target.setAttribute("aria-describedby", id);
	};

	get target() {
		const targetId = this.getAttribute("for") || "";
		const target = document.getElementById(targetId) || this.closest("label")?.querySelector(`input, select, textarea`);

		return target && isHTMLFormElement(target) ? target : null;
	}

	// TODO: QA aria is done right
	public connectedCallback(): void {
		// get field ID from attribute
		if (this.target) {
			const el = this.target;
			console.log(`watching ${el.tagName.toLowerCase()} ${el.id}`);

			// Make id and add aria-describedby attribute to the target element
			this.addAria(el);

			if (el instanceof HTMLFieldSetElement) {
				// add min and max attributes to the fieldset and event listener
				this.addMinMaxField(el);
			} else {
				// add event type as a data attribute
				el.dataset.eventType = el.dataset.eventType || isChangeField(el) ? "change" : "blur";

				// add toggle-error event listener which is used to hide/show error message by af-step
				el.addEventListener("toggle-error", () => {
					console.log("toggle-error", el.name, el.checkValidity());
					this.show(el);
					if (!el.checkValidity()) {
						el.focus();
					}
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
		const min = Number(this.getAttribute("min") || "1");
		const max = Number(this.getAttribute("max") || Infinity);
		let counter = fieldset.querySelector("af-group-count") as ActionFormGroupCount | null;
		if (!counter) {
			counter = document.createElement("af-group-count") as ActionFormGroupCount;
			counter.setAttribute("hidden", "");
			fieldset.append(counter);
		}
		counter.setAttribute("min", String(min)); // min = min;
		counter.setAttribute("max", String(max)); // max = max;

		fieldset.addEventListener("change", () => {
			if (!counter) return;
			const isValid = counter.checkValidity();
			// console.log("🚀 ~ ErrorMsg ~ fieldset.addEventListener ~ isValid:", isValid);
			this.show(fieldset, isValid);
		});
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("af-error", ActionFormError);
