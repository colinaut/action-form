import { randomId } from "./helpers";
export default class ActionFormFieldGroup extends HTMLElement {
	private readonly shadow = this.attachShadow({ mode: "open" });
	private internals: ElementInternals = this.attachInternals();
	static formAssociated = true;
	public name: string = this.getAttribute("name") || randomId("af-field-group");

	get min(): number {
		return Number(this.getAttribute("min") || 0);
	}

	get max(): number {
		return Number(this.getAttribute("max") || Infinity);
	}

	get value(): string {
		let values = [];
		const fields = this.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
		values = Array.from(fields).filter((field) =>
			field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type) ? field.checked : field.checkValidity() && field.value
		);
		return String(values.length);
	}

	constructor() {
		super();
		this.render();
		this.checkValidity();
		this.addEventListener("change", (event) => {
			// ignore changes from this element
			if (event.target === this) return;
			// check validity and send change event from this element to trigger error message
			this.checkValidity();
			this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
		});

		this.closest("form")?.addEventListener("formdata", (event) => {
			event.formData.append(this.name, this.value);
		});
	}

	public focus() {
		// override focus event to focus the first field element
		// not sure why adding eventListener for "focus" event didn't work, but this does for my needs
		const firstField = this.querySelector("input, select, textarea") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		if (firstField) firstField.focus();
	}

	public checkValidity(): boolean {
		this.setAttribute("value", this.value);
		const value = Number(this.value);
		const validity = value >= this.min && value <= this.max;
		this.setValidity(validity);
		return validity;
	}

	public setValidity(validity: boolean): void {
		const flags = validity ? {} : { customError: true };
		const message = validity ? "" : "Value is out of range";
		this.internals.setValidity(flags, message);
		this.setAttribute("validity", String(validity));
	}

	render() {
		this.shadow.innerHTML = `<slot></slot>`;
	}
}
