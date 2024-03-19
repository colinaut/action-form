import FormStep from "./form-step";
export default class ActionForm extends HTMLElement {
	constructor() {
		super();
		const form = this.querySelector("form");
		if (form) {
			/*
			 * Set novalidate on the form if novalidate set on action-form.
			 * This way novalidate is only set if javascript is loaded and form-action is defined.
			 * We want to allow falling back to browser validation if javascript is not loaded.
			 */
			if (this.hasAttribute("novalidate")) {
				form.setAttribute("novalidate", "");
			}

			this.addEventListener("input", (event) => {
				const target = event.target;
				if (!(target instanceof HTMLSelectElement || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
				const name = target.getAttribute("name") || "";
				if (!name) return;
				const field = form.elements[name];
				const value =
					field instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
						? field.value
						: Array.from(field)
								.filter((field) => field.checked)
								.map((field) => field.value);
				console.log("input", name, value);
				this.dispatchEvent(new CustomEvent(`input[${name}]`, { detail: { validity: target.checkValidity(), value: target.value } }));
				// TODO: have error-msg listen for this
			});
		}
	}

	public stepIndex: number = 0; // current step
	public steps: NodeListOf<FormStep> = this.querySelectorAll("form-step");
	public formElements: NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = this.querySelectorAll("input, select, textarea");

	public connectedCallback(): void {
		console.log("connected");
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("action-form", ActionForm);
