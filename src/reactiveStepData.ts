export type StepEvent = (data: { index: number; currentStep: HTMLElement }) => void;

import { createSignal } from "./signals";
import ActionFormStep from "./af-step";

export function stepSignals(afSteps: NodeListOf<ActionFormStep>) {
	// create signal with initial step index and the first step
	const [stepIndex, setStepIndex] = createSignal(0);
	const [currentStep, setCurrentStep] = createSignal(getVisible()[0]);
	const [stepsLength, setStepsLength] = createSignal(getVisible().length);

	function getVisible() {
		return Array.from(afSteps).filter((step) => step.style.display !== "none");
	}

	function updateSteps() {
		setStepsLength(getVisible().length);
	}

	function set(number: number = 0) {
		setStepIndex(number);
		setCurrentStep(getVisible()[number]);
	}

	function move(numberOfSteps: number = 0) {
		const currentIndex = stepIndex();
		const index = Math.max(0, Math.min(currentIndex + numberOfSteps, getVisible().length - 1));
		if (index === currentIndex) return;
		set(index);
	}

	function prev() {
		move(-1);
	}

	function next() {
		// Check for invalid fields before moving to next step
		const invalid = currentStep().querySelector(":invalid:not(fieldset)");
		if (invalid instanceof HTMLElement) {
			// focus on the first element that is invalid
			invalid.focus();
			// dispatch change event to trigger subscribed toggleError method
			invalid.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
		} else {
			move(1);
		}
	}

	return {
		all: afSteps,
		// function which updates when called
		getVisible,
		// reactive current step element
		currentStep,
		// reactive step index
		stepIndex,
		// reactive steps length of visible steps
		stepsLength,
		// update stepsLength
		updateSteps,
		// set reactive step index and reactive current step
		set,
		// move a number of steps forward or backward
		move,
		// move to previous step
		prev,
		// move to next step
		next,
	};
}
