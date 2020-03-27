//@ts-check
import { FormUtil } from "../../scripts/Utility.js";

export class Form {
    bindingObject = null;

    view = null;

    constructor(formView) {
        //Initialize/cache view elements
        this.view = formView;
    }

    //WARNING: This method returns a promise that resolves to "this". Use it asynchronously
    //NOTE: It is done because of there are other methods on popUpCardInterfaces that rely on the bindingObject
    init(bindingObjectFileName) {
        //Load bindingObject
        return fetch(`${location.protocol}//${location.host}/registry?fileName=${bindingObjectFileName}`)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    //NOTE: response.data is a stringified JSON and must be parsed
                    this.bindingObject = JSON.parse(response.data);
                    //Add onkeyup to each textInput for validate itself in realtime
                    const textInputs = this.view.querySelectorAll(".inputContainer>input[type='text']");
                    for (const textInput of textInputs) {
                        textInput.addEventListener("keyup", () => {
                            FormUtil.visualizeValidation(this.view, this.bindingObject[textInput.id], true);
                        });
                    }
                    return this;
                } else {
                    return null;
                }
            })
            .catch(error => {
                window.parent.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't fetch required file from the internal registry. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }

    getView() {
        return this.view;
    }

    getBindingObject() {
        return this.bindingObject;
    }

    //NOTE: Use this before submitting a "create" form
    updateBindingObject(formObject = this.bindingObject) {
        for (const key of Object.keys(formObject)) {
            if (formObject[key].hasOwnProperty("childFormObject") && formObject[key].childFormObject === true) {
                //Case: Key holds an entire new formObject
                this.updateBindingObject(formObject[key].value);
            } else {
                //Case: Key holds a formField object
                if (formObject[key].inputQuery !== null) {
                    //Case: Field of the formObject have a binding input
                    //Load the value of the input to the binding field
                    formObject[key].value = this.view.querySelector(formObject[key].inputQuery).value;
                }
            }
        }
    }

    //NOTE: Use this immediately after constructing an "update" form
    updateInputs(formObject = this.bindingObject) {
        for (const key of Object.keys(formObject)) {
            if (formObject[key].hasOwnProperty("childFormObject") && formObject[key].childFormObject === true) {
                //Case: Key holds an entire new formObject
                this.updateInputs(formObject[key].value);
            } else {
                //Case: Key holds a formField object
                if (formObject[key].inputQuery !== null) {
                    //Case: Field of the formObject have a binding input
                    FormUtil.syncInputWithValue(this.view, formObject[key], null);
                }
            }
        }
    }

    //NOTE: Use this before submitting any form
    validateBindingObject(formObject = this.bindingObject) {
        let hasInvalidValues = false;
        for (const key of Object.keys(formObject)) {
            if (formObject[key].hasOwnProperty("childFormObject") && formObject[key].childFormObject === true) {
                //Case: Key holds an entire new formObject
                this.validateBindingObject(formObject[key].value);
            } else {
                //Case: Key holds a formField object
                if (formObject[key].regex !== null) {
                    //Case: formField object have a pattern to match
                    const regexp = new RegExp(formObject[key].pattern);
                    if (!regexp.test(formObject[key].value) || formObject[key].value === "null") {
                        //Case: Invalid value found
                        hasInvalidValues = true;
                    }
                    if (formObject[key].inputQuery !== null) {
                        //Case: formField object have a pattern along with an input
                        FormUtil.visualizeValidation(this.view, formObject[key], false);
                    }
                }
            }
            if (hasInvalidValues) {
                window.parent.shellInterface.throwAlert("There are invalid values", "Please correct them", "Your form includes one or more fields with invalid values. Correcting them is compulsory before submitting the form. Check for red bounding boxes to find inputs with invalid values", null, "OK", null);
            }
        }
        return hasInvalidValues;
    }

    submit(requestPath) {
        this.updateBindingObject();
        const hasInvalidValues = this.validateBindingObject();
        if (!hasInvalidValues) {
            return fetch(`${location.protocol}//${location.host}${requestPath}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bindingObject: this.bindingObject
                })
            }).then(response => response.json()).then(response => {
                if (response.status) {
                    console.log("OK");
                } else {
                    window.parent.shellInterface.throwAlert(response.error.title, response.error.titleDescription, response.error.message, null, "OK", null);
                }
            }).catch(error => {
                window.parent.shellInterface.throwAlert("Oops! We couldn't fetch that", "Contact your system administrator", "We couldn't create that user in our database. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
        }
    }
}