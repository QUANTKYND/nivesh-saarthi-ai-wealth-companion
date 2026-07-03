import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import type { InvestmentAllocationItem, WealthProfile } from '@wealth/shared-types';
import { MetricCard } from '../common/MetricCard';
import { Section } from '../common/Section';
import { formatCurrency } from '../../utils/formatters';

export function WealthOverview({ profile }: { profile: WealthProfile }) {
  const metrics = [
    {
      label: 'Monthly income',
      value: formatCurrency(profile.monthlyIncome),
      icon: <AccountBalanceWalletIcon />,
    },
    {
      label: 'Monthly expenses',
      value: formatCurrency(profile.monthlyExpenses),
      icon: <AnalyticsIcon />,
    },
    {
      label: 'Monthly surplus',
      value: formatCurrency(profile.monthlySurplus),
      icon: <TrendingUpIcon />,
    },
    {
      label: 'Savings rate',
      value: `${profile.savingsRatePercent.toFixed(1)}%`,
      icon: <AutoGraphIcon />,
    },
    {
      label: 'Idle balance',
      value: formatCurrency(profile.idleBalance),
      icon: <AccountBalanceWalletIcon />,
    },
    {
      label: 'EMI burden',
      value: `${profile.emiBurdenPercent.toFixed(1)}%`,
      icon: <SecurityIcon />,
    },
  ];

  return (
    <Section title="Financial snapshot" icon={<AutoGraphIcon />}>
      <Grid container spacing={1.5}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={metric.label}>
            <MetricCard label={metric.label} value={metric.value} icon={metric.icon} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AllocationList allocation={profile.investmentAllocation} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InsightBullets insights={profile.summaryInsights} />
        </Grid>
      </Grid>
    </Section>
  );
}

function AllocationList({ allocation }: { allocation: InvestmentAllocationItem[] }) {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Investment allocation
      </Typography>
      {allocation.length === 0 ? (
        <Typography color="text.secondary">No active investments found.</Typography>
      ) : (
        <Stack spacing={1}>
          {allocation.map((item) => (
            <Box key={item.label}>
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Typography variant="body2">{item.label}</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {item.percentage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(item.percentage, 100)}
                sx={{ height: 7, borderRadius: 1, mt: 0.5 }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function InsightBullets({ insights }: { insights: string[] }) {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Summary insights
      </Typography>
      <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
        {insights.map((insight) => (
          <Typography key={insight} component="li" color="text.secondary">
            {insight}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
