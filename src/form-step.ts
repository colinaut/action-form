export default class FormStep extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.addEventListener("input", () => {
			this.valid = this.isValid;
			console.log(this.isValid);
		});
		this.addEventListener("click", (e) => {
			const target = e.target;
			if (!(target instanceof HTMLButtonElement)) return;
			if (target.classList.contains("form-step-next")) {
				console.log("next");
				this.show = false;
				const nextStep = this.nextElementSibling;
				console.log("nextStep", nextStep);

				if (nextStep?.matches("form-step")) {
					nextStep.setAttribute("show", "");
				}
			} else if (target.classList.contains("form-step-prev")) {
				console.log("prev");
				this.show = false;
				const prevStep = this.previousElementSibling;
				console.log("prevStep", prevStep);

				if (prevStep?.matches("form-step")) {
					prevStep.setAttribute("show", "");
				}
			}
		});
	}

	get show(): boolean {
		return this.hasAttribute("show");
	}

	set show(hidden: boolean) {
		if (hidden) {
			this.setAttribute("show", "");
		} else {
			this.removeAttribute("show");
		}
	}

	set valid(isValid: boolean) {
		isValid ? this.setAttribute("valid", "") : this.removeAttribute("valid");
	}

	get isValid(): boolean {
		return this.querySelectorAll(":invalid").length === 0;
	}

	public connectedCallback(): void {
		console.log("connected");
		this.valid = this.isValid;
		console.log(this.isValid);
	}

	// public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	// 	console.log("changed", name, oldValue, newValue);
	// }

	private render() {
		const div = document.createElement("div");
		div.classList.add("form-step-nav");
		const prev = `<button type="button" class="form-step-prev">Previous</button>`;
		const next = `<button type="button" class="form-step-next">Next</button>`;
		console.log(this.previousElementSibling);

		const html = this.previousElementSibling?.matches("form-step") ? prev + next : next;
		const css = `<style>form-step {
            display: var(--display, inherit);
        }
        
        form-step:not([show]) {
            display: none;
        }</style>`;
		div.innerHTML = css + html;
		this.append(div);
	}
}
customElements.define("form-step", FormStep);
