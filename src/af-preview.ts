import ActionForm from "./action-form";
import { createEffect } from "./signals";
function convertToTitleCase(str: string): string {
	return str
		.replace(/[-_](.)/g, function (match) {
			return " " + match.charAt(1).toUpperCase();
		})
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/^./, function (match) {
			return match.toUpperCase();
		});
}

export default class ActionFormPreview extends HTMLElement {
	private actionForm!: ActionForm;

	connectedCallback() {
		const actionForm = this.closest("action-form");
		if (actionForm && actionForm instanceof ActionForm) {
			this.actionForm = actionForm;
			const form = actionForm.querySelector("form");
			if (!form) return;
			createEffect(() => {
				this.render(this.actionForm.data.getForm());
			});
		}
	}

	get ignore(): string[] {
		return this.getAttribute("ignore")?.split(",") || [];
	}

	render(data: Record<string, FormDataEntryValue[]> | FormDataEntryValue[] | null) {
		// console.log("af-preview render", data);

		const valuesToText = (values: FormDataEntryValue[]) => {
			return values
				.map((value) => {
					if (typeof value === "string") return value;
					return "FILE";
				})
				.toString();
		};

		if (data && !Array.isArray(data)) {
			this.innerHTML = `<ul>${Object.entries(data)
				.filter(([key]) => !this.ignore.includes(key))
				.map(([key, values]) => `<li><strong>${this.hasAttribute("title-case") ? convertToTitleCase(key) : key}</strong>: ${valuesToText(values)}</li>`)
				.join("")}</ul>`;
		}
	}
}

customElements.define("af-preview", ActionFormPreview);
