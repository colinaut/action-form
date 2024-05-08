export type ActionFormStepEvent = {
	step?: number; //exact step index
	direction?: number; // number of steps to move forward or backward
};

export type HTMLFormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type FormDataObject = {
	[fieldName: string]: {
		fields: HTMLFormField[];
		values: string[];
	};
};
