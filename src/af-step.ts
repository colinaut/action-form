import type ActionForm from "./action-form";
import type ActionFormGroupCount from "./af-group-count";

export default class ActionFormStep extends HTMLElement {
	private shadow: ShadowRoot | null;
	// this.this works if component uses Declarative Shadow DOM or not
	// TODO: test this with a browser that does not have Declarative Shadow DOM
	private this: this | ShadowRoot;

	// properties grabbed from action-form
	private actionForm!: ActionForm;
	private numberOfSteps!: number;

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

	get index(): number | undefined {
		return Number(this.getAttribute("index") || 0);
	}

	set index(value: number) {
		this.setAttribute("index", String(value));
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
		this.actionForm = actionForm;
		this.numberOfSteps = actionForm.steps?.length || 0;

		// update validity and completed when change event is fired
		this.this.addEventListener("change", () => {
			// console.log("af-step change isValid", this.isValid);
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

	public step(direction: "prev" | "next" = "next") {
		// If button is next check if any elements are invalid before moving to next step
		if (direction === "next") {
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
		this.dispatchEvent(new CustomEvent("af-step", { bubbles: true, detail: { direction } }));
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
			const leftBtn = this.classList.contains("first") ? `<span></span>` : stepButton("Prev");
			const rightBtn = this.classList.contains("last") ? `<button type="submit" part="submit">Submit</button>` : stepButton("Next");
			nav.innerHTML = `${leftBtn}${rightBtn}`;
			this.this.appendChild(nav);
		}
	}
}

customElements.define("af-step", ActionFormStep);
