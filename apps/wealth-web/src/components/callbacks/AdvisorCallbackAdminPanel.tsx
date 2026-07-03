import { Alert, Chip, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { wealthApi } from '../../api';
import { Section } from '../common/Section';

export function AdvisorCallbackAdminPanel() {
  const query = useQuery({
    queryKey: ['admin-advisor-callbacks'],
    queryFn: wealthApi.getAdminAdvisorCallbacks,
  });

  return (
    <Section title="Advisor callbacks" icon={<span>✦</span>}>
      <Stack spacing={1.5}>
        {query.error ? <Alert severity="error">{(query.error as Error).message}</Alert> : null}
        {query.data?.length ? (
          query.data.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={0.5}>
                <Typography fontWeight={800}>{item.customerName}</Typography>
                <Typography color="text.secondary">{item.topic}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={item.preferredDate} size="small" />
                  <Chip label={item.preferredTimeWindow} size="small" />
                  <Chip label={item.status} size="small" />
                  <Chip label={item.advisorSummary.riskProfile ?? 'Risk pending'} size="small" />
                  <Chip label={item.latestRecommendationSuitability ?? 'No recommendation'} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {item.advisorSummary.summary}
                </Typography>
                {item.advisorSummary.keyDiscussionPoints.map((point) => (
                  <Typography key={point} variant="body2" color="text.secondary">
                    - {point}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          ))
        ) : (
          <Typography color="text.secondary">No callback requests yet.</Typography>
        )}
      </Stack>
    </Section>
  );
}
