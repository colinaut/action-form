import type ActionForm from "./action-form";
import { createEffect } from "./signals";
export default class ActionFormProgress extends HTMLElement {
	private shadow: ShadowRoot;

	private actionForm!: ActionForm;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });

		const actionForm = this.closest("action-form") as ActionForm | null;
		if (actionForm && actionForm.steps.all.length > 0) {
			this.actionForm = actionForm;
			this.shadow.addEventListener("click", (e) => {
				const target = e.target;
				if (this.actionForm && target instanceof HTMLButtonElement && target.matches(".step") && !target.disabled) {
					const step = Number(target.dataset.index || 0);
					actionForm.steps.set(step);
				}
			});

			/* ---- rerender when step is changed or when steps are added or removed ---- */
			createEffect(() => {
				const stepsLength = actionForm.steps.stepsLength();
				const stepIndex = actionForm.steps.stepIndex();
				console.log("🫨 create effect: af-progress: rerender", stepsLength, stepIndex);
				this.render(stepsLength, stepIndex);
			});
		}
	}

	private render(stepsLength: number, stepIndex: number) {
		const progressPercentage = (stepIndex / (stepsLength - 1)) * 100;

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
        ${Array.from(this.actionForm.steps.getVisible())
			.map((step, index) => {
				const active = index === stepIndex ? "active" : "";
				const valid = step.valid ? "valid" : "";
				const disabled = this.hasAttribute("enable-all") || stepIndex > index ? "" : "disabled";
				const title = step.dataset.title || "";
				return `<button type="button" part="step ${valid} ${active}" ${disabled} title="${title}" class="step ${valid} ${active}" ${
					active && `aria-current="step"`
				} aria-label="Step ${index + 1}" data-index="${index}">${index + 1}</button>`;
			})
			.join("")}
        </nav>
        `;
	}
}
