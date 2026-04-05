'use client';

import { useState } from 'react';
import { useLocale } from '@/src/contexts';

export function ContactSection() {
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const copy =
    locale === 'vi'
      ? {
          invalidEmail: 'Vui lòng nhập địa chỉ email hợp lệ',
          subscribeFailed: 'Đăng ký thất bại. Vui lòng thử lại.',
          subscribeFailedShort: 'Đăng ký thất bại',
          subscribeSuccess: 'Hãy kiểm tra email để nhận link nhóm Zalo!',
          title: 'Tham gia Bloom Club',
          description: 'Nhận mẹo cắm hoa, cập nhật theo mùa và giảm 10% cho đơn đầu tiên.',
          placeholder: 'Địa chỉ email của bạn',
          loadingButton: 'Đang đăng ký...',
          subscribeButton: 'Đăng ký',
        }
      : {
          invalidEmail: 'Please enter a valid email address',
          subscribeFailed: 'Failed to subscribe. Please try again.',
          subscribeFailedShort: 'Failed to subscribe',
          subscribeSuccess: 'Check your email for the Zalo group link!',
          title: 'Join Our Bloom Club',
          description: 'Receive styling tips, seasonal updates, and 10% off your first order.',
          placeholder: 'Your email address',
          loadingButton: 'Subscribing...',
          subscribeButton: 'Subscribe',
        };

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: copy.invalidEmail });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'bloom_club' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || copy.subscribeFailedShort);
      }

      setMessage({ type: 'success', text: copy.subscribeSuccess });
      setEmail('');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : copy.subscribeFailed 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[rgba(245,213,217,0.2)] py-24">
      <div className="max-w-[1280px] mx-auto px-[192px]">
        <div className="flex items-center justify-between">
          <div className="w-[349px]">
            <h2
              className="text-[#2d2a26] text-[36px] font-light leading-[40px] mb-4"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              {copy.title}
            </h2>
            <p
              className="text-[#5c6b5e] text-[18px] font-light leading-[28px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.description}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-[320px] h-16 bg-white rounded-3xl border border-[#ece4da] px-4 flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder={copy.placeholder}
                  className="w-full bg-transparent text-[14px] font-light text-[#2d2a26] placeholder-gray-400 outline-none"
                  style={{ fontFamily: "var(--font-inter)" }}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-[#d0bb95] border border-[rgba(0,0,0,0.1)] text-white text-[16px] font-medium px-8 h-16 rounded-3xl hover:bg-[#c2a571] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {loading ? copy.loadingButton : copy.subscribeButton}
              </button>
            </div>
            {message && (
              <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
