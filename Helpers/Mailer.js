import nodemailer from "nodemailer";

class Mailer {
  service = "gmail";
  host = "smtp.gmail.com";
  port = 587;

  constructor() {
    this.mailOptions = {
      from: {
        address: process.env.EMAIL,
        name: "URL Shortener By JYS",
      },
      to: [],
      subject: "",
      text: "",
      attachments: [],
      html: "",
    };
  }

  _transporter() {
    return nodemailer.createTransport({
      service: this.service,
      host: this.host,
      port: this.port,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  setCompanyName(name) {
    this.mailOptions.from.name = name;
    return this;
  }

  setReceiver(email) {
    const receivers = this.mailOptions.to || [];
    receivers.push(email);
    this.mailOptions.to = receivers;
    return this;
  }

  setCC_OR_BCC(email, option = "cc") {
    const ccReceivers = this.mailOptions.cc || [];
    const bccReceivers = this.mailOptions.bcc || [];

    option === "cc" ? ccReceivers.push(email) : bccReceivers.push(email);

    this.mailOptions.cc = ccReceivers;
    this.mailOptions.bcc = bccReceivers;
    return this;
  }

  setSubject(subject) {
    this.mailOptions.subject = subject;
    return this;
  }

  setText(text) {
    this.mailOptions.text = text;
    return this;
  }

  /**
   *
   * @param {Array<object> | object} attachment
   * @returns
   */
  setAttachments(attachment) {
    const attachments = this.mailOptions.attachments || [];
    if (Array.isArray(attachment)) {
      attachment.forEach((att) => attachments.push(att));
    } else {
      attachments.push(attachment);
    }

    this.mailOptions.attachments = attachments;
    return this;
  }

  setHTML(html) {
    this.mailOptions.html = html;
    return this;
  }

  replaceHTML_Text(from, to) {
    const prevHtml = this.mailOptions.html;
    const html = prevHtml.replaceAll(from, to);
    this.mailOptions.html = html;
    return this;
  }

  send() {
    return new Promise((resolve, reject) => {
      this._transporter()
        .sendMail(this.mailOptions)
        .then((info) => resolve(info))
        .catch((error) => reject(error));
    });
  }
}

export default new Mailer();
