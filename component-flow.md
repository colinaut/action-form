# Component Architecture and Flow

## `<action-form>`

### Properties

* stepIndex: The current step index
* steps: getter for `"af-step:not([hidden])"` querySelector
  * Used for af-step event listener and some child components
  * _This is an expensive operation so maybe look to see how often it is triggered and if there is a better method_

### Methods

* Step change functionality for `<af-step>`
* Watcher functionality for show/hide and enable/disable of data-watch elements

### Constructor Init

1. (optional) Sets novalidate on form if `novalidate` attribute is added
2. If any `<af-step>` children exist, sets `active` attribute on first af-step element
3. Adds listener for `af-step` custom event which changes which af-step is `active` based on step number event detail
4. Queries for fieldsets and af-steps which have data-watch attribute
   1. Creates watchers array which allows hide/show functionality. Array has the following properties:
      1.  el: HTMLElement with data-watch attribute
      2.  name: value of data-watch attribute; name of form element to watch for changes
      3.  value: value of data-value attribute; value to match named form element's value
      4.  regex: value of data-regex attribute; regex to test named form element's value
      5.  Either value or regex is required, but not both
  2.  _Currently hidden and disabled need to be set manually to hide on load. Maybe this should be automatically handled?_
5. Adds listener for `change` event which show/hide and enable/disable based on watchers array
   1. If event target is a field or af-group-count element, check validity and update error visibility
   2. Loop through watchers array using FormData with getAll(watcher.name) and tests against it with either the value or regex
      1. If value matches or regex tests false, then the watcher element has hidden and disabled added
      2. If value matches or regex tests true, then the watcher element has hidden and disabled removed

## `<af-error>`

This is a light DOM element hide/showing any html content inside based on validation of the target field or fieldset. The af-error is hidden by default via css. The `invalid` attribute makes it visible.

### connectedCallback Init

1. Find the target input, textarea, select, or fieldset to be watched based on id in `for` attribute or if no for then field within `<label>` parent element
2. Add "aria-describedby" attribute with id of error message (make random id if there isn't one)

### Methods

* showError(boolean) - show/hide the error message by adding/removing `invalid` attribute to this element and adds/removes aria-invalid="true" to the target element.

## `<af-group-count>`

Used to count the number of checked or properly filled input, select or textarea elements in a fieldset group. Validity is based on min/max numbers. This is a shadow DOM element that uses internals for setValidity() which means it can make the surrounding fieldset and form invalid. If not in a fieldset then it throws an error.

### Properties

* min (reflected to attribute): min number of elements checked or filled (default: 1)
* max (reflected to attribute): max number of elements checked or filled (default: Infinity)
* value: number of checked or filled fields in fieldset. Display's as number in shadow DOM.
* validity: boolean if the value is within min and max.

### Constructor Init

1. Updates min/max based on fieldset data-group, if it exists
2. Attaches shadow DOM
3. Updates shadow DOM with value
4. Runs checkValidity()
5. Adds "aria-describedby" same as on fieldset so that error message works
6. Add event listener to fieldset for change so that it can update validity on change of fields that are not it

### Methods

* checkValidity: checks if valid based on checked radio or checkboxes and non empty fields and min/max
  * gets value length of checked radio or checkboxes and non empty fields
  * If value is not the same as this.value
    * updates value
    * updates shadow DOM with value
    * dispatches "change" event
  * updates this.validity
  * Triggers setValidity(valid)
* setValidity: sets the validity with custom error (or removes if it is valid)

## `<af-step>`

Wrapper element for form steps. Works as either a light DOM or declarative shadow DOM element.

## Private Properties

* actionForm: parent action-form element
* numberOfSteps: number of steps, grabbed from action-form element as actionForm.steps.length. _Might not need this?_
* this: this or ShadowRoot. Determined in constructor based on if there is a declarative template

## Public Reflected Attribute Properties

* valid: if all fields in step are valid
* active: if this step is actively worked on

## Getters

* isValid: is all fields valid
* thisStep: index of this step based on indexOf from this.actionForm.steps
* nextStep: next step index; null if on last step
* prevStep: previous step index; null if on first step

## Constructor Init

1. Query for wrapper action-form. Stop if not found.
2. update number of steps
3. Add 'change' event listener to check for validity of all fields in step
   1. Sets valid.
4. Add `click` event for prev/next buttons
   1. Prev just goes to the previous step
   2. Next checks validity before going to the next step.
      1. Grabs all :invalid input, select, textarea, and fieldsets
      2. If first invalid element an input, select, textarea it focuses on it and triggers the af-error using "change" event
      3. If first invalid element is af-group-count then it triggers the af-error and focuses on the first other field in the fieldset
      4. If every element is valid then it sets completed if it moves on to nest step.
   3. If it moves than it dispatches 'af-step' event with prev or next step number to update progress bar and action-form

### connectedCallback Init

1. Updates this.valid
2. Checks for any footer slot. If it doesn't find it then it adds prev/next buttons automatically.
   1. First step does not have prev button
   2. Last step has submit button instead of submit button
   3. _Probably need to add ability to change the text for prev/next/submit buttons_
   4. If the dev adds a footer slot then then it will be used instead

### Methods

* step("prev" | "next") - handles the validation check for next and dispatches "af-step" with new step index value

## `<af-progress>`

Shadow DOM element that displays a progress bar for the steps.

### Constructor Init

1. Queries for action-form parent and steps. Stops if neither.
2. renders
3. Adds 'click' listener for step buttons
   1. dispatches 'af-step' event which is used by action-form to change the active step
   2. rerenders the progress bar

### Render Method

1. Sets the progress bar based on percentage of active step to total steps
2. Adds buttons with parts and classes "valid" and "active" and aria-current="step" attribute for active.

## `<af-test-count>`

Simple element that displays the number of characters written in a watched input or textarea.

### Attributes

* `for`: id of target input or textarea; optional if this element is in the same wrapper label as the target element
* `remaining`: changes to display the number of characters left; requires that corresponding field has `maxlength` attribute

### Init

_Uses Connected Callback. Might want to switch this to the constructor so it's only called the once?_

1. Finds target element based on id in `for` attribute or nearest sibling in label parent.
2. Adds "input" listener on target to update number in this element's textContent.