import type ActionFormStep from "./af-step";
import type ActionFormError from "./af-error";
import type ActionFormGroupCount from "./af-group-count";

export default class ActionForm extends HTMLElement {
	public stepIndex: number = 0; // current step

	private watchers: { el: HTMLElement; name: string; value?: string; regex?: RegExp }[] = [];

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

			this.steps.forEach((step, i) => {
				step.setAttribute("index", String(i)); // step.index = i;
				if (i === 0) {
					step.classList.add("first", "active");
				}
				if (i === this.steps.length - 1) {
					step.classList.add("last");
				}
			});

			// console.log("validationFields", validationFields.length);

			this.addEventListener("af-step", (event) => {
				const customEvent = event as CustomEvent<{ step?: number; direction?: "next" | "prev" }>;
				console.log("af-step", customEvent.detail?.step);
				let stepIndex = this.stepIndex;
				if (typeof customEvent.detail?.step === "number") {
					stepIndex = customEvent.detail.step;
				} else if (customEvent.detail?.direction === "next") {
					stepIndex++;
				} else if (customEvent.detail?.direction === "prev") {
					stepIndex--;
				}
				// make sure stepIndex is within bounds
				stepIndex = Math.max(0, Math.min(stepIndex, this.steps.length - 1));
				// set this.stepIndex
				this.stepIndex = stepIndex;
				// set active based on index
				Array.from(this.steps)
					.filter((step) => !step.hidden)
					.forEach((step, i) => {
						// set active based on index
						if (i === this.stepIndex) {
							step.classList.add("active");
						} else {
							step.classList.remove("active");
						}
					});
			});

			// Find all fields that require validation error messages
			if (this.hasAttribute("auto-error")) {
				const validationFields = this.querySelectorAll("[required],[pattern],[type=phone],[type=email],[type=url]") as NodeListOf<
					HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
				>;
				validationFields.forEach((field) => {
					let id = field.getAttribute("id") || "";
					// Check if there is an af-error attribute for the field, either by id or withing parent label
					const errorById = form.querySelector(`af-error[for="${id}"]`);
					const errorByProximity = field.closest("label")?.querySelector(`af-error`);
					if (!errorById && !errorByProximity) {
						// if not then make one
						const error = document.createElement("af-error");
						// Use data-error for content
						error.textContent = field.dataset.error || "";
						// If there is no id attribute on field then make one just to make things easier
						if (!id) {
							id = `${field.id || field.name || field.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
							field.setAttribute("id", id);
						}
						error.setAttribute("for", id);
						// add af-error after field
						field.after(error);
						console.log(`Added Error Message for ${field.tagName.toLowerCase()}[${field.name}] #${id}`);
					}
				});
			}

			this.enhanceElements();

			this.addEventListener("change", (event) => {
				const target = event.target;
				if (target instanceof HTMLElement && target.matches("input, textarea, select, af-group-count")) {
					const field = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | ActionFormGroupCount;

					// if target has an error message, show/hide it
					const errorId = field.getAttribute("aria-describedby");
					if (errorId) {
						const errorMsg = document.getElementById(errorId);
						if (errorMsg?.matches("af-error")) {
							const afError = errorMsg as ActionFormError;
							const valid = field.checkValidity();
							afError.showError(!valid);
							// console.log("target", target, errorId, valid);
						}
					}
				}

				this.checkWatchers();
			});
		}
	}

	public checkWatchers() {
		// Get FormData for watchers
		const form = this.querySelector("form");
		if (!form || this.watchers.length === 0) return;
		const formData = new FormData(form);
		// Loop through watchers
		this.watchers.forEach((watcher) => {
			const values = formData.getAll(watcher.name);
			// console.log("watchers values", values, watcher);

			// typeof value === "string" is to ignore formData files
			const valid = values.some((value) => typeof value === "string" && (value === watcher.value || (watcher.regex && watcher.regex.test(value))));
			// if it is hidden and it is invalid, or vice versa, that means the state is fine so return.
			if (watcher.el.hasAttribute("hidden") !== valid) return;
			// console.log("watcher", watcher.name, valid);
			// Else show/hide it
			this.show(watcher.el, valid);
			// if this is af-step then trigger event to update progress bar since there is a change in the number of steps
			if (watcher.el.matches("af-step")) this.dispatchEvent(new CustomEvent("af-step"));
		});
	}

	get steps(): NodeListOf<ActionFormStep> {
		return this.querySelectorAll("af-step") as NodeListOf<ActionFormStep>;
	}

	private enhanceElements() {
		const elements = this.querySelectorAll("[data-watch]") as NodeListOf<HTMLElement>;
		elements.forEach((el) => {
			const watch = el.dataset.watch;
			const value = el.dataset.value;
			const regexStr = el.dataset.regex;
			// if neither watch nor value is set, assume that any value is valid. RegExp /./ tests for any value
			const regex: RegExp | undefined = regexStr ? new RegExp(regexStr) : !regexStr && !value ? /./ : undefined;
			if (watch) {
				this.watchers.push({ name: watch, value, regex, el: el });
			}
		});

		// set Watchers from the start
		this.checkWatchers();
	}

	private show(el: HTMLElement, show: boolean): void {
		if (show) {
			el.removeAttribute("hidden");
			el.removeAttribute("disabled");
		} else {
			el.setAttribute("hidden", "");
			el.setAttribute("disabled", "");
		}
		// TODO: is this needed?
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
