import React from 'react';
import { Typography, Link, Box } from '@mui/material';
import { Info } from 'lucide-react';

interface CryptoRiskNoticeProps {
  compact?: boolean; // For compact display in small areas
  includeCheckbox?: boolean; // If acknowledgment checkbox is needed
  onChange?: (checked: boolean) => void; // Callback for checkbox change
  checked?: boolean; // Controlled checkbox state
}

export default function CryptoRiskNotice({ 
  compact = false, 
  includeCheckbox = false,
  onChange,
  checked = false
}: CryptoRiskNoticeProps) {
  return (
    <Box 
      sx={{ 
        mt: 2, 
        p: compact ? 1 : 2, 
        borderRadius: 1,
        backgroundColor: 'rgba(22, 181, 160, 0.08)',
        border: '1px solid rgba(22, 181, 160, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Info size={compact ? 16 : 20} color="#16b5a0" />
        <Box sx={{ flex: 1 }}>
          {compact ? (
            <Typography variant="caption" color="text.secondary">
              By proceeding, you acknowledge you have read and agree to the{' '}
              <Link href="/pdfs/crypto-risk-disclosure.pdf" target="_blank" underline="hover" color="primary">
                Crypto Risk Disclosure
              </Link>.
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Cryptocurrency Investment Disclaimer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cryptocurrency investments involve significant risks including price volatility, regulatory uncertainty, 
                and potential security vulnerabilities. By proceeding, you acknowledge you have read and agree to our{' '}
                <Link href="/pdfs/crypto-risk-disclosure.pdf" target="_blank" underline="hover" color="primary">
                  Crypto Risk Disclosure
                </Link>{' '}
                and understand these risks.
              </Typography>
            </>
          )}

          {includeCheckbox && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <input 
                type="checkbox" 
                id="crypto-risk-acknowledgment"
                checked={checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
              />
              <label htmlFor="crypto-risk-acknowledgment">
                <Typography variant="caption" sx={{ ml: 1 }}>
                  I acknowledge and accept these risks
                </Typography>
              </label>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}