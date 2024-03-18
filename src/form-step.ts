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
			console.log("🚀 ~ FormStep ~ this.addEventListener ~ target:", target);
			if (!(target instanceof HTMLButtonElement)) return;
			if (target.matches(".form-step-next")) {
				this.step("next");
			} else if (target.matches(".form-step-prev")) {
				console.log("prev");
				this.step("prev");
			}
		});
	}

	public step(direction: "prev" | "next" = "next") {
		console.log(direction);

		const el = direction === "next" ? this.nextElementSibling : this.previousElementSibling;
		const invalidElements = this.querySelectorAll(":invalid");
		if (direction === "next" && this.querySelectorAll(":invalid").length > 0) {
			Array.from(invalidElements).some((element) => {
				if (
					element instanceof HTMLInputElement ||
					element instanceof HTMLSelectElement ||
					element instanceof HTMLTextAreaElement ||
					(element instanceof HTMLFieldSetElement && element.hasAttribute("has-error"))
				) {
					element.focus();
					console.log("invalid element", element);
					element.dispatchEvent(new CustomEvent("toggle-error"));
					return true;
				}
				console.log("invalid unknown element", element);

				return false;
			});
			return;
		}
		if (el?.matches("form-step")) {
			this.show = false;
			el.setAttribute("show", "");
			this.dispatchEvent(new CustomEvent("step", { bubbles: true, detail: el }));
		}
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
