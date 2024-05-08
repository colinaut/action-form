# Action Form Data

Enhanced reactive FormData

## FormData and the Form DOM element

* FormData is a special collection type used by the form and used for submitting. It can be appended to or editted via Javascript.
  * (new FormData(form)).getAll(name) returns string[] of all the field values for that name; Checkboxes and radio buttons only return values if checked.
  * (new FormData(form)).keys() returns an iterator of all the FormData keys (names)
  * (new FormData(form)).entries() returns an iterator of key value pairs but if there is more than one entry for a given name then it will return each entry with each value. This is useful for text inputs but less so for checkboxes. Or maybe not? Maybe it is fine for them too? Might need to rethink stuff.
* [form.elements](https://www.w3schools.com/jsref/coll_form_elements.asp) returns an collection of all elements in the form ordered by appearance. Only input, select, textarea and button count.
  * [index] and item(index) returns the element at the specified index
  * namedItem(id) returns the element with the specified id (not name oddly)

## Extra FormData methods

* entiresObject creates an object with the keys as names and values as string[]

```javascript
const form = document.querySelector('form');
const formData = new FormData(form);

function entriesObject(formData) {
   let tempObject = {};
    formData.keys().forEach(key => {
        if (!formData.hasOwn(key)) {
            tempObject[key] = formData.getAll(key);
        }
    });
    return tempObject;
}
```

## Useful properties

* Knowing if an input is a checkbox or radio button
* Detecting if is valid or disabled

## Thoughts

* Current FormData is just a collection of keys and values
  * Empty fields are not included
  * Disabled fields are not included
  * Checkboxes and radio buttons values are only included if checked (unchecked counts as empty)
  * Checkboxes and radio buttons without values default to the value of "on"
  * If more than one field has the same name it has multiple entries that generally can only be accessed with getAll() or values()
* What is missing:
  * Reference to the form element itself
  * Indication if the field is valid or not
* Required for error handling:
  * Validity on change based on id/ref
  * Might not really need this feature
* Required for mirroring content (based on name)
  * Content on change or input
  * Multiple fields of same name are changed to comma separated list
* Required for af-step and submit error handling
  * Validity based on if it is a child of step or form element
  * Reference to the form element for focusing