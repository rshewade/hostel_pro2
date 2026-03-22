import { describe, it, expect, vi } from 'vitest';
import { MockSmsProvider } from '../mock';
import { getSmsProvider } from '../index';

describe('SMS Providers', () => {
  describe('MockSmsProvider', () => {
    it('logs to console without error', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const provider = new MockSmsProvider();
      await provider.sendOtp('+919876543210', '123456');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[MOCK SMS]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('123456'));
      consoleSpy.mockRestore();
    });
  });

  describe('getSmsProvider', () => {
    it('returns MockSmsProvider when SMS_MODE is not live', () => {
      const provider = getSmsProvider();
      expect(provider).toBeInstanceOf(MockSmsProvider);
    });
  });
});
