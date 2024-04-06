import { makeAttributes } from "./helpers";
export default class ActionFormGroupCount extends HTMLElement {
	private shadow: ShadowRoot;

	public min!: number;
	public max!: number;

	constructor() {
		super();

		makeAttributes(this, [
			{ attr: "min", type: "number", defaultValue: 1 },
			{ attr: "max", type: "number", defaultValue: Infinity },
		]);

		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = `${this.value}`;
		this.setValidity();
	}

	static formAssociated = true;

	private internals = this.attachInternals();

	get value(): number {
		return Number(this.shadow.textContent || "0");
	}

	set value(value: number) {
		this.shadow.textContent = value.toString();
		this.setValidity();
	}

	attributeChangedCallback() {
		// if min or max changes then setValidity
		this.setValidity();
	}

	public checkValidity(): boolean {
		return this.value >= this.min && this.value <= this.max;
	}

	public setValidity(): void {
		const valid = this.checkValidity();
		if (valid) {
			this.internals.setValidity({});
		} else {
			this.internals.setValidity({ customError: true }, "Value is out of range");
			// console.error("out of range");
		}
		this.dispatchEvent(new CustomEvent("count", { bubbles: true, composed: true, detail: { value: this.value, validity: valid } }));
	}
}

customElements.define("af-group-count", ActionFormGroupCount);
