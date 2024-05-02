# Action Form

HTML light DOM web component to add useful functionality to forms. This is still in beta. Use at your own risk and expect changes.

## `<action-form>`

Base wrapper. This wrapper enhances fieldsets with the ability to show and hide and disable based on the value of a field.

### Attributes

* novalidate - sets novalidate on form.
* auto-error - automatically adds af-error elements for fields that require validation, unless there is already a matching af-error. Also adds af-error and af-group-count for fieldsets with `data-group`.
* store - Stores all field values in local storage and refills fields on reload. Local storage is cleared after 'reset' or a successful 'submit'. Local storage key is as `action-form-${id}` where id is either the value of `store="name"`, the id of the action-form, the id of the form, or a random string. This is held in this.storeKey property.
* store-listen - adds a listener for the "storage" event so it will update field values to match the store if a the same form is updated in another open browser tab.
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
* data-get-store - grabs the value from a named localStorage. Useful mainly for hidden fields that are grabbing from some prior stored data.
* data-group - used on fieldsets to check grouped fields to see how many are filled/checked. `data-group="1-3"` means a range from 1 to 3 checkboxes checked or 1-3 inputs filled. `data-group="1"` means minimum of 1 and no max. `data-group="-3"` means no min and max of 1. Default is "0-Infinity".
  * If `auto-error` is set then it will automatically add an `<af-error>` element and a hidden `<af-group-count>` element. Otherwise you will need to add both yourself for this to work correctly.
* data-store-get - loads the value from a named localStorage in page load (see below)
  * data-store-listen - listens for "storage" events to reload values from key-value store. Must be paired with "data-store-get"
* data-store-set - sets the value to a named localStorage

### data-store-get, data-store-listen, and data-store-set

The attributes data-store-get and data-store-listen are useful for type="hidden" inputs where you need to add things like user ids, tokens, or other values, which may be stored in localStorage. It's also useful for fields where you want a local saved value across multiple different forms. The latter can be paired with data-store-set. Both data-store-get and data-store-set require a value which is the key for the local storage. This also allows retrieving or saving as an object property.

* `data-store-get="foo"` - returns localStorage.getItem("foo") as a string
* `data-store-set="foo.bar"` - assumes that "foo" is an object and returns foo.bar as a string

_Currently this only allows one level deep property access. I may update this in the future._

## `<af-error>`

Error message element which watches fields or fieldsets to see if they are invalid and displays the error if so. It will set the proper aria-labelledby attribute and aria-invalid attribute. If the element has no content, then "Required" will automatically be added.

This element also allows checking groups of fields in a fieldset to see if a minimum number of of them are checked or have values filled in. When watching a fieldset the element will automatically add a hidden by default `<af-group-count>` element unless it already exists in the fieldset.

### Attributes

* for - the id of the field or fieldset to watch for changes
  *  Neither a for or an id is required for fields if af-error is within the parent `<label>`. 
  *  For with id is required for fieldsets.
* min - (optional) Only for fieldsets; defaults to 1
* max - (optional) Only for fieldsets; defaults to Infinity

## `<af-group-count>`

Shadow DOM element that displays the number of checked or valid fields in a fieldset. It also indicates validity based on the min or max value. The af-error automatically adds this; however you can add your own instead if you want it to be visible.

## `<af-step>`

Form step wrapper. Automatically adds previous, next, and a final submit buttons unless footer is overridden. This element is light DOM unless you add a declarative shadow DOM template.

### Attributes

* valid - (automatic, set by af-step) shown if all child fields are valid
* data-index - (automatic, set by action-form) index for current step, undefined with not visible
* data-title - (optional) Title attribute for progress bar and prev/next buttons of sibling steps
* data-button.prev - (optional) text for the previous button; overrides data-title and action-form data-button.prev
* data-button.next - (optional) text for the next button; overrides data-title and action-form data-button.next
* data-button.submit - (optional) text for submit button; overrides action-form data-button.submit

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
* event-type: event listener that updates content. Default is "change"

### TODO

- [x] Get error-msg working
- [x] Get error-msg working with checkbox groups
- [x] Get action-fieldset working to hide/show based on other fields value
- [x] Add ARIA to error messages. Need to sort out the best way to do this.
- [x] Get form-step working to hide/show based on if prior steps are completed
- [x] Get progress bar working
- [x] Make progress bar clickable
- [x] Make sure that if someone unvalidates a form-step it is set to incomplete
- [x] Maybe move functionality to action-form parent element
- [x] Make it so that once invalid is triggered it then checks validation on input event
- [x] Allow declarative shadow dom? https://developer.chrome.com/docs/css-ui/declarative-shadow-dom
- [x] Add helpers functions for attribute getters and setters
- [x] Add character counter element
- [x] Need to sort out multiple versions of same field and grabbing data from it. Test event listener on form that grabs value from that
- [x] Add ability to add/remove steps (steps could watch like fieldsets)
- [x] Ability to switch between stepped and long form for users
- [x] Switch to using data-group="min,max" for fieldset groups
- [x] Component that displays all of the FormData as a list. This can be used as a pre-submit to check everything.
- [x] Make it so that the prev/next works with added steps and removed steps and that submit button is added at the end
- [x] Clean up af-step code
- [x] Make so watchers are set onload for form elements that have their values set initially
- [x] Automatically add af-error elements to form unless they exist already
- [x] Add ability to grab values from localStorage data-get-ls="lsname" which can be used on hidden input fields
- [x] Add ability to set/get values from localStorage so that you can return to the form and retain the value
- [x] convert to use style.display="none" instead of hidden att
- [x] Add reset functionality for clearing localStorage; also should clear on submit
- [x] Review stepIndex and shownStepIndex to see if there is a cleaner way to handle this
- [x] Add reactive data for form elements values
- [x] Add af-group-count and af-error for fieldset elements with data-group attribute
- [x] Review how often the various "change" eventlisteners are triggered and if there is a way to limit it if it's going off too often.
- [x] Make sure that resetting the form also hides all error messages
- [x] Need to test submitting the form and triggering errors
- [x] Ability to change next/prev button text when steps show or hide
- [ ] Add a data-no-store attribute to stop localStorage from being added for a field
- [x] Add a data-persist attribute to maintain a field from resetting.
- [x] Change to data-store-get, data-store-set, and data-store-listen (and store-listen for action-form)
- [ ] Revisit "af-step" event so it makes more sense
- [x] Add a storage event listener to reload the value for the data-store-watch attribute
- [ ] Fix issue with loading single string from data-store-get
- [ ] Add some sort of preview-title for the form field that uses for the af-preview
- [ ] Figure out how to fix store with multiple fields with the same name; this occurs when using data-if to show different versions of the some fields
- [ ] Add ability to use the label for the af-preview
- [ ] Sort out css variables and document them
- [ ] Add show invalid to af-preview and/or a new component that displays invalid fields as a list
- [ ] Add multiple error messages based on the error type. For example, "required" if blank and then "max 25" if over when a number input is max="25"
- [ ] FIX: When a fieldset is hidden/shown it disabled fields. This should trigger watchers for those fields.
- [ ] Allow data-persist to work without data-store
- [ ] Move data-store-get to it's own action-store component
- [ ] QA all of it
- [ ] Clean up and DRY code
- [ ] QA Again

### Resources

* https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-errormessage
* https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html
* https://web.dev/articles/more-capable-form-controls