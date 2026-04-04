import { Metadata } from 'next';
import TermsOfServiceContent from '@/components/legal/TermsOfServiceContent';

export const metadata: Metadata = {
  title: 'Terms of Service | Floral Boutique',
  description: 'Read our terms and conditions for using Floral Boutique services.',
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
