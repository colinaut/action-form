# Action Form

HTML light DOM web component to add useful functionality to forms. This is still in beta. Use at your own risk and expect changes.

## `<action-form>`

Light DOM base wrapper. This wrapper enhances fieldsets with the ability to show and hide and disable based on the value of a field.

### Attributes

* novalidate - sets novalidate on form.
* auto-error - automatically adds af-error elements for fields that require validation, unless there is already a matching af-error. Also adds af-error and af-group-count for fieldsets with `data-group`.
* store - Stores all field values in local storage and refills fields on reload
  * `store="store-name"` the localstorage key will be "store-name"
  * Local storage is cleared after 'reset' or a successful 'submit'.
* store-listen - adds a listener for the "storage" event so it will update field values to match the store if a the same form is updated in another open browser tab.
* data attributes used by af-step:
  * data-button.prev - text for previous buttons; defaults to "Prev"
  * data-button.next - text for next buttons; defaults to "Next"
  * data-button.submit - text for submit buttons; defaults to "Submit"

## Element Enhancements

This element adds functionality to child elements based on special data attributes.

* data-text - updates the textContent of the element with the value of the watched field (shows as a comma delimited string for a group of checkboxes).
* data-if - show/hide based on named form field. `data-if="animal"` watches the field with name='animal' for changes. Groups of radio or checkboxes with the same name are matched against as an array. If the field has a value or is checked then the element is shown; otherwise the element is hidden using style.display="none" and disabled using the disabled attribute. NOTE: disabled attribute is really only useful for fields and fieldsets. You can specify the value you are interested in with the added attributes:
  * data-if-value - value to exact match against
  * data-if-not-value - value it is not
  * data-if-regex - regex to use for testing against the field's value

## Reactive Data

The action-form component exposes properties with signals-based reactive data. These are used internally and by the child components. As they are publicly available you can experiment with your own components. _No warranties are provided._

* data - updates and exposes FormData based on field names; used for error checking and data-if and data-text enhancements
  * get(name: string) - gets the reactive value of all fields with the given name as an array of strings
  * set(name: string) - sets the reactive value for get, using new FormData(form).getAll(name)
  * getForm() - gets the reactive values of the form as a object with names as keys and values as an array of strings
  * setForm() - sets the reactive getForm value using the latest Form Data.
  * getValues(name: string) - returns the values of all fields with the given name without triggering reactive effects
  * formDataObject() - returns the form data object without triggering reactive effects
* steps - used for step handling
  * all - returns all steps as a `NodeListOf<ActionFormStep>` without triggering reactive effects
  * getVisible() - returns a node list of only steps that are visible (ie., not style="display:none") without triggering reactive effects
  * currentStep() - gets the reactive value of current af-step element
  * stepIndex() - gets the reactive value of current step index (step index is based on only visible steps)
  * stepsLength() - gets the reactive value based on the length of all visible steps
  * updateSteps() - reactively updates the steps length based on visible steps (this is triggered when steps are hidden or displayed with data-if)
  * set(number: number) - sets the current step by index (based on visible steps)
  * move(number: number) - moves the current step forward or backward a number of steps
  * prev() - moves to the previous step
  * next() - checks for invalid fields, then moves to the next step if it is all valid
    * If invalid it will focus on the first invalid field and display its error message
  * createEffect() - this is exported as a function if you want to use any of the above reactive get properties. See Signals section of [Patterns of Vanilla Reactivity](https://frontendmasters.com/blog/vanilla-javascript-reactivity/#toc-11) for usage information.
 
## `<af-error>`

Shadow DOM error message element which watches fields or af-field-group elements to see if they are invalid and displays the error if so. It will set the proper aria-labelledby attribute and aria-invalid attribute. If you set auto-error on action-form then they will be automatically added, unless they already exist.

### Slots

* Default slot - text shown when a required field errors as it is empty. Defaults to "Required"
* "pattern" slot - text shown when a field errors due to invalid pattern (tel, email, pattern attribute, etc.). Defaults to "Not filled in properly"

These defaults can be overridden either by adding an af-error with the content included or by setting data-error and/or data-error-pattern on the field itself.

### Attributes

* for - the id of the field or fieldset to watch for changes
  *  Neither a for or an id is required for fields if af-error is within the parent `<label>`. 
  *  For with id is required for fieldsets.

## `<af-field-group>`

Shadow DOM element for wrapping groups of fields and setting a min and max number of fields to be filled or checked. Mainly useful for checkbox groups but can be used for any group of fields. This custom element uses internals so that it registers as `:invalid`

### Attributes

* name - required attribute for reactive data and error messages to work properly
* min - Defaults to 0
* max - Defaults to Infinity
* value - (readonly) Value of filled or checked child fields

### Methods

* checkValidity() - Checks validity comparing the number of fields to the minimum and maximum
* setValidity(boolean) - Sets validity so that it registers as `:invalid`
* focus() - Sets focus on the first child field

## `<af-field-group-count>`

Simple element that displays the number of filled or checked fields in a parent `<af-field-group>`

## `<af-step>`

Form step wrapper. The af-step element is light DOM unless you add a declarative shadow DOM template. Automatically adds previous, next, and a final submit buttons unless footer is overridden by adding and element with `slot="footer"` (this works either with light DOM or shadow DOM).

### Attributes

* valid - (automatic, set by af-step) shown if all child fields are valid
* data-title - (optional) Title attribute for progress bar and prev/next buttons of sibling steps

## `<af-progress>`

Shadow DOM progress bar for stepped forms. Only previous steps are clickable unless enable-all attribute is added. If the af-step has progress-title attribute it will use this is a title attribute for the step button. Uses parts and css variables for styling.

### Attributes

* enable-all - enables the ability to click on any step even if not completed.

## `<af-text-count>`

Displays the number of characters in a text input field or textarea

### Attributes

* for - (optional) the id of the input or textarea; if not specified then it finds the field within the parent `<label>`

## `<af-preview>`

Simple element that displays all of the field names and values as a list.

### Attributes

* for: (optional) id of form element to display form data. Not required if this component is as child the parent form element.
* title-case: convert all of the field names (whether kebab-case, camelCase, or snake_case) to Title Case
* ignore: comma separated list of field names to ignore and not display

### TODO

- [ ] Add a data-no-store attribute to stop localStorage from being added for a field
- [ ] Sort out css variables and document them
- [ ] Add ability for some data-if or data-text to update via "input" event type
- [ ] QA all of it
- [ ] Clean up and DRY code (again)
- [ ] QA Again

### Resources

* https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-errormessage
* https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html
* https://web.dev/articles/more-capable-form-controls