import { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/legal/PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | Floral Boutique',
  description: 'Learn how Floral Boutique collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
