const emailService = require("../services/emailService");

const sendEmailController = {
  async sendContactEmail(req, res) {
    const { name, email, message } = req.body;

    try {
      const response = await emailService.sendEmail(name, email, message);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = sendEmailController;
