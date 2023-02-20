const nodemailer = require("nodemailer");

const sendEmail = async (subject, message, send_to, sent_from) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: "587",
    auth: {
      user: 'akshitha.seproject@gmail.com',
      pass: 'sefhlataskrdxzqv',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: sent_from,
    to: send_to,
    subject: subject,
    html: message,
  };

  // Send Email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
