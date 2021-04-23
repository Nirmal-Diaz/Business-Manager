import * as nodemailer from "nodemailer";

export class MailController {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'official.cyberspacetechnologies@gmail.com',
            pass: '123Nd.Sf123'
        }
    });

    static async sendTemporalPassword(email, temporalPassword) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: "nirmaldiaz@gmail.com",
            subject: 'Temporal authentication code for Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd, </br>Weliveriya, </br>Gampaha</p>
            
            <h3>Here is your temporal authentication code</h3>

            <p>Dear employee, </br>Please type the following temporal authentication code in the prompt to login to your user account. Please note that this code can be used only once and within a period of 15 minutes. We strongly recommend you to change your pattern after you log in.</p>

            <h3>${temporalPassword}</h3>
                
            <p>Yours sincerely,</br>Systems administrator</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Couldn't mail", titleDescription: "Contact your system administrator", message: `We couldn't send the temporal password to ${email}. But don't worry, your system administrator can reset the password for you.`, technicalMessage: "Couldn't send mail with temporal password" };
            }

            return true;
        });
    }

    static async sendCustomerGreeting(email, personName, businessName) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: "nirmaldiaz@gmail.com",
            subject: 'You have been registered at Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd, </br>Weliveriya, </br>Gampaha</p>
            
            <h3>You have been registered as a customer</h3>

            <p>Hello ${personName} of ${businessName}, </br>This is to notify that your company has been successfully registered as a customer in our company. Thank you for choosing us and we hope that you will choose us again.</p>
            
            </br></br>
                
            <p>Yours sincerely, </br>Manger of external relationships</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send the customer greetings email to ${email}`, technicalMessage: "Couldn't send mail with customer greetings" };
            }
        });

        return true;
    }

    static async sendSupplierGreeting(email, personName, businessName) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: "nirmaldiaz@gmail.com",
            subject: 'You have been registered at Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd, </br>Weliveriya, </br>Gampaha</p>
            
            <h3>You have been registered as a supplier</h3>

            <p>Hello ${personName} of ${businessName},</br>This is to notify that your company has been successfully registered as a supplier in our company. We are happy to have you as a supplier and we are looking forward to initiate business with you.</p>
                
            <p>Yours sincerely, </br>Manger of external relationships</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log({ title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send the supplier greetings email to ${email}`, technicalMessage: "Couldn't send mail with supplier greetings"});
            }
        });

        return true;
    }

    static async sendMaterialImportRequest(email, materialImportRequest) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: "nirmaldiaz@gmail.com",
            subject: 'Quotation request from Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd, </br>Weliveriya, </br>Gampaha</p>
        
            <p>${materialImportRequest.supplier.personName}</br>Exports Manager</br>${materialImportRequest.supplier.businessName}</br>${materialImportRequest.supplier.address}</p>
            
            <h3>Your quotation is needed</h3>

            <p>We kindly request you to send us your quotation to be considered in our next material purchase. Please refer the following table.</p>
        
            <table border="1">
            <tbody>
                <tr>
                    <th>Our reference</th><td>${materialImportRequest.code}</td>
                </tr>
                <tr>
                    <th>Wanted material</th><td>${materialImportRequest.material.name}</td>
                </tr>
                <tr>
                    <th>Wanted by</th><td>${materialImportRequest.wantedBy}</td>
                </tr>
            </tbody>
            </table>
                
            <p>Yours sincerely, </br>Manager of imports and exports</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log({ title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send material import request email to ${email}`, technicalMessage: "Couldn't send mail with material import request" });
            }
        });

        return true;
    }

    static async sendMaterialImportOrder(email, materialImportOrder) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: "nirmaldiaz@gmail.com",
            subject: 'Quotation request from Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd, </br>Weliveriya, </br>Gampaha</p>
        
            <p>${materialImportOrder.supplier.personName}</br>Exports Manager</br>${materialImportOrder.supplier.businessName}</br>${materialImportOrder.supplier.address}</p>
            
            <h3>Your quotation is needed</h3>

            <p>We've selected you for our next material purchase. Please refer the following table for the order details.</p>
        
            <table border="1">
            <tbody>
                <tr>
                    <th>Our reference</th><td>${materialImportOrder.code}</td>
                </tr>
                <tr>
                    <th>Wanted material</th><td>${materialImportOrder.quotationCode2.requestCode2.material.name}</td>
                </tr>
                <tr>
                    <th>Wanted by</th><td>${materialImportOrder.wantedBy}</td>
                </tr>
            </tbody>
            </table>
                
            <p>Yours sincerely, </br>Manager of imports and exports</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log({ title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send material import request email to ${email}`, technicalMessage: "Couldn't send mail with material import request" });
            }
        });

        return true;
    }
}