const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Builds a tamper-evident ticket code: a unique random ID plus an HMAC
 * signature derived from JWT_SECRET. The QR image encodes this code, and
 * verifyTicketCode re-derives the signature to confirm the code was
 * issued by this server and has not been altered.
 */
const generateTicketCode = () => {
  const id = uuidv4();
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(id)
    .digest('hex')
    .slice(0, 16);
  return `${id}.${signature}`;
};

const verifyTicketCode = (code) => {
  if (!code || !code.includes('.')) return false;
  const [id, signature] = code.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(id)
    .digest('hex')
    .slice(0, 16);
  return signature === expectedSignature;
};

/**
 * Generates a QR code as a base64 data URL encoding the ticket code.
 * The scanner reads this code and the backend verifies it against the
 * Ticket collection plus the HMAC signature above.
 */
const generateQRCodeImage = async (ticketCode) => {
  const dataUrl = await QRCode.toDataURL(ticketCode, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320,
  });
  return dataUrl;
};

module.exports = { generateTicketCode, verifyTicketCode, generateQRCodeImage };
