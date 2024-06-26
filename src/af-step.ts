import type ActionForm from "./action-form";
import { createEffect } from "./signals";

export default class ActionFormStep extends HTMLElement {
	private actionForm!: ActionForm;

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
		return this.querySelectorAll(":invalid").length === 0;
	}

	private getStepTitle(direction: "prev" | "next"): string {
		let el = direction === "next" ? this.nextElementSibling : this.previousElementSibling;
		// Find next element that is visible
		if (el && el instanceof HTMLElement && el.style.display === "none") {
			el = direction === "next" ? el.nextElementSibling : el.previousElementSibling;
		}
		if (el && el.matches("af-step")) {
			// Return the data.title if it exists, otherwise return data[direction] on the action-form element or return the direction as sentence case
			// @ts-expect-error if it matches then it is the right element
			return el.dataset.title || this.actionForm?.dataset[direction] || direction.replace(/^\w/, (c) => c.toUpperCase());
		} else {
			return "";
		}
	}

	get submit() {
		return this.actionForm?.dataset.submit || "Submit";
	}

	constructor() {
		super();

		const actionForm = this.closest("action-form") as ActionForm | null;
		if (actionForm) {
			this.actionForm = actionForm;

			// update validity and completed when change event is fired
			this.addEventListener("change", () => {
				// console.log("af-step change isValid", event.target, this.isValid);
				this.valid = this.isValid;
			});

			// trigger next or prev step
			this.addEventListener("click", (e) => {
				const target = e.target;
				if (target instanceof HTMLButtonElement) {
					const direction = target.dataset.direction || "next";
					if (direction === "next" || direction === "prev") {
						actionForm.steps[direction]();
					}
				}
			});

			/* ----------- update button text when steps are added or removed ----------- */
			createEffect(() => {
				console.log("🫨 create effect: af-step: update button text");
				actionForm.steps.stepsLength();
				this.setButtonTexts();
			});
		}

		// this.actionForm?.step.subscribe(() => {
		// 	this.setButtonTexts();
		// });
	}

	public connectedCallback(): void {
		// console.log("connected");
		this.valid = this.isValid;

		// add footer
		const nav = document.createElement("nav");
		nav.classList.add("af-step-nav");
		nav.setAttribute("part", "step-nav");
		nav.setAttribute("aria-label", "Step Navigation");
		const stepButton = (direction: "next" | "prev" = "next") => {
			const title = this.getStepTitle(direction);
			if (title) {
				return `<button type="button" class="af-step-${direction}" data-direction="${direction}" part="step-btn ${direction}">${title}</button>`;
			} else if (direction === "next") {
				// direction next and no title = last step
				return `<button type="submit" part="submit">${this.submit}</button>`;
			} else {
				// no title = first step
				return `<span></span>`;
			}
		};
		nav.innerHTML = `${stepButton("prev")}${stepButton("next")}`;
		this.appendChild(nav);
	}

	private setButtonTexts() {
		(this.querySelectorAll(".af-step-nav button[data-direction]") as NodeListOf<HTMLButtonElement>).forEach((btn) => {
			if (btn.dataset.direction === "next" || btn.dataset.direction === "prev") {
				btn.textContent = this.getStepTitle(btn.dataset.direction);
			}
		});
	}
}

// define progress element here as it is required for step navigation
