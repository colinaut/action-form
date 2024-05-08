import { createSignal } from "./signals";

export function formSignals(form: HTMLFormElement) {
	const map = new Map<string, { get: () => FormDataEntryValue[]; set: (value: FormDataEntryValue[]) => void }>();

	// Save form data
	const [getForm, setFormData] = createSignal<Record<string, FormDataEntryValue[]>>(formDataObject());

	function setForm() {
		setFormData(formDataObject());
	}

	function set(key: string) {
		const values = getValues(key);
		if (map.has(key)) {
			// @ts-expect-error already checked if key is exists
			map.get(key).set(values);
		} else {
			const [get, set] = createSignal(values);
			map.set(key, { get, set });
		}
	}

	function get(key: string) {
		return map.get(key)?.get();
	}

	function getValues(name: string) {
		return new FormData(form).getAll(name);
	}

	function formDataObject() {
		const keys = new FormData(form).keys();
		const tempObject: Record<string, FormDataEntryValue[]> = {};
		Array.from(keys).forEach((key) => {
			tempObject[key] = getValues(key);
		});
		return tempObject;
	}

	return {
		set,
		get,
		getForm,
		setForm,
		formDataObject,
	};
}
