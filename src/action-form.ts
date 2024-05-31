// Child components
// all child elements are defined at the bottom
import ActionFormStep from "./af-step";
import ActionFormProgress from "./af-progress";
import ActionFormError from "./af-error";
import ActionFormFieldGroup from "./af-field-group";
import ActionFormFormGroupCount from "./af-field-group-count"; // alias for ActionFormFieldGroupCount
import ActionFormPreview from "./af-preview";
import ActionFormTextCount from "./af-text-count";
// other imports
import type { HTMLFormField, HTMLFormFieldOrGroup } from "./types";
import { formSignals } from "./reactiveFormData";
import { randomId, isField, isFieldOrGroup, getValueBasedOnType } from "./helpers";
import { stepSignals } from "./reactiveStepData";
import { createEffect } from "./signals";

export default class ActionForm extends HTMLElement {
	public form = (this.querySelector("form") as HTMLFormElement) || null;

	/* ----------------------------- Create storeKey ---------------------------- */
	// Store key is based on the store attribute or if not defined then ids or random values
	public store: string | null = this.getAttribute("store");

	/* -------- Persisted fields are ones that are maintained thru reset -------- */
	private persistedFields: HTMLFormField[] = [];

	/* --------------------------- Reactive form data --------------------------- */
	// used for error triggers and data-if and data-text
	public data = formSignals(this.form);

	/* ----------------------------- Reactive steps ----------------------------- */
	public steps = stepSignals(this.querySelectorAll("af-step") as NodeListOf<ActionFormStep>);

	// export for use by others
	public createEffect = createEffect;

