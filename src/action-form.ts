export default class ActionForm extends HTMLElement {
	constructor() {
		super();
	}

	public connectedCallback(): void {
		console.log("connected");
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }
}
customElements.define("action-form", ActionForm);
