import { Resend } from 'resend';

// Make sure process.env.RESEND_API_KEY exists
const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = 'Cryptofin Notifications <noreply@auth.cryptofin.org>';

export async function sendEmail({ to, subject, text }: { to: string, subject: string, text: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is missing. Email skipped:", subject);
        return;
    }
    
    try {
        const data = await resend.emails.send({
            from: SENDER,
            to,
            subject,
            text
        });
        console.log("Email sent:", data);
        return data;
    } catch (error) {
        console.error("Resend Error:", error);
    }
}

// 1. Pending Deposit
export const emailPendingDeposit = (amount: number, asset: string, targetAddress: string) => ({
    subject: "Deposit Request Received",
    text: Hello,

We have received your deposit request for \ \. 
Please ensure you send the exact amount to the following address:

Once the network confirms the transaction, our team will review and credit your account. 

Best regards,
The Cryptofin Team
});

// 2. Completed Deposit
export const emailCompletedDeposit = (amount: number, asset: string) => ({
    subject: "Deposit Successful",
    text: Hello,

Good news! Your deposit of \ \ has been successfully verified and credited to your Cryptofin account.

You can now view your updated balance in your dashboard.

Best regards,
The Cryptofin Team
});

// 3. Failed Deposit
export const emailFailedDeposit = (amount: number, asset: string) => ({
    subject: "Deposit Request Failed",
    text: Hello,

Your deposit request for \ \ could not be verified on the blockchain. 
No funds were credited to your account.

If you believe this is an error, please ensure the transaction was completed on your end and contact support with your transaction hash.

Best regards,
The Cryptofin Team
});

// 4. Pending Withdrawal
export const emailPendingWithdrawal = (amount: number, asset: string, destAddress: string) => ({
    subject: "Withdrawal Request Processing",
    text: Hello,

We are processing your request to withdraw \ \.
Destination Address: 
For security purposes, this transaction is pending review. We will notify you once it has been completed.

Best regards,
The Cryptofin Team
});

// 5. Completed Withdrawal
export const emailCompletedWithdrawal = (amount: number, asset: string, destAddress: string) => ({
    subject: "Withdrawal Completed",
    text: Hello,

Your withdrawal of \ \ has been approved and processed successfully.
Destination Address: 
Security Reminder: Cryptofin will never ask for your recovery phrase or PIN. Always verify destination addresses carefully.

Best regards,
The Cryptofin Team
});

// 6. Reversed Withdrawal
export const emailReversedWithdrawal = (amount: number, asset: string) => ({
    subject: "Withdrawal Request Cancelled",
    text: Hello,

Your withdrawal request for \ \ was rejected and cancelled.
The exact amount of \ \ has been securely refunded and returned to your available balance.

If you have questions regarding this cancellation, please contact support.

Best regards,
The Cryptofin Team
});
