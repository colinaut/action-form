export default class ActionFormStepToggle extends HTMLElement {
	private shadow: ShadowRoot;

	constructor() {
		super();
		this.shadow = this.attachShadow({ mode: "open" });
		this.shadow.innerHTML = "<button part='button'><slot>Toggle Steps</slot></button>";
		this.addEventListener("click", () => {
			this.closest("action-form")?.classList.toggle("no-steps");
		});
	}
}

customElements.define("af-step-toggle", ActionFormStepToggle);
