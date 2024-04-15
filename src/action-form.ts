import type ActionFormStep from "./af-step";
import type ActionFormError from "./af-error";
import type ActionFormGroupCount from "./af-group-count";
import type { ActionFormStepEvent } from "./types";

type FormField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isField(el: Element): el is FormField {
	return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}

export default class ActionForm extends HTMLElement {
	public steps = this.querySelectorAll("af-step") as NodeListOf<ActionFormStep>;
	public stepIndex: number = 0; // current step
	public stepButtons!: string[];

	private watchers: { el: HTMLElement; if: boolean; text: boolean; name: string; value?: string; notValue?: string; regex?: RegExp }[] = [];

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

			// Get step buttons
			this.stepButtons = this.getAttribute("step-buttons")?.split(",") || [];
			if (this.stepButtons.length !== 3) {
				this.stepButtons = ["Prev", "Next", "Submit"];
			}

			this.addEventListener("af-step", (event) => {
				const customEvent = event as CustomEvent<{ step?: number; direction?: string }>;
				let stepIndex = this.stepIndex;
				if (typeof customEvent.detail?.step === "number") {
					stepIndex = customEvent.detail.step;
				} else if (customEvent.detail?.direction === this.stepButtons[1]) {
					stepIndex++;
				} else if (customEvent.detail?.direction === this.stepButtons[0]) {
					stepIndex--;
				}
				// make sure stepIndex is within bounds
				stepIndex = Math.max(0, Math.min(stepIndex, this.steps.length - 1));
				// set this.stepIndex
				this.stepIndex = stepIndex;
				// set active based on index
				let shownIndex = 0;

				Array.from(this.steps).forEach((step) => {
					// Set data-index Based on visibility of the step
					if (step.style.display !== "none") {
						step.dataset.index = String(shownIndex);
						shownIndex++;
					} else {
						step.dataset.index = "";
					}
					// set active based on index

					if (shownIndex - 1 === stepIndex) {
						step.classList.add("active");
						this.stepIndex = stepIndex;
					} else {
						step.classList.remove("active");
					}
				});
			});

			// Find all fields that require validation error messages
			if (this.hasAttribute("auto-error")) {
				const validationFields = this.querySelectorAll("[required],[pattern],[type=phone],[type=email],[type=url]") as NodeListOf<FormField>;
				validationFields.forEach((field) => {
					let id = field.id || "";
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
							id = `${field.name || field.tagName.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
							field.setAttribute("id", id);
						}
						error.setAttribute("for", id);
						// add af-error after field
						field.after(error);
						console.log(`Added Error Message for ${field.tagName.toLowerCase()}[${field.name}] #${id}`);
					}
				});
				const fieldsetGroups = this.querySelectorAll("fieldset[data-group]") as NodeListOf<HTMLFieldSetElement>;

