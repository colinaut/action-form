import type ActionForm from "./action-form";
export default class ActionFormProgress extends HTMLElement {
	private shadow: ShadowRoot;
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });

		if (!this.actionForm?.steps) return;

		this.actionForm.addEventListener("af-step", () => {
			this.render();
		});

		this.render();

		this.shadow.addEventListener("click", (e) => {
			const target = e.target;
			if (target instanceof HTMLButtonElement && target.matches(".step") && !target.disabled) {
				const step = Number(target.dataset.index || 0);
				// dispatch event to action-form which handles show/hide of steps

				this.dispatchEvent(new CustomEvent("af-step", { bubbles: true, composed: true, detail: { step } }));
				this.render();
			}
		});
	}

	private actionForm = this.closest("action-form") as ActionForm | null;

	get stepIndex(): number {
		return this.actionForm?.stepIndex || 0;
	}

	private render() {
		if (!this.actionForm?.steps) return;

		const stepsLength = Array.from(this.actionForm.steps).filter((step) => !(step.style.display === "none")).length;
		const shownStepIndex = this.actionForm?.shownStepIndex || 0;

		const progressPercentage = (shownStepIndex / (stepsLength - 1)) * 100;

		// TODO: simplify this
		const style = `
        <style>
        :host {
            display: grid;
            position: relative;
            align-items: center;
            --step-border-size: .22em;
            --step-bg: white;
            --step-text: inherit;
            --inactive: lightgray;
            --active: lightseagreen;
            --invalid: coral;
            --valid: var(--active);
            --valid-bg: var(--active);
            --valid-text: white;
        }
        .progress {
            background: var(--active);
            height: 0.5em;
            grid-row: -1/1;
            grid-column: -1/1;
        }
        nav {
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            justify-content: space-between;
            grid-row: -1/1;
            grid-column: -1/1;
        }
        .bg {
            background: var(--inactive);
            height: 0.5em;
            grid-row: -1/1;
            grid-column: -1/1;
        }
        .step {
            border: var(--step-border-size) solid var(--inactive);
            border-radius: 100%;
            width: 2em;
            height: 2em;
            line-height: 1.65em;
            text-align: center;
            background: var(--step-bg);
            font-size: 0.9em;
            position: relative;
            z-index: 1;
            padding: 0;
            margin: 0;
            cursor: pointer;
            color: var(--step-text);
        }
        .valid:has(~ .active) {
            border-color: var(--valid);
            background: var(--valid-bg);
            color: var(--valid-text);
        }
        .step:disabled {
            opacity: 1;
            cursor: not-allowed;
        }
        .active {
            border-color: var(--active);
        }
        .step:not(.valid):has(~ .active) {
            border-color: var(--invalid);
        }
        </style>
        `;

		// TODO: add step titles from af-step
		this.shadow.innerHTML = `${style}
        <div class="bg" part="bg"></div>
        <div class="progress" part="progress" style="width: ${progressPercentage}%;"></div>
        <nav part="nav">
        ${Array.from(this.actionForm?.steps)
			.filter((step) => !(step.style.display === "none"))
			.map((step, index) => {
				const active = index === shownStepIndex ? "active" : "";
				const valid = step.valid ? "valid" : "";
				const disabled = this.hasAttribute("enable-all") || shownStepIndex > index ? "" : "disabled";
				const title = step.getAttribute("progress-title") || "";
				return `<button type="button" part="step ${valid} ${active}" ${disabled} title="${title}" class="step ${valid} ${active}" ${
					active && `aria-current="step"`
				} aria-label="Step ${index + 1}" data-index="${step.index}">${index + 1}</button>`;
			})
			.join("")}
        </nav>
        `;
	}
}
customElements.define("af-progress", ActionFormProgress);