	constructor() {
		super();

		const form = this.form;
		if (form) {
			/*
			 * Set novalidate on the form if novalidate set on action-form.
			 * This way novalidate is only set if javascript is loaded and form-action is defined.
			 * We want to allow falling back to browser validation if javascript is not loaded.
			 */
			if (this.hasAttribute("novalidate")) {
				form.setAttribute("novalidate", "");
			}

			/* -------------------------------------------------------------------------- */
			/*                                Local Storage                               */
			/* -------------------------------------------------------------------------- */

			/* --------------------- Make array of persisted fields --------------------- */
			this.persistedFields = Array.from(this.querySelectorAll("[data-persist]")).filter((el) => isField(el)) as HTMLFormField[];

			/* ----------------- Restore form values if store is enabled ---------------- */
			if (this.store) {
				this.restoreFieldValues();
			}

			/* ------------------- Listen for storage events to update ------------------ */
			window.addEventListener("storage", (event) => {
				this.log("storage", event, event.key);

				if (this.hasAttribute("store-listen") && event.key === this.store) {
					this.restoreFieldValues();
				}
			});

			/* -------------------------------------------------------------------------- */
			/*                               Set up af-steps                              */
			/* -------------------------------------------------------------------------- */

			/* --------- create effect to set the active step and the step index -------- */

			createEffect(() => {
				const currentStep = this.steps.currentStep();
				this.steps.all.forEach((step) => {
					if (step === currentStep) {
						step.classList.add("active");
					} else {
						step.classList.remove("active");
					}
				});
			});

			/* -------------------------------------------------------------------------- */
			/*              Add ids as needed to all fieldsets and fields                 */
			/* -------------------------------------------------------------------------- */

			// Create array of all fieldGroups and fields that require validation
			const fieldGroups = Array.from(this.querySelectorAll("af-field-group")) as Array<ActionFormFieldGroup>;
			const validationFields = Array.from(this.querySelectorAll("[required],[pattern],[type=phone],[type=email],[type=url],[minlength],[maxlength]")) as Array<HTMLFormField>;

			[...fieldGroups, ...validationFields].forEach((el) => {
				if (!el.id) {
					el.id = randomId(`${el.tagName.toLowerCase()}${el.name ? `-${el.name}` : ""}`);
				}
			});

			/* -------------------------------------------------------------------------- */
			/*      If auto-error, add af-error to all fields that require validation     */
			/* -------------------------------------------------------------------------- */

			// Find all fields that require validation error messages
			if (this.hasAttribute("auto-error")) {
				validationFields.forEach((field) => {
					// ignore if field has aria-describedby attribute as that means it already has an error message
					if (field.hasAttribute("aria-describedby")) return;

					// Check if there is an af-error attribute for the field, either by id or withing parent label
					const errorById = form.querySelector(`af-error[for="${field.id}"]`);
					const errorByProximity = field.closest("label")?.querySelector(`af-error`);
					if (!errorById && !errorByProximity) {
						field.after(this.createAfError(field));
						// NOTE: the af-error component will add it's own id and the aria-describedby attribute
						this.log(`Added Error Message for ${field.id}`);
					}
				});
				// Find all fieldsets with data-group that don't have an aria-describedby
				fieldGroups.forEach((fieldGroup) => {
					// ignore if fieldset has aria-describedby attribute as that means it already has an error message
					if (fieldGroup.hasAttribute("aria-describedby")) return;

					// search for any matching af-error messages
					const afError = fieldGroup.querySelector(`af-error[for="${fieldGroup.id}"]`);
					// if no error message found, create one
					if (!afError) {
						fieldGroup.append(this.createAfError(fieldGroup));
						this.log(`Added Error Message for ${fieldGroup.id}`);
					}
				});
			}

			/* -------------------------------------------------------------------------- */
			/*                      Reactive form state management                        */
			/* -------------------------------------------------------------------------- */

			/* --- Set up reactive form state management with all field names as keys --- */

			// 1. Create keys from names of all field elements
			const keys = new Set(
				[...fieldGroups, ...validationFields]
					.map((el) => {
						return el.getAttribute("name") || "";
					})
					.filter((name) => name)
			);

			// 2. Set up data with all field element names
			keys.forEach((key) => {
				this.data.set(key);
			});

			/* -------------- Change event listener which triggers data.set ------------- */

			form.addEventListener("change", (e) => {
				// trigger any events mapped to the form
				const target = e.target;
				if (target instanceof HTMLElement) {
					// @ts-expect-error this is an if on purpose
					if (target.name) {
						// @ts-expect-error checking for name
						// 1. trigger any events mapped to name of the field
						this.data.set(target.name);
						// 2. trigger any general events (mapped to the form element)
						this.data.setForm();
					}
					// 3. Store the data if store is set
					if (this.store) localStorage.setItem(this.store, JSON.stringify(this.data.formDataObject()));
				}
			});

			/* -------------------------------------------------------------------------- */
			/*    Add effect to all fields and af-field-group to check toggle errors      */
			/* -------------------------------------------------------------------------- */

			[...validationFields, ...fieldGroups].forEach((el) => {
				// create effect to check all fields that require validation to toggle errors
				createEffect(() => {
					const name = el.getAttribute("name");
					if (name) this.data.get(name);
					this.toggleError(el);
				});
			});

			/* -------------------------------------------------------------------------- */
			/*                           Enhance normal elements                          */
			/* -------------------------------------------------------------------------- */
			/* ---------------------- Set up data-if and data-text ---------------------- */
			const enhancedElements = this.querySelectorAll("[data-if],[data-text]");

			enhancedElements.forEach((el) => {
				if (el instanceof HTMLElement) {
					const dataIf = el.dataset.if;
					const dataText = el.dataset.text;
					// 1. create effect for data-if and data-text
					createEffect(() => {
						this.log("🫨 create effect: action-form: enhance elements");
						if (dataIf) {
							const fieldValues = this.data.get(dataIf);
							if (fieldValues) {
								const value = el.dataset.ifValue;
								const notValue = el.dataset.ifNotValue;
								const regexStr = el.dataset.ifRegex;
								const regex: RegExp | undefined = regexStr ? new RegExp(regexStr) : undefined;
								if (value || notValue || regex) {
									// matches checks if any of the values are equal to the ifValue or if it matches via regex to the ifRegex if none of the values equal the notValue
									const matches =
										fieldValues.some((d) => typeof d === "string" && ((value && d === value) || (regex && regex.test(d)))) &&
										fieldValues.every((d) => typeof d === "string" && (!notValue || d !== notValue));
									// this.log("matches", watch, value, matches, data);
									this.show(el, matches);
								} else {
									// if there is no ifValue, ifNotValue or ifRegex then just show the element as long as there is at least some value
									this.show(el, !!fieldValues.some((d) => !!d));
								}
							}
						}
						if (dataText) {
							const fieldValues = this.data.get(dataText);
							if (fieldValues) {
								el.textContent = fieldValues?.toString();
							}
						}
					});
				}
			});

			/* -------------------------------------------------------------------------- */
			/*                            Override reset button                           */
			/* -------------------------------------------------------------------------- */

			const resetButtons = this.querySelectorAll("button[type=reset]");
			// There is a specific order to resetting that needs done so as to not reset persisted fields
			resetButtons.forEach((resetBtn) => {
				resetBtn.addEventListener("click", (event) => {
					event.preventDefault();
					// store the persisted fields values (works with out localStorage being enabled)
					this.persistedFields.forEach((persistField) => (isField(persistField) ? (persistField.dataset.persist = persistField.value) : null));
					// reset the form
					this.form.reset();
					// restore the persisted fields
					this.persistedFields.forEach((persistField) =>
						isField(persistField) && typeof persistField.dataset.persist === "string" ? (persistField.value = persistField.dataset.persist) : null
					);
					// restore the form to initial state; resetting store to only persisted fields and setting step to 0
					this.restoreForm();
				});
			});

			/* -------------------------------------------------------------------------- */
			/*                       Validate form before submitting                      */
			/* -------------------------------------------------------------------------- */
			this.addEventListener("submit", (e) => {
				// Validate form before submitting
				const formValid = form.checkValidity();
				if (!formValid) {
					e.preventDefault();
					const invalidField = this.form.querySelector(":invalid:not(fieldset)");
					// if there is an invalid field, focus on it and highlight the error by triggering the change event
					if (invalidField && invalidField instanceof HTMLElement) {
						// find parent af-step element
						const parentStep = invalidField.closest("af-step");
						// find index of parent step
						// const stepIndex: number = 0;
						const stepIndex = this.steps.getVisible().findIndex((step) => step === parentStep);
						// set step index
						if (stepIndex !== -1) {
							// got to step index
							this.steps.set(stepIndex);
							// trigger next which will find error
							this.steps.next();
						} else {
							throw new Error(`Invalid field: ${invalidField.id}`);
						}
					}
				} else {
					// If form is valid then erase the stored values except for persisted fields
					this.restoreForm();
				}
			});
		}
	}

