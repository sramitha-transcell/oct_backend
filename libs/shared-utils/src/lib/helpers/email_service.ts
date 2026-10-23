import nodemailer, { Transporter } from 'nodemailer';

export interface EmailConfig {
    email: string;
    appPassword: string;
}

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    private transporter: Transporter;

    constructor(config: EmailConfig) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.appPassword
            }
        });
    }

    async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId: string }> {
        try {
            const mailOptions = {
                from: (this.transporter as any).options.auth.user,
                to: params.to,
                subject: params.subject,
                html: params.html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendOTPEmail(to: string, otp: string, userName: string, validMinutes: number): Promise<{ success: boolean; messageId: string }> {
        const subject = 'Your OTP for Transcell Login';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                    .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; letter-spacing: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>TRANSCELL</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${userName},</h2>
                        <p>You have requested to login to your Transcell account. Please use the following OTP to complete your login:</p>
                        <div class="otp">${otp}</div>
                        <p><strong>This OTP is valid for ${validMinutes} minutes.</strong></p>
                        <p>If you did not request this OTP, please ignore this email.</p>
                        <p>Thank you,<br>The Transcell Team</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({ to, subject, html });
    }
}
