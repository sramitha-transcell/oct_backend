import axios from "axios";

//================================== for email sending =====================

async function sendEmailUsingMSG91(templateId: any,from_name: any,from_email: any,domain: any,auth_key: any,email_url: any,recipientEmail: any, shortUrl: any,  variable_details:any) {
    try {
        console.log("sendEmailUsingMSG91---------",templateId,from_name,from_email,domain,auth_key,email_url,recipientEmail, shortUrl);
        
        console.log("Sending EMAIL...",variable_details);
        
        const url = email_url; // Set the MSG91 email sending endpoint

        const data:any = {
            recipients: [
                {
                    to: [{ email: recipientEmail  }],
                    // variable_details is already built in email_or_sms.ts to contain only
                    // the variables needed for this template (per EMAIL_VARIABLES config)
                    variables: variable_details
                }
            ],
            from: {
                name: from_name,
                email:from_email
            },
            domain: domain,
           
            template_id: templateId
        };


        if (shortUrl) {
            data.short_url = '1';
        } else {
            data.short_url = '0';
        }

        const headers = {
            'accept': 'application/json',
            'authkey':auth_key, // Set your MSG91 email auth key
            'content-type': 'application/json'
        };
        console.log("email data == >",JSON.stringify(data))
        const response = await axios.post(url, data, { headers });

        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error:any) {
        console.log("error-----------------", error);
        
        console.error('Error sending email:', error.response ? error.response.data : error.message);
        return error.response.data ;
    }
}



//================================== for sms sending =====================

async function sendSMSUsingMSG91(
    templateId: any, 
    recipientMobile: string, 
    auth_key: any, 
    mobile_url: any, 
    shortUrl: any, 
    variable_details: any
) {
    try {
        console.log("Sending SMS...",variable_details);

        const url = mobile_url;

        const data = {
            template_id: templateId,
            short_url: shortUrl ? '1' : '0', // Convert to '1' (On) or '0' (Off) as string
            recipients: [
                {
                    mobiles: "91" + recipientMobile,
                    // email_or_sms.ts already built variable names (name, alphanumeric, number, etc.)
                    // matching MSG91 template placeholders. Just forward them.
                    ...variable_details,
                }
            ]
        };

        console.log("SMS payload == >", JSON.stringify(data));

        const headers = {
            accept: 'application/json',
            authkey: auth_key,
            'content-type': 'application/json',
        };

        const options = {
            method: 'POST',
            url: url,
            headers: headers,
            data: data,
        };
        console.log("SMS options == >", JSON.stringify(options));

        const response = await axios(options);
        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        return error.response?.data;
    }
}


export {
    sendSMSUsingMSG91,
    sendEmailUsingMSG91
}