	private createAfError(el: ActionFormFieldGroup | HTMLFormField): ActionFormError {
		const afError = document.createElement("af-error") as ActionFormError;
		afError.setAttribute("for", el.id);
		afError.textContent = el.dataset.error || "";
		if (el.dataset.errorPattern) {
			const pattern = document.createElement("span");
			pattern.setAttribute("slot", "pattern");
			pattern.textContent = el.dataset.errorPattern;
			afError.append(pattern);
		}
		return afError;
	}

	private toggleError(el: HTMLFormFieldOrGroup) {
		// 1. find error message by id in aria-describedby
		// this should work regardless if af-error is added manually or automatically.
		// It can also work for other manually added errors as long as the id corresponds to an element
		const errorMsg = document.getElementById(el.getAttribute("aria-describedby") || "");
		// 2. if the error is there and the el has checkValidity function (any form field or custom field element with the function)
		if (errorMsg && typeof el.checkValidity === "function") {
			// 3. check the validity of the element
			const valid = el.checkValidity();
			this.log("errorMsg.id, valid", errorMsg.id, valid);
			if (valid) {
				// 3a. if valid reset the error message to hidden and remove aria-invalid on the field
				this.resetError(el, errorMsg);
			} else {
				// 3b. otherwise activate the error message and set aria-invalid to true on the field
				errorMsg.style.visibility = "visible";
				el.setAttribute("aria-invalid", "true");
				// 3c. if the element has no value then assume the error is that it is required.
				// Otherwise set data-invalid to pattern as it is invalid due to pattern match
				// data-invalid tells the element which error message to show
				errorMsg.dataset.invalid = getValueBasedOnType(el) === "" ? "required" : "pattern";
			}
		}
	}

