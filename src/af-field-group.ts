export default class ActionFormFieldGroup extends HTMLElement {
	private readonly shadow = this.attachShadow({ mode: "open" });
	private internals: ElementInternals = this.attachInternals();
	static formAssociated = true;
	public name: string = this.getAttribute("name") || "";

	get min(): number {
		return Number(this.getAttribute("min") || 0);
	}

	get max(): number {
		return Number(this.getAttribute("max") || Infinity);
	}

	get value(): number {
		let values = [];
		const fields = this.querySelectorAll("input, select, textarea") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
		values = Array.from(fields).filter((field) =>
			field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type) ? field.checked : field.checkValidity() && field.value
		);
		return values.length;
	}

	set value(value: number) {
		this.setAttribute("value", String(value));
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
	}

	public focus() {
		// override focus event to focus the first field element
		// not sure why adding eventListener for "focus" event didn't work, but this does for my needs
		const firstField = this.querySelector("input, select, textarea") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		if (firstField) firstField.focus();
	}

	public checkValidity(): boolean {
		const validity = this.value >= this.min && this.value <= this.max;
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
