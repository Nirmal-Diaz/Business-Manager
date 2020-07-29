export class ValidationController {
    //WARNING: This method directly alters the parameters provided
    static validateBindingObject(serverObject, clientBindingObject) {
        //NOTE: Validation is done considering the serverBindingObject as it always has the correct structure
        if (Array.isArray(serverObject)) {
            //Case: serverBindingObject is an array
            //NOTE: serverBindingObject only contains one reference element for all the elements inside that array
            const stringifiedReferenceElement = JSON.stringify(serverObject[0]);
            //Validate each element inside clientBindingObject against referenceElement
            for (let i = 0; i < clientBindingObject.length; i++) {
                serverObject[i] = JSON.parse(stringifiedReferenceElement);
                this.validateBindingObject(serverObject[i], clientBindingObject[i]);
            }
        } else {
            //Case: serverBindingObject is an object
            //WARNING: serverBindingObject has the correct patterns. clientBindingObject's patterns may be altered
            for (const key of Object.keys(serverObject)) {
                if (clientBindingObject.hasOwnProperty(key)) {
                    //Case: clientBindingObject has the same key as serverBindingObject
                    if (serverObject[key]?.childFormObject === true) {
                        //Case: Key holds an entire new formObject
                        ValidationController.validateBindingObject(serverObject[key], clientBindingObject[key]);
                    } else {
                        //Case: Key holds a formField object
                        //Check if the clientFormField has its value property present
                        if (clientBindingObject[key].hasOwnProperty("value")) {
                            if (serverObject[key].pattern !== null) {
                                //Copy clientBindingObject's values to serverBindingObject after validating against the pattern
                                if (serverObject[key].inputClass === "image") {
                                    //WARNING: Server only validates the blob.size
                                    //TODO: Add blob.type validation to server side
                                    const parts = serverObject[key].pattern.split(";");
                                    const maxSize = parseInt(parts[0]);

                                    const imageBlob = Buffer.from(JSON.parse(clientBindingObject[key].value));
                                    if (imageBlob.length < maxSize && imageBlob.length === clientBindingObject[key].size) {
                                        //Case: clientFormField.value is valid
                                        //Copy that value to serverFormField.value

                                        //WARNING: serverObject's structure will be altered here
                                        //NOTE: serverObject[key] will no longer hold a formFiled object
                                        //NOTE: serverObject[key] will hold it's relevant blob directly
                                        serverObject[key] = imageBlob;
                                    } else {
                                        //Case: clientFormField.value is invalid
                                        throw { title: "Whoa! Invalid data detected", titleDescription: "Please contact your system administrator", message: "The form data you sent us contain invalid data. This is unusual and we recommend you to check your system for malware", technicalMessage: "Invalid form field data detected" };
                                    }
                                } else {
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
    //WARNING: This method doesn't change the value of the original field if the server field contains null
    static updateOriginalObject(originalObject, serverObject) {
        for (const key of Object.keys(serverObject)) {
            if (typeof serverObject[key] === "object" && serverObject[key] !== null && !Array.isArray(serverObject[key])) {
                //Case: Key holds an entire new formObject
                this.updateOriginalObject(originalObject[key], serverObject[key]);
            } else {
                //Case: Key holds just a value
                if (serverObject[key] !== null) {
                    originalObject[key] = serverObject[key];
                }
            }
        }
    }
}