	private resetError(el: HTMLFormField | ActionFormFieldGroup, errorMsg: HTMLElement) {
		el.removeAttribute("aria-invalid");
		errorMsg.style.visibility = "hidden";
		errorMsg.removeAttribute("data-invalid");
	}

	private restoreForm() {
		// Remove store except for persisted fields
		this.resetStore();

		// Reset all elements and their error messages
		const erroredElements = this.querySelectorAll("[aria-invalid]");
		erroredElements.forEach((el) => {
			if (isFieldOrGroup(el)) {
				const errorMsg = document.getElementById(el.getAttribute("aria-describedby") || "");
				if (errorMsg) this.resetError(el, errorMsg);
			}
		});

		// Move back to step 0
		// this.step.set(0);
	}

	private resetStore() {
		if (!this.store) return;
		// Remove store except for persisted fields
		const ls = localStorage.getItem(this.store);
		// If there are persisted field then maintain them
		if (ls && this.persistedFields.length > 0) {
			const values = JSON.parse(ls) as Record<string, string | string[]>;
			Object.keys(values).forEach((key) => {
				if (this.persistedFields.every((field) => field.name !== key)) {
					delete values[key];
				}
			});
			// set store with only persisted fields
			localStorage.setItem(this.store, JSON.stringify(values));
		} else {
			localStorage.removeItem(this.store);
		}
	}

	private restoreFieldValues() {
		if (!this.store) return;
		const ls = localStorage.getItem(this.store);
		if (!ls || ls === "undefined") return;
		const values = JSON.parse(ls) as Record<string, string | string[]>;
		if (typeof values !== "object") return;
		// Cycle through fields based on name
		Object.keys(values).forEach((key) => {
			const fields = this.querySelectorAll(`[name="${key}"]`);
			fields.forEach((el) => {
				if (isField(el) && !el.matches("[type=hidden]")) {
					// if this is a checkbox or radio button
					if (el instanceof HTMLInputElement && ["checkbox", "radio"].includes(el.type)) {
						// set checked based on value in array
						el.checked = values[key].includes(el.value);
					} else {
						// set value
						el.value = String(values[key]);
					}
				}
			});
		});
	}

	private show(el: HTMLElement, show: boolean): void {
		// this.log("show", el, show);
		if (show) {
			el.style.display = "";
			el.removeAttribute("disabled");
		} else {
			el.style.display = "none";
			el.setAttribute("disabled", "");
		}
		el.dispatchEvent(new Event("change", { bubbles: true }));
		if (el.matches("af-step")) this.steps.updateSteps();
		if (el.matches("fieldset")) {
			// if this is a fieldset, find all child fields to trigger effects (error handling, data-if, data-text)
			const fields = el.querySelectorAll("input, select, textarea, af-field-group") as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
			fields.forEach((field) => {
				// only trigger effects if it has a value
				if (this.data.getValues(field.name).some((value) => value)) this.data.set(field.name);
			});
		}
	}

	// eslint-disable-next-line
	private log(...args: any[]): void {
		// eslint-disable-next-line no-console
		if (this.hasAttribute("debug")) console.log(...args);
	}

	// public connectedCallback(): void {
	// 	this.log("connected");
	// }

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	this.log("changed", name, oldValue, newValue);
	// }
}

customElements.define("action-form", ActionForm);

// Define imported elements that are required by this component
customElements.define("af-error", ActionFormError);
customElements.define("af-step", ActionFormStep);
customElements.define("af-progress", ActionFormProgress);
customElements.define("af-field-group", ActionFormFieldGroup);
customElements.define("af-field-group-count", ActionFormFormGroupCount);
customElements.define("af-text-count", ActionFormTextCount);
customElements.define("af-preview", ActionFormPreview);
