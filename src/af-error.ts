import { randomId, isFieldOrGroup } from "./helpers";

export default class ActionFormError extends HTMLElement {
	public target: HTMLFormElement | null = null;
	private readonly shadow = this.attachShadow({ mode: "open" });

	constructor() {
		super();
	}

	private addAria(target: HTMLElement) {
		// skip if target is not a form element or if it already has a matching aria-describedby
		if (isFieldOrGroup(target)) {
			// get id of this af-error element either from the aria-describedby attribute or from itself or make one
			const id = target.getAttribute("aria-describedby") || this.getAttribute("id") || randomId(target.id);

			// set the id on this element and the aria-describedby
			this.setAttribute("id", id);
			target.setAttribute("aria-describedby", id);
		}
	}

	public connectedCallback(): void {
		// hide by default
		this.style.visibility = "hidden";
		// get target from attribute
		const targetId = this.getAttribute("for") || "";
		const target = targetId ? document.getElementById(targetId) : this.closest("label")?.querySelector(`input, select, textarea`);
		// get field ID from attribute
		if (isFieldOrGroup(target)) {
			// Make id and add aria-describedby attribute to the target element
			this.addAria(target);
			// render the element
			this.render();
		}
	}

	static get observedAttributes() {
		return ["data-invalid"];
	}

	public attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
		// console.log("changed", name, oldValue, newValue);
		if (name === "data-invalid" && (newValue === "pattern" || newValue === "required")) {
			// rerender based on pattern or required
			this.render(newValue);
		}
	}

	public render(part: "pattern" | "required" = "required") {
		const parts = {
			required: `<slot>Required</slot>`,
			pattern: `<slot name="pattern">Not filled in properly</slot>`,
		};
		this.shadow.innerHTML = parts[part];
	}
}
