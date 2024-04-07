import ActionFormStep from "./af-step";
export default class ActionForm extends HTMLElement {
	constructor() {
		super();
		document.documentElement.classList.add("js");

		const form = this.querySelector("form");
		if (form) {
			/*
			 * Set novalidate on the form if novalidate set on action-form.
			 * This way novalidate is only set if javascript is loaded and form-action is defined.
			 * We want to allow falling back to browser validation if javascript is not loaded.
			 */
			if (this.hasAttribute("novalidate")) {
				form.setAttribute("novalidate", "");
			}

			if (this.steps.length > 0) {
				this.steps[0].setAttribute("active", "");
			}

			this.addEventListener("af-step", (event) => {
				const customEvent = event as CustomEvent<{ step: number | undefined }>;
				console.log("af-step", customEvent.detail?.step);
				if (customEvent.detail?.step === undefined) return;
				this.stepIndex = customEvent.detail.step;
				this.steps.forEach((step, i) => {
					// if current step is valid, set completed
					if (step.active) step.completed = step.valid;
					// set active based on index
					step.active = i === this.stepIndex;
				});
			});

			this.enhanceFieldsets();

			this.addEventListener("change", () => {
				const formData = new FormData(form);
				if (!formData) return;

				this.watchers.forEach((watcher) => {
					const values = formData.getAll(watcher.name);
					const valid = values.some((value) => typeof value === "string" && (value === watcher.value || (watcher.regex && watcher.regex.test(value))));
					// if it is hidden and it is invalid, or vice versa, that means the state is fine so return.
					if (watcher.el.hasAttribute("hidden") !== valid) return;
					console.log("watcher", watcher.name, valid);
					// Else show/hide it
					this.show(watcher.el, valid);
					// if this is af-step then trigger event to update progress bar
					if (watcher.el.matches("af-step")) this.dispatchEvent(new CustomEvent("af-step"));
				});
			});
		}
	}

	get steps(): NodeListOf<ActionFormStep> {
		return this.querySelectorAll("af-step:not([hidden])") as NodeListOf<ActionFormStep>;
	}

	public stepIndex: number = 0; // current step

	private watchers: { el: HTMLElement; name: string; value?: string; regex?: RegExp }[] = [];

	private enhanceFieldsets() {
		const elements = this.querySelectorAll("[data-watch]") as NodeListOf<HTMLElement>;
		elements.forEach((fieldset) => {
			const watch = fieldset.dataset.watch;
			const value = fieldset.dataset.value;
			const regex = fieldset.dataset.regex ? new RegExp(fieldset.dataset.regex) : undefined;
			if (watch) {
				this.watchers.push({ name: watch, value, regex, el: fieldset });
			}
		});
	}

	private show(el: HTMLElement, show: boolean): void {
		if (show) {
			el.removeAttribute("hidden");
			el.removeAttribute("disabled");
		} else {
			el.setAttribute("hidden", "");
			el.setAttribute("disabled", "");
		}
		el.dispatchEvent(new CustomEvent("af-watcher", { bubbles: true, detail: { show: show } }));
	}

	// public connectedCallback(): void {
	// 	console.log("connected");
	// }

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("action-form", ActionForm);
