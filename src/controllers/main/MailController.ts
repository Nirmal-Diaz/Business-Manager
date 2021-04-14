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
            subject: 'Your temporal password for Thames Coating International',
            html: `<h1>${temporalPassword}</h1><p>Please use this password within 5 minutes of generation</p><p>This can be used only once</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Oops!", titleDescription: "Contact your system administrator", message: `We couldn't send the temporal password to ${email}. But don't worry, your system administrator can reset the password for you.`, technicalMessage: `Couldn't send temporal password` };
            } else {
                return true;
            }
        });
    }

    static async sendCustomerGreeting(email, personName, businessName) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: email,
            subject: 'You have be registered at Thames Coating International',
            html: `<h1>Hello ${personName} od ${businessName}</h1><p>This is to notify that your company has be successfully registered.</p><p>We are happy to have you as a customer</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Oops!", titleDescription: "Couldn't send email", message: `We couldn't send the greeting email to ${email}`, technicalMessage: `Couldn't send greetings email` };
            } else {
                return true;
            }
        });
    }

    static async sendSupplierGreeting(email, personName, businessName) {
        const mailOptions = {
            from: 'official.cyberspacetechnologies@gmail.com',
            to: email,
            subject: 'You have be registered at Thames Coating International',
            html: `<h1>Hello ${personName} od ${businessName}</h1><p>This is to notify that your company has be successfully registered.</p><p>We are happy to have you as a supplier</p>`
        };

        MailController.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw { title: "Oops!", titleDescription: "Couldn't send email", message: `We couldn't send the greeting email to ${email}`, technicalMessage: `Couldn't send greetings email` };
            } else {
                return true;
            }
        });
    }

    static async sendQuotationRequest(email, serverObject) {

    }
}