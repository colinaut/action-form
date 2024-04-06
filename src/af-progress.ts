import type ActionFormStep from "./af-step";
import type ActionForm from "./action-form";
export default class ActionFormProgress extends HTMLElement {
	private shadow: ShadowRoot;
	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });

		if (!this.actionForm || !this.steps) return;

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

	private form = this.closest("form");
	private actionForm = this.closest("action-form") as ActionForm | null;
	private steps: NodeListOf<ActionFormStep> | undefined = this.actionForm?.steps;

	get stepIndex(): number {
		return this.actionForm?.stepIndex || 0;
	}

	private render() {
		if (!this.form || !this.steps) return;

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
            --incomplete: coral;
            --completed: var(--active);
            --completed-bg: var(--active);
            --completed-text: white;
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
        .step.completed {
            border-color: var(--completed);
            background: var(--completed-bg);
            color: var(--completed-text);
        }
        .step:disabled {
            opacity: 1;
            cursor: not-allowed;
        }
        .step[aria-current="step"] {
            border-color: var(--active);
        }
        .step:not(.completed):has(~ .step[aria-current="step"]) {
            border-color: var(--incomplete);
        }
        </style>
        `;

		// TODO: add step titles from af-step
		const progressPercentage = (this.stepIndex / (this.steps.length - 1)) * 100;
		this.shadow.innerHTML = `${style}
        <div class="bg" part="bg"></div>
        <div class="progress" style="width: ${progressPercentage}%" part="progress"></div>
        <nav part="nav">
        ${Array.from(this.steps)
			.map((step, index) => {
				const active = index === this.stepIndex ? "active" : "";
				const completed = step.completed ? "completed" : "";
				const disabled = this.hasAttribute("enable-all") || this.stepIndex > index ? "" : "disabled";
				const title = step.getAttribute("progress-title") || "";
				return `<button type="button" part="step ${completed} ${active}" ${disabled} title="${title}" class="step ${completed}" ${
					active && `aria-current="step"`
				} aria-label="Step ${index + 1}" data-index="${index}">${index + 1}</button>`;
			})
			.join("")}
        </nav>
        `;
	}
}
customElements.define("af-progress", ActionFormProgress);
