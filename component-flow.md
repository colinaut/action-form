# Component Architecture and Flow

## `<action-form>`

### Properties

* stepIndex: The current step index
* steps: getter for `"af-step"` querySelector
  * Used for af-step event listener and some child components
  * _This is an expensive operation so maybe look to see how often it is triggered and if there is a better method_
* stepButtons: string[] for the text of the next, prev, and submit step buttons. Defaults to ["Prev", "Next", "Submit"]. Change via comma separated string on attribute `step-buttons="Prev,Next,Submit"`.

### Methods

* Private Step change method for `<af-step>` triggered by "af-step" custom event listener
  * The "af-step" custom event listener uses detail of either the index to change to or the direction from the current active step { step?: number, direction?: "next"|"prev" }
  * NOTE: If you have hidden steps they will be skipped over. For instance if you have 6 steps (0-5 index) and index 3 is hidden then index 4 becomes index 3 for the purposes of this function.
* checkWatchers() — Loops through watchers for show/hide and enable/disable of data-if elements

### Constructor Init

1. (optional) if `novalidate` attribute is added, sets novalidate on form 
2. If any `<af-step>` children exist, sets `first active` classes on first af-step element and `last` class on last
3. Adds listener for `af-step` custom event which changes which af-step is `active` based on step number event detail
4. (optional) if `auto-error` attribute is added, then it adds af-errors for fields that need them
   1. Queries for fields with `[required],[pattern],[type=phone],[type=email],[type=url]`
      1. Searches for `<af-error>` either by the field id or as siblings of parent `<label>` element.
      2. If neither are found it adds an `<af-error>` element after the field.
      3. If the field has `data-error="error text"` attribute then that is used for the textContent of the af-error.
   2. Queries for fieldsets with `data-group` attribute
      1. Searches for `<af-error>` by the fieldset id
      2. If no id it creates one
      3. If it doesn't find af-error it appends one to the fieldset.
      4. If the fieldset has `data-error="error text"` attribute then that is used for the textContent of the af-error.
      5. Searches for `<af-group-count>` and if it doesn't find it, appends one with display="none"
5. Queries for fields with `data-get-store` attribute
   1. updates the field with localStorage value; if it exists
6. If action-form has `store` attribute and and id, it updates all fields that have value in the named localStorage
7. Queries for fieldsets and af-steps which have `data-if` or `data-text` attribute
   1. Creates watchers array which allows hide/show and update textContent functionality. Array has the following properties:
      1.  el: HTMLElement with data-if attribute
      2.  name: name of form element to watch for changes based on value of `data-if` or `data-text` attribute
      3.  if: boolean based on value if name came from `data-if` attribute
      4.  text: boolean based on value if name came from `data-text` attribute
      5.  value: value of `data-if-value` attribute; value to match named form element's value
      6.  notValue: value of `data-if-not-value` attribute; test if value does not match
      7.  regex: value of `data-if-regex` attribute; regex to test named form element's value
8. Adds listener for `change` event on input, textarea, select and af-group-count:
   1. If it has an error linked via "aria-describedby" then check for validity and toggle the af-error
   2. Loop through watchers array using FormData with getAll(watcher.name):
      1. If this is an `data-text` watcher it updates the textContent with the value; if it is a group of checkboxes it lists all checked as a comma delimited string.
      2. If this is an `data-if` watcher it shows/hides based on if it has a value. It will do further checks if other data attributes are present:
         1. `data-if-value` checks value matches (or has the value in the array in case of checkboxes)
         2. `data-if-not-value` checks if value does not match (or does not have the value in the array in case of checkboxes)
         3. `data-if-regex` tests via regex
   3. If action-form has `store` attribute and and id, it stores the value in local storage
      1. checkboxes and radio buttons are stored as array
9.  Adds listener for `reset` and `submit` which clears local storage for the form

## `<af-error>`

This is a light DOM element hide/showing based on validation of the target field or fieldset. The af-error is hidden by default via css. The `invalid` attribute makes it visible. If the element has no textContent then it automatically adds "Required".

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

### Attributes

* valid - (automatic, set by af-step) shown if all child fields are valid
* data-index - (automatic, set by action-form) index for current step, undefined with not visible
* data-title - (optional) Title attribute for progress bar and prev/next buttons of sibling steps
* data-button.prev - (optional) text for the previous button; overrides data-title and action-form data-button.prev
* data-button.next - (optional) text for the next button; overrides data-title and action-form data-button.next
* data-button.submit - (optional) text for submit button; overrides action-form data-button.submit

## Classes

* active: current active step
* first: first step
* last: last step

## Getters

* isValid: is all fields valid

## Constructor Init

1. Query for wrapper action-form. Stop if not found.
2. update number of steps
3. Add 'change' event listener to check for validity of all fields in step
   1. Sets valid.
4. Add 'click' event listener for prev/next buttons
   1. Prev just goes to the previous step
   2. Next checks validity before going to the next step.
      1. Grabs all :invalid input, select, textarea, and fieldsets
      2. If first invalid element an input, select, textarea it focuses on it and triggers the af-error using "change" event
      3. If first invalid element is af-group-count then it triggers the af-error and focuses on the first other field in the fieldset
      4. If every element is valid then it sets completed if it moves on to nest step.
   3. If it moves than it dispatches 'af-step' event with prev or next step number to update progress bar and action-form
5. Add 'af-step' event listener
   1. If there is no detail for event, that means this is a data-if watcher event where a af-step is shown/hidden. If this is the case then update the prev/next button text since data-title will be different.

### connectedCallback Init

1. Updates this.valid
2. Checks for any footer slot. If it doesn't find it then it adds prev/next buttons automatically.
   1. First step does not have prev button
   2. Last step has submit button instead of submit button
   3. _Probably need to add ability to change the text for prev/next/submit buttons_
   4. If the dev adds a footer slot then then it will be used instead

### Methods

* step(direction: number = 1) - Direction argument 1 = next step; -1 = prev step; handles the validation check for next and dispatches "af-step" with new step index value

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
3. Adds title if there is a data-title on the corresponding step element

## `<af-test-count>`

Simple element that displays the number of characters written in a watched input or textarea.

### Attributes

* `for`: id of target input or textarea; optional if this element is in the same wrapper label as the target element
* `remaining`: changes to display the number of characters left; requires that corresponding field has `maxlength` attribute

### Init

_Uses Connected Callback. Might want to switch this to the constructor so it's only called the once?_

1. Finds target element based on id in `for` attribute or nearest sibling in label parent.
2. Adds "input" listener on target to update number in this element's textContent.

## `<af-preview>`

Simple element that displays all of the field names and values as a list.

### Attributes

* for: (optional) id of form element to display form data. Not required if this component is as child the parent form element.
* title-case: convert all of the field names (whether kebab-case, camelCase, or snake_case) to Title Case
* ignore: comma separated list of field names to ignore and not display
* event-type: event listener that updates content. Default is "change"