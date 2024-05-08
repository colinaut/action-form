export default class ActionFormTextCount extends HTMLElement {
	private getNumber(field: HTMLInputElement | HTMLTextAreaElement) {
		const maxlength = Number(field.getAttribute("maxlength") || Infinity);
		this.textContent = String(this.hasAttribute("remaining") ? maxlength - field.value.length : field.value.length);
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
