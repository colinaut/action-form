import type ActionForm from "./action-form";
import type ActionFormGroupCount from "./af-group-count";
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
			{ attr: "active", type: "boolean" },
			{ attr: "valid", type: "boolean" },
		]);

		// update validity and completed when change event is fired
		this.this.addEventListener("change", () => {
			console.log("af-step change isValid", this.isValid);
			this.valid = this.isValid;
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

		//TODO: maybe change this to a mutation observer?
		this.this.addEventListener("af-watcher", () => {
			this.valid = this.isValid;
		});
	}

	get isValid(): boolean {
		// console.log("isValid", this.querySelectorAll(":invalid"));
		const afGroupCount = this.querySelector("af-group-count") as ActionFormGroupCount | null;
		if (afGroupCount) {
			console.log("afGroupCount", afGroupCount.value, afGroupCount.validity);
			return afGroupCount.validity;
		}

		return this.querySelectorAll(":invalid").length === 0;
	}

	get thisStep(): number {
		return (
			(this.actionForm?.steps &&
				Array.from(this.actionForm.steps)
					.filter((step) => !step.hidden)
					.indexOf(this)) ||
			0
		);
	}

	get nextStep(): number | null {
		return this.thisStep + 1 < this.numberOfSteps ? this.thisStep + 1 : null;
	}
	get prevStep(): number | null {
		return this.thisStep - 1 >= 0 ? this.thisStep - 1 : null;
	}

	public step(direction: "prev" | "next" = "next") {
		const directionIndex = direction === "next" ? this.nextStep : this.prevStep;
		// guard against negative step
		if (directionIndex === null) return;

		console.log("🚀 ~ FormStep ~ step ~ directionIndex:", directionIndex);

		// If button is next check if any elements are invalid before moving to next step
		if (direction === "next") {
			const fields = this.querySelectorAll("input, select, textarea, af-group-count") as NodeListOf<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | ActionFormGroupCount
			>;

			const allValid = Array.from(fields).every((field) => {
				const valid = field.checkValidity();
				field.dispatchEvent(new Event("change", { bubbles: true }));
				console.log("🚀 ~ FormStep ~ step ~ allValid ~ field:", field, valid);
				return valid;
			});

			if (!allValid) return;
		}

		this.active = false;
		this.dispatchEvent(new CustomEvent("af-step", { bubbles: true, detail: { step: directionIndex } }));
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
			const stepButton = (direction: "Next" | "Prev") => {
				return `<button type="button" class="af-step-${direction.toLowerCase()}" part="step-btn">${direction}</button>`;
			};
			const submit = `<button type="submit" part="submit">Submit</button>`;
			nav.innerHTML = `${this.prevStep !== null ? stepButton("Prev") : `<span></span>`}
            ${this.nextStep !== null ? stepButton("Next") : submit}`;
			this.this.appendChild(nav);
		}
	}
}

customElements.define("af-step", ActionFormStep);
