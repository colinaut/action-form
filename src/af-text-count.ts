export default class ActionFormTextCount extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const targetId = this.getAttribute("for");
		const input = targetId ? document.getElementById(targetId) : this.closest("label")?.querySelector(`input, textarea`);
		if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
			input.addEventListener("input", () => {
				this.textContent = input.value.length.toString();
			});
		}
	}
}

customElements.define("af-text-count", ActionFormTextCount);
