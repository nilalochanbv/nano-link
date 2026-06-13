import QRCode from 'qrcode';

class QrService {
  async generateQrCode(url) {
    try {
      // Return a base64 encoded PNG Data URL
      return await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f172a', // Tailwind Slate-900
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Failed to generate QR code');
    }
  }
}

export default new QrService();
