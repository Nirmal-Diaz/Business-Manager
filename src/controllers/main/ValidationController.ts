export class ValidationController {
    //WARNING: This method directly alters the parameters provided
    static validateBindingObject(serverObject, clientBindingObject) {
        //NOTE: Validation is done considering the serverBindingObject as it always has the correct structure
        if (Array.isArray(serverObject)) {
            //Case: serverBindingObject is an array
            //NOTE: serverBindingObject only contains one reference element for all the elements inside clientBindingObject
            const stringifiedReferenceElement = JSON.stringify(serverObject[0]);
            //Validate each element inside clientBindingObject against referenceElement
            for (let i = 0; i < clientBindingObject.length; i++) {
                serverObject[i] = JSON.parse(stringifiedReferenceElement);
                this.validateBindingObject(serverObject[i], clientBindingObject[i]);
            }
        } else {
            //NOTE: serverBindingObject has the correct patterns. clientBindingObject's patterns may be altered
            //NOTE: clientBindingObject's values will be copied to serverBindingObject
            for (const key of Object.keys(serverObject)) {
                if (clientBindingObject.hasOwnProperty(key)) {
                    //Case: clientBindingObject has the same key as serverBindingObject
                    if (serverObject[key].hasOwnProperty("childFormObject") && serverObject[key].childFormObject === true) {
                        //Case: Key holds an entire new formObject
                        ValidationController.validateBindingObject(serverObject[key], clientBindingObject[key]);
                    } else {
                        //Case: Key holds a formField object
                        //Check if the clientFormField has its pattern and value properties present
                        if (clientBindingObject[key].hasOwnProperty("pattern") && clientBindingObject[key].hasOwnProperty("value")) {
                            if (serverObject[key].pattern !== null) {
                                //Case: formField object have a pattern to validate its value
                                //Validate the clientFormField.value against serverFormField.pattern
                                const regexp = new RegExp(serverObject[key].pattern);
                                if (regexp.test(clientBindingObject[key].value)) {
                                    //Case: clientFormField.value is valid
                                    //Copy that value to serverFormField.value

                                    //WARNING: serverObject's structure will be altered here
                                    //NOTE: serverObject[key] will no longer hold a formFiled object
                                    //NOTE: serverObject[key] will hold it's relevant value directly
                                    serverObject[key] = clientBindingObject[key].value;
                                } else {
                                    //Case: clientFormField.value is invalid
                                    throw { title: "Whoa! Invalid data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us contain invalid data. This is unusual and we recommend you to check your system for malware", technicalMessage: "Invalid form field data detected" };
                                }
                            }
                        } else {
                            throw { title: "Whoa! Suspicious data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us doesn't have the required fields for us to validate. This is unusual and we recommend you to check your system for malware", technicalMessage: "Altered form field objects detected" };
                        }
                    }
                } else {
                    throw { title: "Whoa! Suspicious data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us doesn't have the required fields for us to validate. This is unusual and we recommend you to check your system for malware", technicalMessage: "Altered form objects detected" };
                }
            }
        }
    }

    //WARNING: This method requires a validated serverBindingObject
    static updateOriginalObject(originalObject, serverObject) {
        for (const key of Object.keys(serverObject)) {
            if (typeof serverObject[key] === "object" && !Array.isArray(serverObject[key])) {
                //Case: Key holds an entire new formObject
                this.updateOriginalObject(originalObject[key], serverObject[key]);
            } else {
                //Case: Key holds just a value
                originalObject[key] = serverObject[key];
            }
        }
    }
}