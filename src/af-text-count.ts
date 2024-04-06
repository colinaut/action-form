export default class ActionFormTextCount extends HTMLElement {
	constructor() {
		super();
	}

	private getNumber(field: HTMLInputElement | HTMLTextAreaElement) {
		const maxlength = field.getAttribute("maxlength");
		let text!: string;
		if (maxlength && this.hasAttribute("remaining")) {
			text = String(Number(maxlength) - field.value.length);
		} else {
			text = String(field.value.length);
		}
		this.textContent = text;
	}

	connectedCallback() {
		const targetId = this.getAttribute("for");
		const input = targetId ? document.getElementById(targetId) : this.closest("label")?.querySelector(`input, textarea`);
		if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
			this.getNumber(input);
			input.addEventListener("input", () => this.getNumber(input));
		}
	}
}

customElements.define("af-text-count", ActionFormTextCount);
