import { FormControl, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Customer } from '@wealth/shared-types';

export function CustomerSwitcher(props: {
  customers: Customer[];
  value: string;
  isLoading: boolean;
  onChange: (event: SelectChangeEvent<string>) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: { xs: 148, sm: 220 } }}>
      <Select
        value={props.value}
        onChange={props.onChange}
        displayEmpty
        disabled={props.isLoading || props.customers.length === 0}
        sx={{ bgcolor: 'background.paper' }}
      >
        {props.customers.map((customer) => (
          <MenuItem key={customer.id} value={customer.id}>
            {customer.fullName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
