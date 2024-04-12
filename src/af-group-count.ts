export default class ActionFormGroupCount extends HTMLElement {
	private fieldset: HTMLFieldSetElement | null = this.closest("fieldset");
	// Needed for validity
	private internals = this.attachInternals();

	// Public properties
	public shadow: ShadowRoot;
	public value: number = this.getValue();
	public validity: boolean = this.checkValidity();
	public name: string = this.getAttribute("name") || "";

	// Reflected attribute properties
	get min(): number {
		return Number(this.getAttribute("min") || 1);
	}

	set min(value: number) {
		this.setAttribute("min", String(value));
	}

	get max(): number {
		return Number(this.getAttribute("max") || Infinity);
	}

	set max(value: number) {
		this.setAttribute("max", String(value));
	}

	constructor() {
		super();

		// Stop if this is not in a fieldset
		if (!this.fieldset) {
			throw new Error("no fieldset found");
		}

		// Update min and max from attributes from the closest fieldset
		const [minStr, maxStr] = this.fieldset.dataset.group?.split("-") || [];
		this.min = Number(minStr || this.min);
		this.max = Number(maxStr || this.max);

		// console.log("🚀 ~ min/max", this.fieldset.id, this.min, this.max, Number(minStr), Number(maxStr));

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
			// console.log("🚀 ~ value:", value, this.value, this.min, this.max, this.validity);
			this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
		}
		this.validity = value >= this.min && value <= this.max;
		this.setValidity();
		return this.validity;
	}

	private getValue() {
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
		this.setAttribute("validity", String(this.validity));
	}
}

customElements.define("af-group-count", ActionFormGroupCount);
