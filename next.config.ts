import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['sharp'],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
