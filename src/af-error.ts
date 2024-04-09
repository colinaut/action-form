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
			this.setAttribute("invalid", "");
			el.setAttribute("aria-invalid", "true");
		} else {
			this.removeAttribute("invalid");
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
		}
		// Add "Required" text is there is no text
		if (!this.textContent) {
			this.textContent = "Required";
		}
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("af-error", ActionFormError);
