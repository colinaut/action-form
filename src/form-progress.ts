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
		const index = (currentStep && Array.from(steps).indexOf(currentStep)) || 0;
		const progressPercentage = (index / (steps.length - 1)) * 100;
		this.innerHTML = `
        <div class="progress-bg"></div>
        <div class="progress-bar" style="--progress: ${progressPercentage}%"></div>
        <nav class="progress-num">
        ${Array.from(steps)
			.map((step, index) => {
				const active = step === currentStep ? "active" : "";
				const completed = step.hasAttribute("completed") ? "completed" : "";
				return `<button type="button" class="step ${active} ${completed}" aria-current="${active && "step"}" aria-label="Step ${index + 1}">${index + 1}</button>`;
			})
			.join("")}
        </nav>
        `;
	}
}
customElements.define("form-progress", FormProgress);
