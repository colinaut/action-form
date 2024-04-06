import ActionFormStep from "./af-step";
export default class ActionForm extends HTMLElement {
	constructor() {
		super();
		document.documentElement.classList.add("js");

		if (this.form) {
			/*
			 * Set novalidate on the form if novalidate set on action-form.
			 * This way novalidate is only set if javascript is loaded and form-action is defined.
			 * We want to allow falling back to browser validation if javascript is not loaded.
			 */
			if (this.hasAttribute("novalidate")) {
				this.form.setAttribute("novalidate", "");
			}

			this.setAttribute("loaded", "");

			this.enhanceFieldsets();

			this.steps.forEach((step, i) => {
				// need to add as attribute rather than set directly as the setter is not called until element is loaded
				if (i === 0) step.setAttribute("active", ""); // active = i === 0;
			});

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
		}
	}

	get steps(): NodeListOf<ActionFormStep> {
		return this.querySelectorAll("af-step:not([hidden])") as NodeListOf<ActionFormStep>;
	}

	public form = this.querySelector("form");
	public stepIndex: number = 0; // current step
	public fieldsets: NodeListOf<HTMLFieldSetElement> = this.querySelectorAll("fieldset, af-step");
	public formElements: NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = this.querySelectorAll("input, select, textarea");
	private enhanceFieldsets() {
		this.fieldsets.forEach((fieldset) => {
			const watch = fieldset.dataset.watch;
			const watchValue = fieldset.dataset.value;
			const watchRegex = fieldset.dataset.regex;
			if (watch) {
				// Get watched fields in form based on name
				const fields = Array.from(this.formElements).filter((field) => field.name.toLowerCase() === watch.toLowerCase());

				if (fields.length === 0) return;
				console.log(fieldset.name, "watching", watch, fields);

				fields.forEach((field) => {
					field.addEventListener("change", () => {
						if (!watchValue && !watchRegex) {
							// if there is no value or regex to check then show the fieldset based on validity
							console.log("change no value", field.value);
							this.show(fieldset, field.checkValidity());
						} else if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
							// if is an input of type radio or checkbox then make sure the value matches and show based on checkbox status
							console.log("change checkbox", field.value);
							if (this.checkMatches(field.value, watchValue, watchRegex)) {
								this.show(fieldset, field.checked);
								if (fieldset.matches("af-step")) this.dispatchEvent(new CustomEvent("af-step"));
							}
						} else {
							// else show based on value
							console.log("change else", field.value);
							this.show(fieldset, this.checkMatches(field.value, watchValue, watchRegex));
						}
						// this.show(field.value, regex);
					});
				});
			}
		});
	}

	private checkMatches(value: string, watchValue: string = "", watchRegex: string | undefined): boolean {
		if (watchRegex) {
			const regex = new RegExp(watchRegex);
			// if regex matches then return true
			return regex.test(value);
		} else {
			// if values match then return true
			return watchValue === value;
		}
	}

	private show(fieldset: HTMLFieldSetElement, show: boolean): void {
		if (show) {
			fieldset.removeAttribute("hidden");
			fieldset.removeAttribute("disabled");
		} else {
			fieldset.setAttribute("hidden", "");
			fieldset.setAttribute("disabled", "");
		}
	}

	public connectedCallback(): void {
		console.log("connected");
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("action-form", ActionForm);
