import type ActionFormGroupCount from "./af-group-count";
function isChangeField(field: Element): boolean {
	return (field instanceof HTMLInputElement && ["radio", "checkbox", "range", "color", "file"].includes(field.type)) || field instanceof HTMLSelectElement;
}

type HTMLFormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFieldSetElement;

function isHTMLFormElement(el: Element): el is HTMLFormElement {
	return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el instanceof HTMLFieldSetElement;
}

export default class ActionFormError extends HTMLElement {
	public target: HTMLFormElement | null = null;

	constructor() {
		super();

		const targetId = this.getAttribute("for") || "";
		const target = document.getElementById(targetId) || this.closest("label")?.querySelector(`input, select, textarea`);
		this.target = target && isHTMLFormElement(target) ? target : null;
	}

	// TODO: get this working for fieldsets again!!!!
	public showError(invalid: boolean = true): void {
		const el = this.target;
		if (!el) return;
		// console.log("🚀 ~ file: af-error.ts:ActionFormError.showError ~ el", el);

		if (invalid) {
			this.setAttribute("show", "");
			el.setAttribute("aria-invalid", "true");
		} else {
			this.removeAttribute("show");
			el.removeAttribute("aria-invalid");
		}
	}

	// TODO: QA aria is done right
	private addAria = (target: HTMLElement) => {
		if (!isHTMLFormElement(target)) return;
		const id = this.getAttribute("id") || `${target.id || target.name || target.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
		this.setAttribute("id", id);
		target.setAttribute("aria-describedby", id);
		return id;
	};

	public connectedCallback(): void {
		// get field ID from attribute
		if (this.target) {
			const el = this.target;
			console.log(`watching ${el.tagName.toLowerCase()} ${el.id}`);

			// Make id and add aria-describedby attribute to the target element
			this.addAria(el);

			if (el instanceof HTMLFieldSetElement) {
				// add min and max attributes to the fieldset and event listener
				console.log("🚀 ~ is fieldset", el.id, el.dataset.group);
			}
		}
	}

	private eventHandler = (event: Event) => {
		const target = event.target;
		if (!target) return;
		const el = target as HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement;
		// console.log("eventHandler", this, el);
		const valid = this.showError();
		if (!valid && el.dataset.eventType !== "input") {
			el.dataset.eventType = el.dataset.eventType || isChangeField(el) ? "change" : "blur";
			el.removeEventListener(el.dataset.eventType, this.eventHandler);
			el.dataset.eventType = "input";
			el.addEventListener(el.dataset.eventType, this.eventHandler);
		}
	};

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("af-error", ActionFormError);
