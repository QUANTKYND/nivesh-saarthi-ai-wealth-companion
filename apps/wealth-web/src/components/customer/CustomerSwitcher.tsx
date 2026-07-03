import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Customer } from '@wealth/shared-types';

export function CustomerSwitcher(props: {
  customers: Customer[];
  value: string;
  isLoading: boolean;
  onChange: (event: SelectChangeEvent<string>) => void;
}) {
  return (
    <FormControl size="small">
      <Select
        value={props.value}
        onChange={props.onChange}
        displayEmpty
        disabled={props.isLoading || props.customers.length === 0}
        sx={{ bgcolor: 'background.paper', m: 1 }}
      >
        {props.customers.map((customer) => (
          <MenuItem key={customer.id} value={customer.id}>
            <Box>
              <Typography fontWeight={800}>{customer.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPersona(customer.persona)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function formatPersona(persona: Customer['persona']) {
  return persona
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
