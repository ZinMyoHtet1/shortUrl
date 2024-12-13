import mailer from "./Mailer.js";
import { readFileSync } from "./index.js";

const sendEmail = async (receiver, subject, text) => {
  return mailer.setReceiver(receiver).setSubject(subject).setText(text).send();
};

const sendVerificationEmail = async (receiver, veriLink) => {
  const html = readFileSync("../Htmls/verificationEmail.html");
  return (
    mailer
      .setReceiver(receiver)
      .setSubject("Verification Your Email")
      // .setText("Here your verification - " + veriLink)
      .setHTML(html)
      .replaceHTML_Text("[VERIFICATION_LINK]", veriLink)
      .send()
  );
};

const sendOTP = async (receiver, otp) => {
  const html = readFileSync("../Htmls/forgetPasswordOTP.html");

  return (
    mailer
      .setReceiver(receiver)
      .setSubject("Forget Password | OTP Code")
      // .setText("OTP code for new password - " + otp)
      .setHTML(html)
      .replaceHTML_Text("[OTP-CODE]", otp)
      .send()
  );
};

export { sendEmail, sendVerificationEmail, sendOTP };
