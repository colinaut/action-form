# Action Form

HTML light DOM web component to add useful functionality to forms. This is still in beta. Use at your own risk and expect changes.

## `<action-form>`

Base wrapper. This wrapper enhances fieldsets with the ability to show and hide and disable based on the value of a field.

### Attributes

* novalidate - sets novalidate on form when defined
* auto-error - automatically adds af-error elements for fields that require validation, unless there is already a matching af-error.

## Watchers

Used to make any element automatically hide(add `disable` and `hidden` attributes) or show(remove `disable` and `hidden` attributes) based on the value of a field. 

Use the following attributes on any element to have action-form turn them into watchers. This includes af-step, which allows you to show/hide steps. Note: `disable` only works to disable fields when set on the field itself or a parent fieldset. So if you need to hide a step and disable all fields in a step, the a watcher needs to be set on the fields or a parent fieldset as well.

### Attributes

* data-watch - name of the field to watch for changes. _If set without value or regex it will match if there is any value or if it is checked._
* data-value - value to exact match against the field's value
* data-regex - regex to use for testing against the field's value

## `<af-error>`

Error message element which watches fields or fieldsets to see if they are invalid and displays the error if so. It will set the proper aria-labelledby attribute and aria-invalid attribute. If the element has no content, then "Required" will automatically be added.

This element also allows checking groups of fields in a fieldset to see if a minimum number of of them are checked or have values filled in. When watching a fieldset the element will automatically add a hidden by default `<af-group-count>` element unless it already exists in the fieldset.

### Attributes

* for - (optional) the id of the field or fieldset to watch for changes; if not specified then it finds the field within the parent `<label>`
* min - (optional) Only for fieldsets; defaults to 1
* max - (optional) Only for fieldsets; defaults to Infinity

## `<af-group-count>`

Shadow DOM element that displays the number of checked or valid fields in a fieldset. It also indicates validity based on the min or max value. The af-error automatically adds this; however you can add your own instead if you want it to be visible.

## `<af-step>`

Form step wrapper. Automatically adds previous, next, and a final submit buttons unless footer is overridden. This element is light DOM unless you add a declarative shadow DOM template.

## `<af-progress>`

Shadow DOM progress bar for stepped forms. Only previous steps are clickable unless enable-all attribute is added. If the af-step has progress-title attribute it will use this is a title attribute for the step button. Uses parts and css variables for styling.

### Attributes

* enable-all - enables the ability to click on any step even if not completed.

## `<af-text-count>`

Displays the number of characters in a text input field or textarea

### Attributes

* for - (optional) the id of the input or textarea; if not specified then it finds the field within the parent `<label>`

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
- [ ] Add reactive data for form elements values
- [ ] hide type="hidden" from preview
- [ ] Make sure that resetting the form also hides all error messages
- [ ] Need to test submitting the form and triggering errors
- [ ] QA all of it
- [ ] Clean up and DRY code
- [ ] QA Again

### Resources

* https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-errormessage
* https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html
* https://web.dev/articles/more-capable-form-controls