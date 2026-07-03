import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import {
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { wealthApi } from '../../api';
import { Section } from '../common/Section';

export function AdvisorCallbackAdminPanel() {
  const query = useQuery({
    queryKey: ['admin-advisor-callbacks'],
    queryFn: wealthApi.getAdminAdvisorCallbacks,
  });

  return (
    <Section title="Admin / Advisor View" icon={<SupportAgentIcon />}>
      <Stack spacing={1.5}>
        <Typography color="text.secondary">
          Review callback requests, customer context, recommendation summaries, and latest advisor
          chat cues before contacting the customer.
        </Typography>

        {query.isLoading ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={20} />
            <Typography color="text.secondary">Loading advisor handoffs...</Typography>
          </Stack>
        ) : null}

        {query.error ? <Alert severity="error">{(query.error as Error).message}</Alert> : null}

        {!query.isLoading && query.data?.length ? (
          query.data.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Stack spacing={0.25}>
                    <Typography fontWeight={800}>{item.customerName}</Typography>
                    <Typography color="text.secondary">{item.customerSummary}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={item.status} size="small" />
                    <Chip label={item.preferredDate} size="small" />
                    <Chip label={item.preferredTimeWindow} size="small" />
                    <Chip label={item.advisorSummary.riskProfile ?? 'Risk pending'} size="small" />
                  </Stack>
                </Stack>

                <Typography fontWeight={700}>{item.topic}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.advisorSummary.summary}
                </Typography>

                <Divider />

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <SummaryBlock
                      title="Callback request"
                      body={`${item.preferredDate} · ${item.preferredTimeWindow}`}
                      footnote={`Source: ${item.source ?? 'MANUAL'}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <SummaryBlock
                      title="Latest recommendation"
                      body={item.latestRecommendationSummary ?? 'No recommendation yet'}
                      footnote={item.latestRecommendationSuitability ?? 'Suitability not available'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <SummaryBlock
                      title="Latest chat"
                      body={item.latestChatSummary ?? 'No recent chat summary'}
                      footnote={
                        item.advisorSummary.primaryGoal
                          ? `Primary goal: ${item.advisorSummary.primaryGoal}`
                          : 'Primary goal not selected'
                      }
                    />
                  </Grid>
                </Grid>

                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Key discussion points
                  </Typography>
                  {item.advisorSummary.keyDiscussionPoints.map((point) => (
                    <Typography key={point} variant="body2" color="text.secondary">
                      - {point}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))
        ) : !query.isLoading ? (
          <Typography color="text.secondary">No callback requests yet.</Typography>
        ) : null}
      </Stack>
    </Section>
  );
}

function SummaryBlock(props: { title: string; body: string; footnote: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, height: '100%', bgcolor: 'rgba(18, 76, 99, 0.03)' }}>
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          {props.title}
        </Typography>
        <Typography fontWeight={700}>{props.body}</Typography>
        <Typography variant="body2" color="text.secondary">
          {props.footnote}
        </Typography>
      </Stack>
    </Paper>
  );
}
