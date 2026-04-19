import type { Template } from '../types';

export const templates: Template[] = [
  {
    id: 'tpl-1',
    name: 'Classic Newsletter',
    category: 'newsletter',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff"><h1 style="color:#0984e3">Weekly Newsletter</h1><p>Hello {{firstName}},</p><p>Here are this week\'s top stories and updates from our team.</p><div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0"><h3>Featured Story</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></div><p>Best regards,<br/>The Team</p></div>',
  },
  {
    id: 'tpl-2',
    name: 'Minimal Newsletter',
    category: 'newsletter',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff"><h2>Updates</h2><p>Hi {{firstName}},</p><ul><li>Update one</li><li>Update two</li><li>Update three</li></ul><p>— The Team</p></div>',
  },
  {
    id: 'tpl-3',
    name: 'Product Launch',
    category: 'announcement',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff;text-align:center"><h1 style="color:#0984e3;font-size:32px">Something Big Is Here</h1><p style="font-size:18px;color:#64748b">We\'re excited to announce our latest feature.</p><a href="#" style="display:inline-block;padding:12px 32px;background:#0984e3;color:#fff;border-radius:8px;text-decoration:none;margin:20px 0">Learn More</a></div>',
  },
  {
    id: 'tpl-4',
    name: 'Company Update',
    category: 'announcement',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff"><h1>Company Update</h1><p>Dear team and customers,</p><p>We have some exciting news to share with you.</p><p>Best,<br/>The Leadership Team</p></div>',
  },
  {
    id: 'tpl-5',
    name: 'Flash Sale',
    category: 'promo',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:linear-gradient(135deg,#0984e3,#6366f1);color:#fff;text-align:center;border-radius:12px"><h1 style="font-size:36px">🔥 Flash Sale</h1><p style="font-size:24px">50% OFF Everything</p><p>Use code: <strong>FLASH50</strong></p><a href="#" style="display:inline-block;padding:14px 40px;background:#fff;color:#0984e3;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Shop Now</a></div>',
  },
  {
    id: 'tpl-6',
    name: 'Seasonal Promo',
    category: 'promo',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff;text-align:center"><h1>Spring Collection</h1><p style="color:#64748b">New arrivals are here. Enjoy 20% off your first order.</p><a href="#" style="display:inline-block;padding:12px 32px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none">Browse Now</a></div>',
  },
  {
    id: 'tpl-7',
    name: 'Order Confirmation',
    category: 'transactional',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff"><h2>Order Confirmed ✓</h2><p>Hi {{firstName}},</p><p>Your order #12345 has been confirmed.</p><div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0"><p><strong>Item:</strong> Premium Plan</p><p><strong>Amount:</strong> $49.00</p></div><p>Thank you for your purchase!</p></div>',
  },
  {
    id: 'tpl-8',
    name: 'Welcome Email',
    category: 'transactional',
    thumbnailUrl: '',
    previewHtml: '<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:40px;background:#fff;text-align:center"><h1 style="color:#0984e3">Welcome to MailFlow!</h1><p>Hi {{firstName}},</p><p>We\'re thrilled to have you on board.</p><a href="#" style="display:inline-block;padding:12px 32px;background:#0984e3;color:#fff;border-radius:8px;text-decoration:none">Get Started</a></div>',
  },
];
