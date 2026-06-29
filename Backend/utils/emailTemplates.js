export const otpEmailTemplate = (otp, type = "Verification") => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .logo { font-size: 24px; font-weight: bold; color: #16a34a; text-align: center; margin-bottom: 20px; }
    .title { font-size: 20px; color: #333; text-align: center; margin-bottom: 10px; }
    .message { color: #555; text-align: center; line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
    .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #16a34a; margin-bottom: 30px; }
    .footer { color: #888; text-align: center; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">KrishiPool</div>
    <div class="title">${type} Code</div>
    <div class="message">
      Please use the verification code below to complete your ${type.toLowerCase()}. 
      This code is valid for 10 minutes. Do not share it with anyone.
    </div>
    <div class="otp-box">${otp}</div>
    <div class="message" style="font-size: 14px;">
      If you didn't request this, you can safely ignore this email.
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} KrishiPool. All rights reserved.<br/>
      Rural Agri-Coordination Platform
    </div>
  </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .logo { font-size: 24px; font-weight: bold; color: #16a34a; text-align: center; margin-bottom: 20px; }
    .title { font-size: 22px; color: #333; text-align: center; margin-bottom: 20px; }
    .message { color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 20px; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px auto; text-align: center; }
    .footer { color: #888; text-align: center; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">KrishiPool</div>
    <div class="title">Welcome to KrishiPool, ${name}! 🌱</div>
    <div class="message">
      We are thrilled to have you join our rural agri-coordination platform. 
      You can now book equipment, join mandi transport pools, and connect with other farmers.
    </div>
    <div style="text-align: center;">
      <a href="${process.env.CORS_ORIGIN || 'https://krishipool.com'}" class="btn">Go to Dashboard</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} KrishiPool. All rights reserved.<br/>
      Empowering Indian Farmers
    </div>
  </div>
</body>
</html>
`;
