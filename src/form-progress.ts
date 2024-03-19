import type FormStep from "./form-step";
export default class FormProgress extends HTMLElement {
	constructor() {
		super();

		if (this.form) {
			this.form.addEventListener("step", () => {
				this.render();
			});

			this.steps = this.form.querySelectorAll("form-step") as NodeListOf<FormStep>;
			this.stepIndex = Array.from(this.steps).findIndex((step) => step.hasAttribute("show"));
			this.render();
		}

		// TODO: fix so that if a step you are on is not completed don't allow to go forward.
		this.addEventListener("click", (e) => {
			const target = e.target;
			if (!(target instanceof HTMLButtonElement)) return;
			if (target.matches(".step")) {
				this.stepIndex = Number(target.dataset.index);
				//previous step floor of zero
				if (!this.steps) return;
				this.steps.forEach((step, i) => {
					if (i === this.stepIndex) {
						step.setAttribute("show", "");
					} else {
						step.removeAttribute("show");
					}
				});
				this.render();
			}
		});
	}

	private form = this.closest("form");
	private steps!: NodeListOf<FormStep>;
	private stepIndex: number = 0;

	public connectedCallback(): void {
		console.log("connected");
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }

	private render() {
		if (!this.form || !this.steps) return;
		const currentStep = this.form.querySelector("form-step[show]") as FormStep;
		const index = (currentStep && Array.from(this.steps).indexOf(currentStep)) || 0;
		const progressPercentage = (index / (this.steps.length - 1)) * 100;
		this.innerHTML = `
        <div class="progress-bg"></div>
        <div class="progress-bar" style="--progress: ${progressPercentage}%"></div>
        <nav class="progress-num">
        ${Array.from(this.steps)
			.map((step, index) => {
				const active = step === currentStep ? "active" : "";
				const completed = step.hasAttribute("completed") ? "completed" : "";
				const disabled = active || completed ? "" : "disabled";
				return `<button type="button" class="step ${active} ${completed}" aria-current="${active && "step"}" aria-label="Step ${index + 1}" data-index="${index}">${
					index + 1
				}</button>`;
			})
			.join("")}
        </nav>
        `;
	}
}
customElements.define("form-progress", FormProgress);
