import React from 'react';
import { Box, TextField, Button, Typography, Paper, InputAdornment } from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define form schema
const investmentFormSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  unitsToInvest: z.number().min(1, 'Units must be at least 1'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms')
});

type InvestmentFormInputs = z.infer<typeof investmentFormSchema>;

interface TouchOptimizedFormProps {
  property: {
    id: number;
    name: string;
    minimumInvestment: number;
    unitPrice?: number;
  };
  onSubmit: SubmitHandler<InvestmentFormInputs>;
  isSubmitting?: boolean;
}

export default function TouchOptimizedForm({ 
  property, 
  onSubmit, 
  isSubmitting = false 
}: TouchOptimizedFormProps) {
  const unitPrice = property.unitPrice || 100000; // Default unit price if not provided
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<InvestmentFormInputs>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: property.minimumInvestment,
      unitsToInvest: Math.floor(property.minimumInvestment / unitPrice),
      agreeToTerms: false
    }
  });
  
  const watchAmount = watch('amount');
  const watchUnits = watch('unitsToInvest');
  
  // When amount changes, update units
  React.useEffect(() => {
    if (watchAmount) {
      const calculatedUnits = Math.floor(watchAmount / unitPrice);
      if (calculatedUnits !== watchUnits) {
        // This would be handled through setValue in a real implementation
      }
    }
  }, [watchAmount, watchUnits, unitPrice]);
  
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Invest in {property.name}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Amount to Invest"
              fullWidth
              margin="normal"
              type="number"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              InputProps={{ 
                sx: { fontSize: '16px', height: '56px' },
                startAdornment: <InputAdornment position="start">₦</InputAdornment>
              }}
              onChange={(e) => {
                const value = Number(e.target.value);
                field.onChange(value);
              }}
            />
          )}
        />
        
        <Controller
          name="unitsToInvest"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Units to Invest"
              fullWidth
              margin="normal"
              type="number"
              error={!!errors.unitsToInvest}
              helperText={errors.unitsToInvest?.message}
              InputProps={{ 
                sx: { fontSize: '16px', height: '56px' } 
              }}
              onChange={(e) => {
                const value = Number(e.target.value);
                field.onChange(value);
              }}
            />
          )}
        />
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Minimum Investment: ₦{property.minimumInvestment.toLocaleString()}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Unit Price: ₦{unitPrice.toLocaleString()} per unit
          </Typography>
        </Box>
        
        <Controller
          name="agreeToTerms"
          control={control}
          render={({ field }) => (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 2,
              border: errors.agreeToTerms ? '1px solid #f44336' : '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: 1,
              mb: 2
            }}>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  marginRight: '12px',
                  accentColor: '#1976d2' 
                }}
              />
              <Typography variant="body2">
                I agree to the terms and conditions for this investment
              </Typography>
            </Box>
          )}
        />
        {errors.agreeToTerms && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
            {errors.agreeToTerms.message}
          </Typography>
        )}
        
        <Button 
          variant="contained" 
          size="large" 
          fullWidth
          type="submit"
          disabled={isSubmitting}
          sx={{ 
            padding: '14px 24px', 
            fontSize: '16px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          {isSubmitting ? 'Processing...' : 'Submit Investment'}
        </Button>
      </Box>
    </Paper>
  );
}