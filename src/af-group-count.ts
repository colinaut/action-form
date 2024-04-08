import { makeAttributes } from "./helpers";
export default class ActionFormGroupCount extends HTMLElement {
	public shadow: ShadowRoot;
	public min!: number;
	public max!: number;
	public value: number = 0;
	public validity!: boolean;

	private fieldset: HTMLFieldSetElement | null = this.closest("fieldset");

	constructor() {
		super();

		// Stop if this is not in a fieldset
		if (!this.fieldset) {
			throw new Error("no fieldset found");
		}

		// get min and max from attributes from the closest fieldset
		const [minStr, maxStr] = this.fieldset.dataset.group?.split("-") || [];
		const min = Number(minStr) || 1;
		const max = Number(maxStr) || Infinity;

		// set up attributes
		makeAttributes(this, [
			{ attr: "min", type: "number", defaultValue: min },
			{ attr: "max", type: "number", defaultValue: max },
		]);

		// set up shadow DOM
		this.shadow = this.attachShadow({ mode: "open" });
		// Check validity (this also adds value to shadow DOM)
		this.shadow.innerHTML = `${this.value}`;
		this.checkValidity();

		// Add error message aria to element
		this.setAttribute("aria-describedby", this.fieldset.getAttribute("aria-describedby") || "");
		// Add event listener to fieldset: when any input changes besides this element, check validity
		this.fieldset.addEventListener("change", (event) => {
			if (event.target !== this) {
				this.checkValidity();
			}
		});
	}

	static formAssociated = true;

	private internals = this.attachInternals();

	attributeChangedCallback() {
		// if min or max changes then setValidity
		this.checkValidity();
	}

	public checkValidity(): boolean {
		// get value based on current state of fieldset elements
		const value = this.getValue();
		// if value is different from this.value then update
		if (value !== this.value) {
			this.value = value;
			this.shadow.innerHTML = `${value}`;
			this.validity = value >= this.min && value <= this.max;
			// console.log("🚀 ~ value:", value, this.value, this.validity);
			this.setValidity();
			this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
		}
		return this.validity;
	}

	public getValue() {
		if (!this.fieldset) {
			throw new Error("no fieldset found");
		}
		const fields = this.fieldset.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
		const values = Array.from(fields).filter((field) =>
			field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type) ? field.checked : field.checkValidity() && field.value
		);
		return values.length;
	}

	public setValidity(): void {
		const flags = this.validity ? {} : { customError: true };
		const message = this.validity ? "" : "Value is out of range";
		this.internals.setValidity(flags, message);
	}
}

customElements.define("af-group-count", ActionFormGroupCount);
