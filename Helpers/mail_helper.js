import mailer from "./Mailer.js";

const sendEmail = async (receiver, subject, text) => {
  return mailer.setReceiver(receiver).setSubject(subject).setText(text).send();
};

const sendVerificationLink = async (receiver, veriLink) => {
  return mailer
    .setReceiver(receiver)
    .setSubject("Verification Your Email")
    .setText("Here your verification - " + veriLink)
    .send();
};

const sendOTP = async (receiver, otp) => {
  return mailer
    .setReceiver(receiver)
    .setSubject("Forget Password | OTP Code")
    .setText("OTP code for new password - " + otp)
    .send();
};

export { sendEmail, sendVerificationLink, sendOTP };
