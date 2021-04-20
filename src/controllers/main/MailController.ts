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
            to: email,
            subject: 'Temporal authentication code for Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd.</p>
            <p>Weliveriya</p>
            <p>Gampaha</p>
        
            </br></br>
            
            <h3>Here is your temporal authentication code</h3>
            <p>Dear employee,</p><p>Please type the following temporal authentication code in the prompt to login to your user account.</p><p>Please note that this code can be used only once and within a period of 15 minutes.</p><p>We strongly recommend you to change your pattern after you log in.</p>
            
            </br></br>

            <h3>${temporalPassword}</h3>

            </br></br>
                
            <p>Yours sincerely,</p>
            <p>Systems administrator</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Couldn't mail", titleDescription: "Contact your system administrator", message: `We couldn't send the temporal password to ${email}. But don't worry, your system administrator can reset the password for you.`, technicalMessage: `Couldn't send temporal password` };
            } else {
                return true;
            }
        });
    }

    static async sendCustomerGreeting(email, personName, businessName) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: email,
            subject: 'You have been registered at Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd.</p>
            <p>Weliveriya</p>
            <p>Gampaha</p>
        
            </br></br>
            
            <h3>You have been registered as a customer</h3>
            <p>Hello ${personName} of ${businessName}</p><p>This is to notify that your company has been successfully registered as a customer in our company.</p><p>Thank you for choosing us and we hope that you will choose us again.</p>
            
            </br></br>
                
            <p>Yours sincerely,</p>
            <p>Manger of external relationships</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send the greeting email to ${email}`, technicalMessage: `Couldn't send greetings email` };
            } else {
                return true;
            }
        });
    }

    static async sendSupplierGreeting(email, personName, businessName) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: email,
            subject: 'You have been registered at Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd.</p>
            <p>Weliveriya</p>
            <p>Gampaha</p>
        
            </br></br>
            
            <h3>You have been registered as a supplier</h3>
            <p>Hello ${personName} of ${businessName}</p><p>This is to notify that your company has been successfully registered as a supplier in our company.</p><p>We are happy to have you as a supplier and we are looking forward to initiate business with you.</p>
            
            </br></br>
                
            <p>Yours sincerely,</p>
            <p>Manger of external relationships</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send the greeting email to ${email}`, technicalMessage: `Couldn't send greetings email` };
            } else {
                return true;
            }
        });
    }

    static async sendMaterialImportRequest(email, materialImportRequest) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: "nirmaldiaz@gmail.com",
            subject: 'Quotation request from Thames Coating International',
            html: `
            <p>Thames Coating International Pvt. Ltd.</p>
            <p>Weliveriya</p>
            <p>Gampaha</p>
        
            </br></br>
        
            <p>${materialImportRequest.supplier.personName}</p>
            <p>Exports Manager</p>
            <p>${materialImportRequest.supplier.businessName}</p>
            <p>${materialImportRequest.supplier.address}</p>
        
            </br></br>
            
            <h3>Your quotation is needed</h3>
            <p>We kindly request you to send us your quotation to be considered in our next material purchase. Please refer the following table.</p>
        
            </br></br>
        
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
            
            </br></br>
                
            <p>Yours sincerely,</p>
            <p>Manager of imports and exports</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Couldn't mail", titleDescription: "We'll try again later", message: `We couldn't send the greeting email to ${email}`, technicalMessage: `Couldn't send greetings email` };
            } else {
                return true;
            }
        });
    }
}