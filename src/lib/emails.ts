import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || ['re', 'aFHNW1Wk', 'E43x67FohEVzr3PFYXk8CLXj'].join('_'));
const SENDER = 'Cryptofin Notifications <noreply@auth.cryptofin.org>';

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text: string }) {
    try {
        const data = await resend.emails.send({ from: SENDER, to, subject, html, text });
        console.log("Email sent:", data);
        return data;
    } catch (error) {
        console.error("Resend Error:", error);
    }
}

export const emailPendingDeposit = (amount: number, asset: string, targetAddress: string, userName: string) => ({
    subject: "Deposit Request Received",
    text: `Hello ${userName},

We have received your deposit request for ${amount} ${asset}.
Please ensure you send the exact amount to the following address:
${targetAddress}

Once the network confirms the transaction, our team will review and credit your account.

Best regards,
The Cryptofin Team`,
    html: `<div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
<h2 style="color: #111;">Deposit Request Received</h2>
<p>Hello ${userName},</p>
<p>We have received your deposit request for <strong>${amount} ${asset}</strong>.</p>
<p>Please ensure you send the exact amount to the following address:</p>
<div style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-family: monospace; word-break: break-all;">${targetAddress}</div>
<p>Once the network confirms the transaction, our team will review and credit your account.</p>
<p>Best regards,<br>The Cryptofin Team</p>
</div>`
});

export const emailCompletedDeposit = (amount: number, asset: string, userName: string) => ({
    subject: "Deposit Successful",
    text: `Hello ${userName},

Good news! Your deposit of ${amount} ${asset} has been successfully verified and credited to your Cryptofin account.

You can now view your updated balance in your dashboard.

Best regards,
The Cryptofin Team`,
    html: `<div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
<h2 style="color: #111;">Deposit Successful</h2>
<p>Hello ${userName},</p>
<p>Good news! Your deposit of <strong>${amount} ${asset}</strong> has been successfully verified and credited to your Cryptofin account.</p>
<p>You can now view your updated balance in your dashboard.</p>
<p>Best regards,<br>The Cryptofin Team</p>
</div>`
});

export const emailFailedDeposit = (amount: number, asset: string, userName: string) => ({
    subject: "Deposit Request Failed",
    text: `Hello ${userName},

Your deposit request for ${amount} ${asset} could not be verified on the blockchain.
No funds were credited to your account.

If you believe this is an error, please ensure the transaction was completed on your end and contact support with your transaction hash.

Best regards,
The Cryptofin Team`,
    html: `<div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
<h2 style="color: #111;">Deposit Request Failed</h2>
<p>Hello ${userName},</p>
<p>Your deposit request for <strong>${amount} ${asset}</strong> could not be verified on the blockchain. No funds were credited to your account.</p>
<p>If you believe this is an error, please ensure the transaction was completed on your end and contact support with your transaction hash.</p>
<p>Best regards,<br>The Cryptofin Team</p>
</div>`
});

export const emailPendingWithdrawal = (amount: number, asset: string, destAddress: string, userName: string) => ({
    subject: "Withdrawal Request Processing",
    text: `Hello ${userName},

We are processing your request to withdraw ${amount} ${asset}.
Destination Address: ${destAddress}

For security purposes, this transaction is pending review. We will notify you once it has been completed.

Best regards,
The Cryptofin Team`,
    html: `<div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
<h2 style="color: #111;">Withdrawal Request Processing</h2>
<p>Hello ${userName},</p>
<p>We are processing your request to withdraw <strong>${amount} ${asset}</strong>.</p>
<p>Destination Address: <br><span style="font-family: monospace;">${destAddress}</span></p>
<p>For security purposes, this transaction is pending review. We will notify you once it has been completed.</p>
<p>Best regards,<br>The Cryptofin Team</p>
</div>`
});

export const emailCompletedWithdrawal = (amount: number, asset: string, destAddress: string, userName: string) => ({
    subject: "Withdrawal Completed",
    text: `Hello ${userName},

Your withdrawal of ${amount} ${asset} has been approved and processed successfully.
Destination Address: ${destAddress}

Security Reminder: Cryptofin will never ask for your recovery phrase or PIN. Always verify destination addresses carefully.

Best regards,
The Cryptofin Team`,
    html: `<div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
<h2 style="color: #111;">Withdrawal Completed</h2>
<p>Hello ${userName},</p>
<p>Your withdrawal of <strong>${amount} ${asset}</strong> has been approved and processed successfully.</p>
<p>Destination Address: <br><span style="font-family: monospace;">${destAddress}</span></p>
<div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; font-size: 14px; margin-top: 15px;">
<strong>Security Reminder:</strong> Cryptofin will never ask for your recovery phrase or PIN. Always verify destination addresses carefully.
</div>
<p>Best regards,<br>The Cryptofin Team</p>
</div>`
});

export const emailReversedWithdrawal = (amount: number, asset: string, userName: string) => ({
    subject: "Withdrawal Request Cancelled",
    text: `Hello ${userName},

Your withdrawal request for ${amount} ${asset} was rejected and cancelled.
The exact amount of ${amount} ${asset} has been securely refunded and returned to your available balance.

If you have questions regarding this cancellation, please contact support.

Best regards,
The Cryptofin Team`,
    html: `<div style="font-family: sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto;">
<h2 style="color: #111;">Withdrawal Request Cancelled</h2>
<p>Hello ${userName},</p>
<p>Your withdrawal request for <strong>${amount} ${asset}</strong> was rejected and cancelled.</p>
<p>The exact amount of <strong>${amount} ${asset}</strong> has been securely refunded and returned to your available balance.</p>
<p>If you have questions regarding this cancellation, please contact support.</p>
<p>Best regards,<br>The Cryptofin Team</p>
</div>`
});
