//@ts-check
import { FormUtil, FormComponent } from "./Utility.js";

export class Form {
    bindingObject = null;
    referenceBindingObject = null;
    invalidBindingObject = false;
    submissionMethod = "";
    submissionURL = "";

    view = null;

    constructor(formView) {
        //Initialize/cache view elements
        this.view = formView;
    }

    //WARNING: This method returns a promise that resolves to "this". Use it asynchronously
    //NOTE: It is done because of there are other methods on popUpCardInterfaces that rely on the bindingObject
    init(bindingObjectURL, submissionURL, submissionMethod) {
        this.submissionURL = submissionURL;
        this.submissionMethod = submissionMethod;
        //Load bindingObject
        return fetch(bindingObjectURL)
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    this.bindingObject = response.data;
                    this.referenceBindingObject = response.data;
                    //Add onclick to each dropDownInput's reload button for updating values in realtime
                    const reloadButtons = this.view.querySelectorAll(".inputContainer.dropDown>button");
                    for (const reloadButton of reloadButtons) {
                        reloadButton.addEventListener("click", (event) => {
                            //NOTE: A button inside a form just inherently submits the form. It should be prevented
                            event.preventDefault();
                            FormComponent.refreshDropDownInput(reloadButton.previousElementSibling);
                        });
                    }
                    
                    //Add onkeyup to each textInput for validate itself in realtime
                    const textInputs = this.view.querySelectorAll(".inputContainer.text>input");
                    for (const textInput of textInputs) {
                        textInput.addEventListener("keyup", () => {
                            FormUtil.validateAndVisualizeField(this.view, this.bindingObject[textInput.id], true);
                        });
                    }

                    //Add onchange to each imageInput to update dataset values
                    const imageInputs = this.view.querySelectorAll(".inputContainer.image>input");
                    for (const imageInput of imageInputs) {
                        imageInput.addEventListener("change", () => {
                            const imageBlob = imageInput.files[0];

                            //NOTE: To improve performance, blobs representations must be strings rather than arrays
                            imageBlob.arrayBuffer().then((blobArrayBuffer) => {
                                imageInput.dataset.stringifiedBlob = JSON.stringify(Array.from(new Uint8Array(blobArrayBuffer)));
                            });
                            imageInput.dataset.size = imageBlob.size;
                            imageInput.dataset.type = imageBlob.type;

                            //Update the sibling img
                            imageInput.previousElementSibling.src = URL.createObjectURL(imageBlob);
                        });
                        //Add onclick to sibling img tag for triggering the click event on the imageInput
                        imageInput.previousElementSibling.addEventListener("click", () => {
                            imageInput.click();
                        });
                    }


                    return this;
                } else {
                    return null;
                }
            })
            .catch(error => {
                window.parent.shellInterface.throwAlert("Aw! snap", "Contact your system administrator", "We couldn't fetch required binding object from the internal registry. The most likely cause may be a network failure. If it is not the case, provide your system administrator with the following error\n\n" + error, null, "OK", null);
            });
    }

    getView() {
        return this.view;
    }

    getSubmissionMethod() {
        return this.submissionMethod;
    }

    getReferenceBindingObject() {
        return this.referenceBindingObject;
    }

    getBindingObject() {
        return this.bindingObject;
    }

    //NOTE: Use this before updating inputs of an "update" form
    //NOTE: When requesting objects from the server, they are plain objects (objects with only data). But forms work with bindingObjects (objects that have validation and view binding capabilities along with data)
    mapToBindingObject(bindingObject = this.bindingObject, plainObject) {
        //NOTE: Binding object doesn't have an "id" formField. But most of the plain objects has it
        //NOTE: If the plain object doesn't need an id field. This will be automatically discarded
        bindingObject.id = {
            inputQuery: null,
            inputClass: null,
            pattern: "^[1-9]{1,}$",
            value: plainObject.id
        };

        for (const key of Object.keys(bindingObject)) {
            if (bindingObject[key].hasOwnProperty("childFormObject") && bindingObject[key].childFormObject === true) {
                //CASE: Key holds an entire new formObject
                this.mapToBindingObject(bindingObject[key].value, plainObject[key]);
            } else {
                FormUtil.mapPlainFieldToFormField(plainObject[key], bindingObject[key]);
            }
        }
    }

    //WARNING: Doesn't work when deSyncedObject is an array
    //NOTE: Use this before submitting a "create" form
    updateBindingObject(bindingObject = this.bindingObject) {
        if (Array.isArray(bindingObject)) {
            //CASE: deSyncedObject is an array
            //Cannot update elements inside arrays
        } else {
            //CASE: deSyncedObject is an object
            for (const key of Object.keys(bindingObject)) {
                if (bindingObject[key].hasOwnProperty("childFormObject") && bindingObject[key].childFormObject === true) {
                    //CASE: Key holds an entire new formObject
                    this.updateBindingObject(bindingObject[key].value);
                } else {
                    //CASE: Key holds a formField object
                    if (bindingObject[key].inputQuery !== null) {
                        //CASE: Field of the formObject have a binding input
                        //Load the value of the input to the binding field
                        FormUtil.updateValueFromInput(this.view, bindingObject[key]);
                    }
                }
            }
        }
    }

    //NOTE: Use this immediately after constructing an "update" form
    updateInputs(bindingObject = this.bindingObject) {
        for (const key of Object.keys(bindingObject)) {
            if (bindingObject[key].hasOwnProperty("childFormObject") && bindingObject[key].childFormObject === true) {
                //CASE: Key holds an entire new formObject
                this.updateInputs(bindingObject[key].value);
            } else {
                //CASE: Key holds a formField object
                if (bindingObject[key].inputQuery !== null) {
                    //CASE: Field of the formObject have a binding input
                    FormUtil.updateInputFromValue(this.view, bindingObject[key], null);
                }
            }
        }
    }

    resetInputs(bindingObject = this.bindingObject) {
        for (const key of Object.keys(bindingObject)) {
            if (bindingObject[key].hasOwnProperty("childFormObject") && bindingObject[key].childFormObject === true) {
                //CASE: Key holds an entire new formObject
                this.resetInputs(bindingObject[key].value);
            } else {
                //CASE: Key holds a formField object
                if (bindingObject[key].inputClass !== null) {
                    FormUtil.resetInput(this.view, bindingObject[key]);
                }
            }
        }
    }

    //NOTE: Use this before submitting any form
    validateBindingObject(referenceBindingObject = this.referenceBindingObject, alteredBindingObject = this.bindingObject) {
        //NOTE: Validation is done against the referenceObject as it has the correct structure
        if (Array.isArray(referenceBindingObject)) {
            //CASE: referenceObject is an array
            //NOTE: referenceObject only contains one reference element for all the elements inside alteredObject
            const referenceElement = referenceBindingObject[0];
            //Validate each element inside alteredObject against referenceElement
            for (const bindingObjectElement of alteredBindingObject) {
                this.validateBindingObject(referenceElement, bindingObjectElement)
            }
        } else {
            //CASE: referenceObject is an object
            for (const key of Object.keys(referenceBindingObject)) {
                if (referenceBindingObject[key].hasOwnProperty("childFormObject") && referenceBindingObject[key].childFormObject === true) {
                    //CASE: Key holds an entire new formObject
                    this.validateBindingObject(referenceBindingObject[key].value, alteredBindingObject[key].value);
                } else {
                    //CASE: Key holds a formField object
                    if (referenceBindingObject[key].pattern !== null) {
                        //CASE: formField object must have a pattern to match

                        //NOTE: this.invalidBindingObject must contain the OR value of each field validation
                        this.invalidBindingObject = this.invalidBindingObject || FormUtil.validateAndVisualizeField(this.view, alteredBindingObject[key], false);
                    }
                }
            }
        }
    }

    async submit(additionalData = {}) {
        this.updateBindingObject(this.bindingObject);

        //Reset invalidBindingObject flag
        this.invalidBindingObject = false;
        this.validateBindingObject(this.referenceBindingObject, this.bindingObject);

        if (this.invalidBindingObject) {
            return {
                status: false,
                error: {
                    title: "There are invalid values", titleDescription: "Please correct them", message: "Your form includes one or more fields with invalid values. Correcting them is compulsory before submitting the form. Check for red bounding boxes to find inputs with invalid values"
                }
            };
        } else {
            return fetch(this.submissionURL, {
                method: this.submissionMethod,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bindingObject: this.bindingObject,
                    additionalData: additionalData
                })
            })
                .then(response => response.json())
                .then(response => response)
                .catch(error => {
                    return {
                        status: false,
                        error: error
                    };
                });
        }
    }
}