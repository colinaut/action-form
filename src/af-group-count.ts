import { makeAttributes } from "./helpers";
export default class ActionFormGroupCount extends HTMLElement {
	public shadow: ShadowRoot;
	public min!: number;
	public max!: number;

	private fieldset: HTMLFieldSetElement | null = this.closest("fieldset");

	constructor() {
		super();

		makeAttributes(this, [
			{ attr: "min", type: "number", defaultValue: 1 },
			{ attr: "max", type: "number", defaultValue: Infinity },
		]);

		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = `${this.value}`;
		this.checkValidity();
	}

	static formAssociated = true;

	private internals = this.attachInternals();

	attributeChangedCallback() {
		// if min or max changes then setValidity
		this.checkValidity();
	}

	public checkValidity(): boolean {
		// get new value
		const value = this.value;
		console.log("🚀 ~ value:", value);
		// update shadow DOM value
		this.shadow.innerHTML = `${this.value}`;
		// set validity
		const valid = value >= this.min && value <= this.max;
		this.setValidity(valid);
		// return validity
		return valid;
	}

	get value() {
		if (!this.fieldset) {
			throw new Error("no fieldset found");
		}
		const fields = this.fieldset.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
		const values = Array.from(fields).filter((field) => (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type) ? field.checked : field.value));
		return values.length;
	}

	public setValidity(valid: boolean): void {
		const flags = valid ? {} : { customError: true };
		const message = valid ? "" : "Value is out of range";
		this.internals.setValidity(flags, message);
		this.dispatchEvent(new CustomEvent("count", { bubbles: true, composed: true, detail: { value: this.value, validity: valid } }));
	}
}

customElements.define("af-group-count", ActionFormGroupCount);
