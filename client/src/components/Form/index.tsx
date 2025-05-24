import { Controller } from 'react-hook-form';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  ListItemText, 
  FormHelperText,
  TextField
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { Control } from 'react-hook-form';

interface MultiSelectProps {
  name: string;
  control: Control<any>;
  label: string;
  options: string[];
  error?: string;
}

export const MultiSelect = ({ name, control, label, options, error }: MultiSelectProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            labelId={`${name}-label`}
            id={name}
            multiple
            value={field.value || []}
            onChange={field.onChange}
            renderValue={(selected) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(selected as string[]).map((value) => (
                  <div key={value} style={{ 
                    background: '#f0f0f0', 
                    borderRadius: '16px', 
                    padding: '2px 8px',
                    fontSize: '0.85rem' 
                  }}>
                    {value}
                  </div>
                ))}
              </div>
            )}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(field.value || []).indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

interface DatePickerProps {
  name: string;
  control: Control<any>;
  label: string;
  error?: string;
}

export const DatePicker = ({ name, control, label, error }: DatePickerProps) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field: { value, onChange, ...field } }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label={label}
            value={value}
            onChange={onChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error,
                ...field
              }
            }}
          />
        </LocalizationProvider>
      )}
    />
  );
};