				fieldsetGroups.forEach((fieldset) => {
					let id = fieldset.id || "";
					const errorById = fieldset.querySelector(`af-error[for="${id}"]`);
					if (!errorById) {
						if (!id) {
							id = `${fieldset.name || "fieldset"}-${Math.random().toString(36).substring(2, 9)}`;
							fieldset.setAttribute("id", id);
						}
						const error = document.createElement("af-error");

						error.setAttribute("for", id);
						error.textContent = fieldset.dataset.error || "";
						fieldset.append(error);
					}
					const groupCount = fieldset.querySelector(`af-group-count`) as ActionFormGroupCount | null;
					if (!groupCount) {
						const groupCount = document.createElement("af-group-count");
						groupCount.style.display = "none";
						fieldset.append(groupCount);
					}
				});
			}

			this.enhanceElements();

			/* -------------------------------------------------------------------------- */
			/*                                Add Listeners                               */
			/* -------------------------------------------------------------------------- */

			this.addEventListener("change", (event) => {
				const target = event.target;
				if (target instanceof HTMLElement && target.matches("input, textarea, select, af-group-count")) {
					const field = target as FormField | ActionFormGroupCount;

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

					// check if field has a name match in the watcher array
					const watchers = this.watchers.filter((w) => w.name === field.name);
					if (watchers.length > 0) {
						this.checkWatchers(watchers);
					}

					// if store attribute is set then store the values in local storage
					if (this.id && this.hasAttribute("store")) {
						const ls = localStorage.getItem(`action-form-${this.id}`) || "{}";
						if (ls && field.name) {
							const values = JSON.parse(ls);
							// if element is a checkbox or radio than store as array of checked values
							if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
								// create temporary array
								const tempArray = values[field.name] instanceof Array ? values[field.name] : [];
								// update array based on checked value
								if (field.checked) {
									tempArray.push(field.value);
								} else {
									tempArray.splice(tempArray.indexOf(field.value), 1);
								}
								values[field.name] = tempArray;
							} else {
								values[field.name] = field.value;
							}
							// if
							localStorage.setItem(`action-form-${this.id}`, JSON.stringify(values));
						}
					}
				}
			});

			this.addEventListener("reset", () => {
				// Remove store
				if (this.hasAttribute("store")) {
					localStorage.removeItem(`action-form-${this.id}`);
				}
				// Find all invalid af-errors and hide them
				const invalidErrors = form.querySelectorAll("af-error[invalid]") as NodeListOf<ActionFormError>;
				invalidErrors.forEach((error) => {
					error.showError(false);
				});

				// Move back to step 0
				this.dispatchEvent(new CustomEvent("af-step", { detail: { step: 0 } }));
			});

			this.addEventListener("submit", (e) => {
				// Validate form before submitting
				const formValid = form.checkValidity();
				if (!formValid) {
					e.preventDefault();
					console.error("Form validation failed");
					// find first invalid field or invalid af-group-count
					const invalidField = form.querySelector("input:invalid, select:invalid, textarea:invalid, af-group-count[validity=false]") as
						| FormField
						| ActionFormGroupCount
						| null;
					if (invalidField) {
						const parentStep = invalidField.closest("af-step") as null | ActionFormStep;
						// check if that field is a child of an af-step element
						if (parentStep) {
							// move to that step
							this.dispatchEvent(new CustomEvent<ActionFormStepEvent>("af-step", { detail: { step: Number(parentStep.dataset.index) } }));
						}

						console.log("invalidField", invalidField);
						if (invalidField.matches("af-group-count")) {
							const otherField = invalidField.closest("fieldset")?.querySelector("input, select, textarea") as FormField | null;
							otherField?.focus();
						} else {
							invalidField.focus();
						}
						invalidField.dispatchEvent(new Event("change", { bubbles: true }));
					}
				} else {
					// If form is valid then erase the stored values
					if (this.hasAttribute("store")) {
						localStorage.removeItem(`action-form-${this.id}`);
					}
				}
			});
		}
	}

	private enhanceElements() {
		// find all elements with stored values and set value
		const getStoreElements = this.querySelectorAll("[data-get-store]") as NodeListOf<HTMLElement>;
		getStoreElements.forEach((el) => {
			const stored = el.dataset.getStore;
			if (!stored) return;
			if (isField(el)) {
				// split stored by periods
				const parts = stored.split(".");
				const ls = localStorage.getItem(parts[0]);
				if (ls) {
					if (parts.length > 1) {
						const value = JSON.parse(ls)[parts[1]];
						if (value) {
							el.value = String(value);
						}
					} else {
						el.value = ls;
					}
				}
			}
		});

		// If store then update all fields (except type="hidden") with stored values
		if (this.id && this.hasAttribute("store")) {
			const ls = localStorage.getItem(`action-form-${this.id}`);
			if (ls) {
				const values = JSON.parse(ls);
				Object.keys(values).forEach((key) => {
					const fields = this.querySelectorAll(`[name="${key}"]`);
					fields.forEach((el) => {
						if (isField(el) && !el.matches("[type=hidden]")) {
							// if this is a checkbox or radio button
							if (el instanceof HTMLInputElement && ["checkbox", "radio"].includes(el.type) && values[key] instanceof Array) {
								// set checked based on value in array
								el.checked = values[key].includes(el.value);
							} else {
								el.value = String(values[key]);
							}
						}
					});
				});
			}
		}

		// find all watchers and create watcher array
		const watchers = this.querySelectorAll("[data-if],[data-text]") as NodeListOf<HTMLElement>;

		watchers.forEach((el) => {
			const watch = el.dataset.if || el.dataset.text;
			const value = el.dataset.ifValue;
			const notValue = el.dataset.ifNotValue;
			const regexStr = el.dataset.ifRegex;
			// if neither watch nor value is set, assume that any value is valid. RegExp /./ tests for any value
			const regex: RegExp | undefined = regexStr ? new RegExp(regexStr) : undefined;
			if (watch) {
				this.watchers.push({ name: watch, if: !!el.dataset.if, text: !!el.dataset.text, value, notValue, regex, el: el });
			}
		});

		// set Watchers from the start
		this.checkWatchers();
	}

	public checkWatchers(watchers = this.watchers) {
		// Get FormData for watchers
		const form = this.querySelector("form");
		if (!form || watchers.length === 0) return;
		const formData = new FormData(form);
		// Loop through watchers
		watchers.forEach((watcher) => {
			const values = formData.getAll(watcher.name);
			// console.log("watchers values", values, watcher);

			// Update textContent
			if (watcher.text) {
				watcher.el.textContent = values.join(", ");
			}

			// Update display
			if (watcher.if) {
				let valid = values.some((value) => {
					// typeof value === "string" is to ignore formData files
					if (typeof value === "string" && (watcher.value || watcher.regex)) {
						// if is is a string (rather than a File) there is a value or regex to check then check for that
						return value === watcher.value || (watcher.regex && watcher.regex.test(value));
					}
					// if value has no value return false; otherwise true
					return !!value;
				});
				// if valid and there is a notValue then check for that as well
				if (watcher.notValue && values.length !== 0 && valid) {
					valid = values.every((value) => value !== watcher.notValue);
				}
				// console.log("watcher", watcher.name, valid);
				this.show(watcher.el, valid);
				// if this is af-step then trigger event to update progress bar since there is a change in the number of steps
				if (watcher.el.matches("af-step")) this.dispatchEvent(new CustomEvent("af-step"));
			}
		});
	}

	private show(el: HTMLElement, show: boolean): void {
		if (show) {
			el.style.display = "";
			el.removeAttribute("disabled");
		} else {
			el.style.display = "none";
			el.setAttribute("disabled", "");
		}
		el.dispatchEvent(new Event("change", { bubbles: true }));
	}

	// public connectedCallback(): void {
	// 	console.log("connected");
	// }

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("action-form", ActionForm);
