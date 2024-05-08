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
