# Action Form

HTML light DOM web component to add useful functionality to forms. This is still in beta. Use at your own risk and expect changes.

## `<action-form>`

Base wrapper. Currently just to dynamically set novalidate. This is where submit validation functionality will be added.

### Attributes

* novalidate - sets novalidate on form when defined

## `<error-msg>`

Error message element which watches fields or fieldsets to see if they are invalid and displays the error if so. It will set the proper aria-labelledby attribute and aria-invalid attribute.

This element also allows checking groups of fields in a fieldset to see if a minimum number of of them are checked or have values filled in. For this you will need to add min or max attributes to the fieldset.

### Attributes

* watch - name of the field or fieldset to watch for changes

## `<action-fieldset>`

Field group which allows for hiding or showing based on watched fields or fieldsets. The showIf attribute watches for exact values unless regex is specified. If a group of named checkboxes, it will match as long as one checked checkbox matches.

### Attributes

* watch - name of the field or fieldset to watch for changes
* hidden - set initial display state to hidden
* showIf - value to watch for and if it matches then it will remove the hidden attribute
* regex - use regex for matching

## `<form-step>`

**TBD** - Create stepped forms

## `<form-progress>`

**TBD** - Progress bar for stepped forms

### TODO

- [x] Get error-msg working
- [x] Get error-msg working with checkbox groups
- [x] Get action-fieldset working to hide/show based on other fields value
- [x] Add ARIA to error messages. Need to sort out the best way to do this.
- [x] Get form-step working to hide/show based on if prior steps are completed
- [x] Get progress bar working
- [ ] Make it so that once invalid is triggered it then checks validation on input event
- [ ] Make sure that resetting the form also hides all error messages
- [ ] Need to test submitting the form and triggering errors
- [ ] QA all of it
- [ ] Clean up and DRY code
- [ ] QA Again

### Resources

* https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/
* https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-errormessage
* https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html