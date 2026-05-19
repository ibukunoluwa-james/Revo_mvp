import axios from 'axios';

export const sendSMS = async (phone: string, message: string) => {
  const normalised = phone.startsWith('0')
    ? '+234' + phone.slice(1)
    : phone;

  await axios.post('https://api.ng.termii.com/api/sms/send', {
    to:         normalised,
    from:       process.env.TERMII_SENDER_ID,
    sms:        message,
    type:       'plain',
    channel:    'generic',
    api_key:    process.env.TERMII_API_KEY,
  });
};
