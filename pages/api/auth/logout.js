import { clearCookie } from '../../../lib/session';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie());
  res.status(200).json({ success: true });
}
