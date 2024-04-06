type MakeAttributesArray = {
	attr: string;
	type?: "string" | "number" | "boolean";
	defaultValue?: string | number | boolean;
}[];

export function makeAttributes(target: HTMLElement, attributes: MakeAttributesArray) {
	attributes.forEach((attribute) => {
		makeAttribute(target, attribute.attr, attribute.type, attribute.defaultValue);
	});
}

export function makeAttribute(target: HTMLElement, attr: string, type: "string" | "number" | "boolean" = "string", defaultValue?: string | number | boolean) {
	const attrKebab = attr.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

	// Add getter and setter
	Object.defineProperty(target, attr, {
		get() {
			if (type === "string") {
				return this.getAttribute(attrKebab) || "";
			} else if (type === "number") {
				// eslint-disable-next-line no-case-declarations
				const value = this.getAttribute(attrKebab);
				if (value) {
					return Number(value);
				} else {
					return null;
				}
			} else if (type === "boolean") {
				return this.hasAttribute(attrKebab);
			}
		},
		set(value) {
			if (!value) {
				this.removeAttribute(attrKebab);
			} else {
				value = type === "boolean" ? "" : String(value);
				this.setAttribute(attrKebab, String(value));
			}
		},
	});

	console.log(`makeAttribute: ${attr}`, target[attr]);

	// Add default value if attribute is not already defined
	// @ts-expect-error: "This is a custom element so it should work"
	if (target[attr] === null && defaultValue !== undefined) target[attr] = defaultValue;
}
