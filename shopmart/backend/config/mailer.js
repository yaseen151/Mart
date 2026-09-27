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

// ==========================================
// 1. SEND INVOICE (Professional HTML) 🧾
// ==========================================
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
                    <p style="margin: 0;">Need help? Contact us at <a href="mailto:support@shopmart.com" style="color: #023E36;">support@shopmart.com</a></p>
                    <p style="margin: 10px 0 0;">&copy; 2025 ShopMart Inc. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Detailed Invoice sent to ${userEmail}`);
    } catch (error) {
        console.error('❌ Error sending invoice:', error);
    }
};

// ==========================================
// 2. SEND LOGIN OTP 🔑
// ==========================================
const sendLoginOTP = async (userEmail, otp) => {
    const mailOptions = {
        from: '"ShopMart Security" <no-reply@shopmart.com>',
        to: userEmail,
        subject: `Your Login Code: ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #023E36;">ShopMart Login</h2>
                <p>Use this code to verify your login:</p>
                <h1 style="color: #F49D37; letter-spacing: 5px; font-size: 3rem; margin: 10px 0;">${otp}</h1>
                <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
            </div>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Login OTP sent to ${userEmail}`);
    } catch (error) {
        console.error('❌ Error sending Login OTP:', error);
    }
};

// ==========================================
// 3. SEND PASSWORD RESET OTP 🔒
// ==========================================
// This matches the function name used in 'authController.js'
const sendOtpEmail = async (userEmail, otp) => {
    const mailOptions = {
        from: '"ShopMart Security" <no-reply@shopmart.com>',
        to: userEmail,
        subject: 'Reset Your Password - ShopMart',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                <h2 style="color: #2d1b69; text-align: center;">Password Reset</h2>
                <p style="color: #333;">You requested to reset your password. Use the OTP below to proceed.</p>
                
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 28px; font-weight: bold; background: #f3f4f6; padding: 15px 30px; border-radius: 8px; color: #2d1b69; letter-spacing: 3px;">
                        ${otp}
                    </span>
                </div>

                <p style="color: #666; font-size: 13px;">If you did not request this change, please ignore this email.</p>
            </div>
        `
    };
    try { 
        await transporter.sendMail(mailOptions); 
        console.log(`✅ Password Reset OTP sent to ${userEmail}`);
    } catch(e) { 
        console.error('❌ Error sending Reset OTP:', e); 
    }
};

module.exports = { sendInvoice, sendLoginOTP, sendOtpEmail };