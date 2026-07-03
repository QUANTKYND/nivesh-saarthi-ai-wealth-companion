import InsightsIcon from '@mui/icons-material/Insights';
import { Box, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import type { SpendingInsightMessage, SpendingInsights } from '@wealth/shared-types';
import { MetricCard } from '../common/MetricCard';
import { Section } from '../common/Section';
import { formatCurrency } from '../../utils/formatters';

export function SpendingInsightsPanel({ insights }: { insights: SpendingInsights }) {
  return (
    <Section title="Spending insights" icon={<InsightsIcon />}>
      <Stack spacing={2}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MetricCard label="Avg income" value={formatCurrency(insights.monthlyIncome)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MetricCard label="Avg expenses" value={formatCurrency(insights.monthlyExpenses)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MetricCard
              label="Investable range"
              value={`${formatCurrency(insights.investableSurplusEstimate.min)} - ${formatCurrency(insights.investableSurplusEstimate.max)}`}
            />
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h3" gutterBottom>
            Category breakdown
          </Typography>
          <Stack spacing={1}>
            {insights.categoryBreakdown.slice(0, 5).map((category) => (
              <Box key={category.category}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography variant="body2">{category.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatCurrency(category.amount)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(category.percentage, 100)}
                  sx={{ height: 7, borderRadius: 1, mt: 0.5 }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <TopInsights insights={insights.insights} />
      </Stack>
    </Section>
  );
}

function TopInsights({ insights }: { insights: SpendingInsightMessage[] }) {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Top insights
      </Typography>
      <Stack spacing={1}>
        {insights.slice(0, 4).map((insight) => (
          <Box
            key={`${insight.type}-${insight.title}`}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.25,
            }}
          >
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography fontWeight={800}>{insight.title}</Typography>
              <Chip label={insight.severity} size="small" variant="outlined" />
            </Stack>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              {insight.message}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
