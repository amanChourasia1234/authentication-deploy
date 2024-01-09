import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import ENV from '../config.js';

let nodeConfig = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: ENV.EMAIL,
    pass: ENV.PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Mailgen',
    link: 'https://mailgen.js/',
  },
});

export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  var email = {
    body: {
      name: username,
      intro: text || 'Welcome to website',
      outro: 'Need help , or have question ? Just reply to this email',
    },
  };
  var emailBody = MailGenerator.generate(email);

  let message = {
    from: ENV.EMAIL,
    to: userEmail,
    subject: subject || 'Sign up Successful',
    html: emailBody,
  };
  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).send({ msg: 'mail sent to your account' });
    })
    .catch(error => {
      return res.status(500).send(error);
    });
};
