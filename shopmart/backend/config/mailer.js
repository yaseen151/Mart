const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Send Professional Invoice
const sendInvoice = async (userEmail, userName, orderId, total, items, address) => {
    
    // Generate Table Rows for Items
    const itemsHtml = items.map(i => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #333;">${i.title}</td>
            <td style="padding: 10px; text-align: center; color: #333;">${i.qty}</td>
            <td style="padding: 10px; text-align: right; color: #333;">₹${i.price}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: '"ShopMart Vintage" <no-reply@shopmart.com>',
        to: userEmail,
        subject: `Order #${orderId} Confirmed! 📦`,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; background-color: #ffffff;">
                
                <div style="background-color: #023E36; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; letter-spacing: 1px;">ShopMart</h1>
                    <p style="color: #F49D37; margin: 5px 0 0; font-size: 14px; text-transform: uppercase;">Vintage Collection</p>
                </div>

                <div style="padding: 30px;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
                    <p style="color: #666; line-height: 1.6;">Thank you for your order! We are getting your vintage items ready for shipment. Here is your receipt.</p>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0; color: #333;"><strong>Order ID:</strong> #${orderId}</p>
                        <p style="margin: 5px 0; color: #333;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p style="margin: 5px 0; color: #333;"><strong>Shipping Address:</strong><br>${address}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #eee;">
                                <th style="padding: 10px; text-align: left; color: #555;">Item</th>
                                <th style="padding: 10px; text-align: center; color: #555;">Qty</th>
                                <th style="padding: 10px; text-align: right; color: #555;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <div style="text-align: right;">
                        <h3 style="color: #023E36; margin: 0;">Total Amount: <span style="color: #F49D37;">₹${total}</span></h3>
                    </div>
                </div>

                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p style="margin: 0;">Need help? Contact us at <a href="mailto:me.junaid.in@gmail.com" style="color: #023E36;">me.junaid.in@gmail.com</a></p>
                    <p style="margin: 10px 0 0;">&copy; 2025 ShopMart Inc. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Detailed Invoice sent to ${userEmail}`);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

// 2. Send OTP (Keep as is)
const sendOTP = async (userEmail, otp) => {
    const mailOptions = {
        from: '"ShopMart Security" <no-reply@shopmart.com>',
        to: userEmail,
        subject: `Your Login Code: ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd;">
                <h2 style="color: #023E36;">ShopMart Login</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <h1 style="color: #F49D37; letter-spacing: 5px; font-size: 3rem; margin: 10px 0;">${otp}</h1>
                <p style="color: #666;">This code expires in 10 minutes. Do not share it.</p>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
};

// 3. Send Password Reset (Keep as is)
const sendResetEmail = async (userEmail, tempPassword) => {
    const mailOptions = {
        from: '"ShopMart Security" <no-reply@shopmart.com>',
        to: userEmail,
        subject: 'Password Reset Request 🔐',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px;">
                <h2 style="color: #023E36;">Password Reset</h2>
                <p>You requested to reset your password.</p>
                <p>Your new temporary password is:</p>
                <h1 style="color: #F49D37; letter-spacing: 2px;">${tempPassword}</h1>
                <p>Please login and change this password immediately.</p>
            </div>
        `
    };
    try { await transporter.sendMail(mailOptions); } catch(e) { console.error(e); }
};

module.exports = { sendInvoice, sendOTP, sendResetEmail };