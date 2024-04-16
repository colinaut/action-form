import type ActionForm from "./action-form";
import type ActionFormGroupCount from "./af-group-count";
import { ActionFormStepEvent } from "./types";

export default class ActionFormStep extends HTMLElement {
	private shadow: ShadowRoot | null;
	// this.this works if component uses Declarative Shadow DOM or not
	// TODO: test this with a browser that does not have Declarative Shadow DOM
	private this: this | ShadowRoot;

	public prev!: string;
	public next!: string;
	public submit!: string;

	// Reflected Attributes
	get valid(): boolean {
		return this.hasAttribute("valid");
	}

	set valid(value: boolean) {
		if (value) {
			this.setAttribute("valid", "");
		} else {
			this.removeAttribute("valid");
		}
	}

	// Method Getter
	get isValid(): boolean {
		// console.log("isValid", this.querySelectorAll(":invalid"));
		const afGroupCount = this.querySelector("af-group-count") as ActionFormGroupCount | null;
		let valid = true;
		if (afGroupCount) {
			valid = afGroupCount.validity;
		}

		return valid && this.querySelectorAll(":invalid").length === 0;
	}

	constructor() {
		super();

		const internals = this.attachInternals();
		this.shadow = internals.shadowRoot;
		this.this = this.shadow || this;

		// af-step requires action-form wrapper. Exit if it is not found
		const actionForm = this.closest("action-form") as ActionForm | null;
		if (!actionForm) return;

		// get button text
		this.prev = this.getAttribute("prev") || actionForm.prev;
		this.next = this.getAttribute("next") || actionForm.next;
		this.submit = this.getAttribute("submit") || actionForm.submit;

		// update validity and completed when change event is fired
		this.this.addEventListener("change", (event) => {
			console.log("af-step change isValid", event.target, this.isValid);
			this.valid = this.isValid;
		});

		// trigger next or prev step
		this.this.addEventListener("click", (e) => {
			const target = e.target;
			if (target instanceof HTMLButtonElement) {
				this.step(Number(target.dataset.direction || 0));
			}
		});
	}

	public step(direction: number = 1) {
		if (direction === 0) return;
		// If button is next check if any elements are invalid before moving to next step
		if (direction > 0) {
			const fields = this.querySelectorAll("input, select, textarea, af-group-count") as NodeListOf<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | ActionFormGroupCount
			>;

			const allValid = Array.from(fields).every((field) => {
				const valid = field.checkValidity();
				// fire off change to trigger change listeners on action-form to update validity
				field.dispatchEvent(new Event("change", { bubbles: true }));
				// console.log("🚀 ~ FormStep ~ step ~ allValid ~ field:", field, valid);
				// ends every loop on first invalid field
				if (!valid) {
					if (field.matches("af-group-count")) {
						const otherField = this.querySelector("input, select, textarea") as HTMLElement | null;
						otherField?.focus();
					} else {
						field.focus();
					}
				}
				return valid;
			});

			if (!allValid) return;
		}
		this.dispatchEvent(new CustomEvent<ActionFormStepEvent>("af-step", { bubbles: true, detail: { direction } }));
	}

	public connectedCallback(): void {
		// console.log("connected");
		this.valid = this.isValid;

		// check for footer
		const footer = this.this.querySelector("slot[name=footer]") || this.this.querySelector("[slot=footer]");

		// add footer if it doesn't exist
		if (!footer) {
			const nav = document.createElement("nav");
			nav.classList.add("af-step-nav");
			nav.setAttribute("part", "step-nav");
			nav.setAttribute("aria-label", "Step Navigation");
			const stepButton = (buttonText: string, next?: boolean) => {
				return `<button type="button" class="af-step-${next ? "next" : "prev"}" data-direction="${next ? 1 : -1}" part="step-btn ${
					next ? "next" : "prev"
				}">${buttonText}</button>`;
			};
			const leftBtn = this.classList.contains("first") ? `<span></span>` : stepButton(this.prev, false);
			const rightBtn = this.classList.contains("last") ? `<button type="submit" part="submit">${this.submit}</button>` : stepButton(this.next, true);
			nav.innerHTML = `${leftBtn}${rightBtn}`;
			this.this.appendChild(nav);
		}
	}
}

customElements.define("af-step", ActionFormStep);

// Import af-progress so it is part of the af-step js bundle.
import "./af-progress";
