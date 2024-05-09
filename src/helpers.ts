import type { HTMLFormField, HTMLFormFieldOrGroup, HTMLFormFieldOrFieldset } from "./types";
import ActionFormFieldGroup from "./action-form";

export function randomId(prefix = ""): string {
	return `${prefix ? prefix + "-" : ""}${Math.random().toString(36).substring(2, 9)}`;
}

export function isField(el: Element | null | undefined): el is HTMLFormField {
	return !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement);
}

export function isFieldOrGroup(el: Element | null | undefined): el is HTMLFormFieldOrGroup {
	return !!el && (isField(el) || el instanceof ActionFormFieldGroup);
}

export function isHTMLFormElement(el: Element | null | undefined): el is HTMLFormFieldOrFieldset {
	return !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || el instanceof HTMLFieldSetElement);
}

export function isCheckboxOrRadio(el: HTMLElement): boolean {
	return el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio");
}

export function getValueBasedOnType(el: HTMLElement): string {
	if (el instanceof HTMLInputElement)
		// for checkbox or radio button only return value if checked
		switch (el.type) {
			case "checkbox":
			case "radio":
				return el.checked ? el.value : "";
			default:
				return el.value;
		}
	// @ts-expect-error this is fine as resorts to empty string if el.value is undefined
	return el.value || "";
}
