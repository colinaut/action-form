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
	private form!: HTMLFormElement | null;

	constructor() {
		super();

		const actionForm = this.closest("action-form");
		this.form = this.closest("form");

		if (!actionForm || !this.form) return;

		actionForm.addEventListener("af-step", () => {
			this.render();
		});
	}
	connectedCallback() {
		this.render();
	}

	getFormData() {
		if (!this.form) return;
		const formData = new FormData(this.form);
		console.log("formData", formData);

		const keys = [...new Set(Array.from(formData.keys()))];
		return keys
			.filter((key) => formData.has(key) && formData.getAll(key).some((value) => value !== ""))
			.map((key) => {
				const values = formData.getAll(key);
				const stringValues = values.filter((value) => typeof value === "string") as string[];
				return {
					key,
					value: stringValues,
				};
			});
		// const values = Array.from(formData.values());
		// return values;
	}

	render() {
		const data = this.getFormData();

		this.innerHTML = `${data
			?.map(
				(item) =>
					`<p><strong>${this.hasAttribute("title-case") ? convertToTitleCase(item.key) : item.key}</strong>: ${item.value
						.map((value) => `<span>${value}</span>`)
						.join("")}</p>`
			)
			.join("")}`;
	}
}

customElements.define("af-preview", ActionFormPreview);
