import type ActionForm from "./action-form";
import { makeAttributes } from "./helpers";

export default class ActionFormStep extends HTMLElement {
	private shadow: ShadowRoot | null;
	// this.this works if component uses Declarative Shadow DOM or not
	// TODO: test this with a browser that does not have Declarative Shadow DOM
	private this: this | ShadowRoot;

	// properties grabbed from action-form
	private actionForm!: ActionForm;
	private numberOfSteps!: number;

	// Attributes set up with get/set using makeAttributes
	public valid!: boolean;
	public completed!: boolean;
	public active!: boolean;

	constructor() {
		super();

		const internals = this.attachInternals();
		this.shadow = internals.shadowRoot;
		this.this = this.shadow || this;

		// af-step requires action-form wrapper. Exit if it is not found
		const actionForm = this.closest("action-form") as ActionForm | null;
		if (!actionForm) return;
		this.actionForm = actionForm;
		this.numberOfSteps = actionForm.steps?.length || 0;

		makeAttributes(this, [
			{ attr: "completed", type: "boolean" },
			{ attr: "active", type: "boolean" },
			{ attr: "valid", type: "boolean" },
		]);

		// update validity when input event is fired
		this.this.addEventListener("input", () => {
			// console.log(this.isValid);
			this.valid = this.isValid;
			this.completed = this.completed && this.valid;
		});
		// change validity when count event is fired from af-group-count
		this.this.addEventListener("count", (event) => {
			const customEvent = event as CustomEvent<{ validity: boolean; value: number }>;
			this.valid = customEvent.detail.validity;
		});

		// trigger next or prev step
		this.this.addEventListener("click", (e) => {
			const target = e.target;
			if (!(target instanceof HTMLButtonElement)) return;
			// console.log("🚀 ~ FormStep ~ this.addEventListener ~ target:", target);

			if (target.matches(".af-step-next")) {
				this.step("next");
			} else if (target.matches(".af-step-prev")) {
				this.step("prev");
			}
		});
	}

	get isValid(): boolean {
		return this.querySelectorAll(":invalid").length === 0;
	}

	get thisStep(): number {
		return (this.actionForm?.steps && Array.from(this.actionForm.steps).indexOf(this)) || 0;
	}

	get nextStep(): number | null {
		return this.thisStep + 1 < this.numberOfSteps ? this.thisStep + 1 : null;
	}
	get prevStep(): number | null {
		return this.thisStep - 1 >= 0 ? this.thisStep - 1 : null;
	}

	get isLastStep(): boolean {
		return this.thisStep === this.numberOfSteps - 1;
	}

	public step(direction: "prev" | "next" = "next") {
		const directionIndex = direction === "next" ? this.nextStep : this.prevStep;
		// guard against negative step
		if (directionIndex === null) return;

		console.log("🚀 ~ FormStep ~ step ~ directionIndex:", directionIndex);

		// If button is next check if any elements are invalid before moving to next step
		if (direction === "next" && this.querySelectorAll(":invalid").length > 0) {
			const invalidElements = this.querySelectorAll(":invalid");

			// If any are invalid then focus on first invalid
			Array.from(invalidElements).some((element) => {
				if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
					console.log("af-step: invalid element", element);

					element.focus();
					element.dispatchEvent(new CustomEvent("toggle-error"));

					// return true on first matching element. This ends the loop
					return true;
				}
				// console.log("invalid unknown element", element);
				// ignore non matching elements
				return false;
			});

			// Search also for fieldset elements that are invalid
			Array.from(invalidElements).some((element) => {
				if (element instanceof HTMLFieldSetElement) {
					console.log("af-step: invalid element", element);
					element.dispatchEvent(new CustomEvent("toggle-error"));
					const firstField = element.querySelector("input, select, textarea") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
					if (firstField) {
						firstField.focus();
					}
				}
			});
			// this return stops the step event from advancing
			return;
		}
		if (direction === "next") {
			this.completed = true;
		}

		this.active = false;
		this.dispatchEvent(new CustomEvent("af-step", { bubbles: true, detail: { step: directionIndex } }));
	}

	public connectedCallback(): void {
		// console.log("connected");
		this.valid = this.isValid;
		this.completed = false;

		// check for footer
		const footer = this.this.querySelector("slot[name=footer]") || this.this.querySelector("[slot=footer]");

		// add footer if it doesn't exist
		if (!footer) {
			const nav = document.createElement("nav");
			nav.classList.add("af-step-nav");
			nav.setAttribute("part", "step-nav");
			nav.setAttribute("aria-label", "Step Navigation");
			const stepButton = (direction: "Next" | "Prev") => {
				return `<button type="button" class="af-step-${direction.toLowerCase()}" part="step-btn">${direction}</button>`;
			};
			const blank = `<span></span>`;
			nav.innerHTML = `${this.prevStep !== null ? stepButton("Prev") : blank}
            ${this.nextStep !== null ? stepButton("Next") : blank}`;
			this.this.appendChild(nav);
		}
	}
}

customElements.define("af-step", ActionFormStep);
