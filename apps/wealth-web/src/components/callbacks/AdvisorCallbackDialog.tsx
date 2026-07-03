import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { CreateAdvisorCallbackRequest } from '@wealth/shared-types';
import { wealthApi } from '../../api';

export function AdvisorCallbackDialog(props: {
  customerId: string;
  open: boolean;
  onClose: () => void;
  source?: 'RECOMMENDATION' | 'CHAT' | 'MANUAL';
}) {
  const [form, setForm] = useState<CreateAdvisorCallbackRequest>({
    preferredDate: '',
    preferredTimeWindow: '',
    topic: '',
    source: props.source,
  });
  const mutation = useMutation({
    mutationFn: (request: CreateAdvisorCallbackRequest) =>
      wealthApi.createAdvisorCallback(props.customerId, request),
  });

  const validationError =
    !form.preferredDate || !form.preferredTimeWindow || !form.topic
      ? 'Preferred date, time window, and topic are required.'
      : '';

  const handleSubmit = () => {
    if (validationError) return;
    mutation.mutate(form, {
      onSuccess: () => {
        setForm({ preferredDate: '', preferredTimeWindow: '', topic: '', source: props.source });
      },
    });
  };

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request advisor callback</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {mutation.isSuccess ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={800}>Callback request submitted</Typography>
              <Typography color="text.secondary">
                An advisor summary has been generated and your request is ready for review.
              </Typography>
            </Paper>
          ) : (
            <>
              <Alert severity="info" variant="outlined">
                Choose a preferred date, time window, and topic for the handoff.
              </Alert>
              <TextField
                label="Preferred date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.preferredDate}
                onChange={(event) => setForm((current) => ({ ...current, preferredDate: event.target.value }))}
              />
              <TextField
                label="Preferred time window"
                value={form.preferredTimeWindow}
                onChange={(event) => setForm((current) => ({ ...current, preferredTimeWindow: event.target.value }))}
                placeholder="16:00-18:00"
              />
              <TextField
                label="Topic"
                value={form.topic}
                onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                placeholder="Education goal and recommendation review"
                multiline
                minRows={2}
              />
              {validationError ? <Alert severity="error">{validationError}</Alert> : null}
              {mutation.error ? <Alert severity="error">{mutation.error.message}</Alert> : null}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
        {!mutation.isSuccess ? (
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending || Boolean(validationError)}>
            {mutation.isPending ? 'Submitting...' : 'Submit request'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
