import { Metadata } from 'next';
import ShippingInfoContent from '@/components/legal/ShippingInfoContent';

export const metadata: Metadata = {
  title: 'Shipping Info | Floral Boutique',
  description: 'Learn about our delivery options, packaging, and tracking services.',
};

export default function ShippingInfoPage() {
  return <ShippingInfoContent />;
}
