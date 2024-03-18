export default class FormProgress extends HTMLElement {
	constructor() {
		super();
		this.render();
		const form = this.closest("form");
		if (form) {
			form.addEventListener("step", () => {
				this.render();
			});
		}

		// TODO: add event listener to allow user switch to any step that is valid (usually previous step)
	}

	public connectedCallback(): void {
		console.log("connected");
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }

	private render() {
		const form = this.closest("form");
		if (!form) return;
		const steps = form.querySelectorAll("form-step");
		const currentStep = form.querySelector("form-step[show]");
		this.innerHTML = `
        <div class="progress-bar"></div>
        <ul class="progress-num">
        ${Array.from(steps)
			.map((step, index) => {
				const active = step === currentStep ? "active" : "";
				const completed = step.hasAttribute("completed") ? "completed" : "";
				return `<li class="step ${active} ${completed}">${index + 1}</li>`;
			})
			.join("")}
        </ul>
        `;
	}
}
customElements.define("form-progress", FormProgress);
