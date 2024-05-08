import type ActionFormFieldGroup from "./af-field-group";

export default class ActionFormFormGroupCount extends HTMLElement {
	public afFieldGroup = this.closest("af-field-group") as ActionFormFieldGroup | null;

	constructor() {
		super();
		this.render();
		this.afFieldGroup?.addEventListener("change", () => this.render());
	}
	get value() {
		if (this.afFieldGroup) {
			return this.afFieldGroup.value;
		}
		return 0;
	}

	render() {
		this.innerHTML = `${this.value.toString()}`;
	}
}