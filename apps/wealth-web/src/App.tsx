import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import FlagIcon from '@mui/icons-material/Flag';
import InsightsIcon from '@mui/icons-material/Insights';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  FormControl,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Customer,
  Goal,
  InvestmentAllocationItem,
  Recommendation,
  RecommendationResult,
  RiskProfileResult,
  SpendingInsightMessage,
  SpendingInsights,
  WealthProfile,
} from '@wealth/shared-types';
import { ApiError, type DashboardRecommendation, wealthApi } from './api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#124c63',
      dark: '#0a3345',
    },
    secondary: {
      main: '#5b6f2a',
    },
    success: {
      main: '#247a4d',
    },
    warning: {
      main: '#a66a00',
    },
    error: {
      main: '#b23b3b',
    },
    background: {
      default: '#f5f7f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#14252f',
      secondary: '#5b6870',
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '1.55rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h2: {
      fontSize: '1.2rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h3: {
      fontSize: '1rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: 0,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: wealthApi.getCustomers,
  });
  const customers = customersQuery.data ?? [];
  const activeCustomerId = selectedCustomerId || customers[0]?.id || '';

  const wealthProfileQuery = useQuery({
    queryKey: ['wealth-profile', activeCustomerId],
    queryFn: () => wealthApi.getWealthProfile(activeCustomerId),
    enabled: Boolean(activeCustomerId),
  });
  const spendingInsightsQuery = useQuery({
    queryKey: ['spending-insights', activeCustomerId],
    queryFn: () => wealthApi.getSpendingInsights(activeCustomerId),
    enabled: Boolean(activeCustomerId),
  });
  const goalsQuery = useQuery({
    queryKey: ['goals', activeCustomerId],
    queryFn: () => wealthApi.getGoals(activeCustomerId),
    enabled: Boolean(activeCustomerId),
  });
  const riskProfileQuery = useQuery({
    queryKey: ['risk-profile', activeCustomerId],
    queryFn: () => wealthApi.getRiskProfile(activeCustomerId),
    enabled: Boolean(activeCustomerId),
  });
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', activeCustomerId],
    queryFn: () => wealthApi.getRecommendations(activeCustomerId),
    enabled: Boolean(activeCustomerId),
  });

  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) ?? null;

  const handleCustomerChange = (event: SelectChangeEvent<string>) => {
    setSelectedCustomerId(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.96)',
          }}
        >
          <Toolbar
            sx={{
              gap: 1.5,
              maxWidth: 1180,
              width: '100%',
              mx: 'auto',
              px: { xs: 2, md: 3 },
            }}
          >
            <AutoGraphIcon color="primary" />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} noWrap>
                Nivesh Saarthi
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Digital Wealth Advisor
              </Typography>
            </Box>

            <CustomerSwitcher
              customers={customers}
              value={activeCustomerId}
              isLoading={customersQuery.isLoading}
              onChange={handleCustomerChange}
            />
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            width: '100%',
            maxWidth: 1180,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        >
          <Stack spacing={3}>
            <HeaderBand
              customer={activeCustomer}
              profile={wealthProfileQuery.data}
              isLoading={customersQuery.isLoading || wealthProfileQuery.isLoading}
            />

            <AvatarAdvisorCard
              profile={wealthProfileQuery.data}
              goals={goalsQuery.data}
              riskProfile={riskProfileQuery.data}
              recommendations={recommendationsQuery.data}
            />

            <SectionStatus
              isLoading={wealthProfileQuery.isLoading}
              error={wealthProfileQuery.error}
              onRetry={() => void wealthProfileQuery.refetch()}
              label="wealth profile"
            >
              {wealthProfileQuery.data ? (
                <WealthOverview profile={wealthProfileQuery.data} />
              ) : (
                <EmptyState title="No wealth profile available" />
              )}
            </SectionStatus>

            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' },
                alignItems: 'start',
              }}
            >
              <SectionStatus
                isLoading={spendingInsightsQuery.isLoading}
                error={spendingInsightsQuery.error}
                onRetry={() => void spendingInsightsQuery.refetch()}
                label="spending insights"
              >
                {spendingInsightsQuery.data ? (
                  <SpendingInsightsPanel insights={spendingInsightsQuery.data} />
                ) : (
                  <EmptyState title="No spending insights available" />
                )}
              </SectionStatus>

              <Stack spacing={3}>
                <SectionStatus
                  isLoading={goalsQuery.isLoading}
                  error={goalsQuery.error}
                  onRetry={() => void goalsQuery.refetch()}
                  label="goals"
                >
                  <GoalsPreview goals={goalsQuery.data ?? []} />
                </SectionStatus>

                <SectionStatus
                  isLoading={riskProfileQuery.isLoading}
                  error={isNotFound(riskProfileQuery.error) ? null : riskProfileQuery.error}
                  onRetry={() => void riskProfileQuery.refetch()}
                  label="risk profile"
                >
                  <RiskProfileStatus riskProfile={riskProfileQuery.data} />
                </SectionStatus>

                <SectionStatus
                  isLoading={recommendationsQuery.isLoading}
                  error={recommendationsQuery.error}
                  onRetry={() => void recommendationsQuery.refetch()}
                  label="recommendations"
                >
                  <RecommendationPreview
                    recommendations={recommendationsQuery.data ?? []}
                    hasGoals={(goalsQuery.data?.length ?? 0) > 0}
                  />
                </SectionStatus>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function CustomerSwitcher(props: {
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

function HeaderBand(props: {
  customer: Customer | null;
  profile?: WealthProfile;
  isLoading: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', md: '1.5fr 0.7fr' },
        alignItems: 'stretch',
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.dark',
          color: 'common.white',
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          minHeight: 156,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack spacing={1}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Bank wealth dashboard
          </Typography>
          <Typography variant="h1">
            {props.isLoading
              ? 'Loading customer profile'
              : `Good day, ${props.profile?.fullName ?? props.customer?.fullName ?? 'Customer'}`}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 680 }}>
            Review cash flow, readiness, goals, risk status, and bank-approved next steps from one
            advisor workspace.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={props.profile?.customerSegment ?? 'Segment pending'}
            size="small"
            sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.36)' }}
            variant="outlined"
          />
          <Chip
            label={props.profile?.city ?? props.customer?.city ?? 'City pending'}
            size="small"
            sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.36)' }}
            variant="outlined"
          />
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          minHeight: 156,
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h3">Wealth readiness</Typography>
          <Box>
            <Typography variant="h2" color="primary">
              {props.profile ? `${props.profile.wealthReadinessScore}/100` : '--/100'}
            </Typography>
            <Typography color="text.secondary">
              {props.profile?.wealthReadinessBand ?? 'Awaiting profile'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={props.profile?.wealthReadinessScore ?? 0}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Score reflects savings, emergency fund, EMI burden, investments, and planning readiness.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function AvatarAdvisorCard(props: {
  profile?: WealthProfile;
  goals?: Goal[];
  riskProfile: RiskProfileResult | null | undefined;
  recommendations?: DashboardRecommendation[];
}) {
  const readiness = useMemo(() => {
    const items = [
      {
        label: 'Goals',
        complete: (props.goals?.length ?? 0) > 0,
      },
      {
        label: 'Risk',
        complete: Boolean(props.riskProfile),
      },
      {
        label: 'Plan',
        complete: (props.recommendations?.length ?? 0) > 0,
      },
    ];

    return items;
  }, [props.goals, props.recommendations, props.riskProfile]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'common.white',
            display: 'grid',
            placeItems: 'center',
            flex: '0 0 auto',
          }}
        >
          <PersonSearchIcon fontSize="large" />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h2">Avatar advisor</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {props.profile
              ? `I found INR ${formatCurrency(props.profile.idleBalance)} idle balance and INR ${formatCurrency(props.profile.monthlySurplus)} monthly surplus to review for goals.`
              : 'Connect the dashboard APIs to surface personalized advisor prompts.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {readiness.map((item) => (
            <Chip
              key={item.label}
              label={`${item.label}: ${item.complete ? 'Ready' : 'Pending'}`}
              color={item.complete ? 'success' : 'default'}
              variant={item.complete ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function WealthOverview({ profile }: { profile: WealthProfile }) {
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
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <AllocationList allocation={profile.investmentAllocation} />
        <InsightBullets insights={profile.summaryInsights} />
      </Box>
    </Section>
  );
}

function SpendingInsightsPanel({ insights }: { insights: SpendingInsights }) {
  return (
    <Section title="Spending insights" icon={<InsightsIcon />}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          }}
        >
          <MetricCard label="Avg income" value={formatCurrency(insights.monthlyIncome)} />
          <MetricCard label="Avg expenses" value={formatCurrency(insights.monthlyExpenses)} />
          <MetricCard
            label="Investable range"
            value={`${formatCurrency(insights.investableSurplusEstimate.min)} - ${formatCurrency(insights.investableSurplusEstimate.max)}`}
          />
        </Box>

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

function GoalsPreview({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <Section title="Goals" icon={<FlagIcon />}>
        <EmptyState
          title="No goals yet"
          description="Create a goal to unlock projection and recommendation flows."
          actionLabel="Create goal"
        />
      </Section>
    );
  }

  return (
    <Section title="Goals" icon={<FlagIcon />}>
      <Stack spacing={1.25}>
        {goals.slice(0, 3).map((goal) => {
          const progress =
            goal.targetAmount > 0
              ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              : 0;

          return (
            <Box
              key={goal.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700}>{goal.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {goal.type} · target {goal.targetDate}
                  </Typography>
                </Box>
                <Typography fontWeight={700}>{formatCurrency(goal.targetAmount)}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 7, borderRadius: 1, mt: 1 }}
              />
            </Box>
          );
        })}
      </Stack>
    </Section>
  );
}

function RiskProfileStatus({ riskProfile }: { riskProfile: RiskProfileResult | null | undefined }) {
  return (
    <Section title="Risk profile" icon={<AssignmentTurnedInIcon />}>
      {riskProfile ? (
        <Stack spacing={1}>
          <Chip
            label={riskProfile.category}
            color={
              riskProfile.category === 'AGGRESSIVE'
                ? 'warning'
                : riskProfile.category === 'MODERATE'
                  ? 'primary'
                  : 'success'
            }
            sx={{ alignSelf: 'flex-start', fontWeight: 800 }}
          />
          <Typography variant="h2">{riskProfile.scorePercent}%</Typography>
          <Typography color="text.secondary">
            {riskProfile.explanation[0] ??
              'Suitability result is available for recommendation rules.'}
          </Typography>
        </Stack>
      ) : (
        <EmptyState
          title="Risk profile pending"
          description="Complete suitability profiling before market-linked recommendations."
          actionLabel="Take risk profile"
        />
      )}
    </Section>
  );
}

function RecommendationPreview(props: {
  recommendations: DashboardRecommendation[];
  hasGoals: boolean;
}) {
  const latest = props.recommendations.at(-1);

  if (!latest) {
    return (
      <Section title="Recommendations" icon={<TrendingUpIcon />}>
        <EmptyState
          title="No recommendation yet"
          description={
            props.hasGoals
              ? 'Generate a recommendation after confirming risk profile and capacity.'
              : 'Create a goal first so the engine can recommend against a clear target.'
          }
          actionLabel={props.hasGoals ? 'View recommendations' : 'Create goal'}
        />
      </Section>
    );
  }

  return (
    <Section title="Recommendations" icon={<TrendingUpIcon />}>
      {'recommendationId' in latest ? (
        <GeneratedRecommendationSummary recommendation={latest} />
      ) : (
        <SeededRecommendationSummary recommendation={latest} />
      )}
    </Section>
  );
}

function GeneratedRecommendationSummary({
  recommendation,
}: {
  recommendation: RecommendationResult;
}) {
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={recommendation.suitability} color="primary" size="small" />
        <Chip
          label={recommendation.riskProfile ?? 'Risk pending'}
          variant="outlined"
          size="small"
        />
      </Stack>
      <Typography fontWeight={800}>
        {recommendation.recommendedPlan?.name ?? 'Advisor review needed'}
      </Typography>
      <Typography color="text.secondary">
        {recommendation.reasoning[0] ?? recommendation.disclaimer}
      </Typography>
      {recommendation.riskWarnings[0] ? (
        <Typography variant="caption" color="warning.main">
          {recommendation.riskWarnings[0]}
        </Typography>
      ) : null}
    </Stack>
  );
}

function SeededRecommendationSummary({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Stack spacing={1}>
      <Chip label={recommendation.status} size="small" sx={{ alignSelf: 'flex-start' }} />
      <Typography fontWeight={800}>{recommendation.title}</Typography>
      <Typography color="text.secondary">{recommendation.reasoning}</Typography>
      <Typography variant="caption" color="text.secondary">
        {recommendation.disclaimer}
      </Typography>
    </Stack>
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

function MetricCard(props: { label: string; value: string; icon?: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
        minHeight: 96,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {props.icon ? (
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{props.icon}</Box>
        ) : null}
        <Typography variant="caption" color="text.secondary">
          {props.label}
        </Typography>
      </Stack>
      <Typography variant="h3" sx={{ mt: 1, overflowWrap: 'anywhere' }}>
        {props.value}
      </Typography>
    </Box>
  );
}

function Section(props: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{props.icon}</Box>
        <Typography variant="h2">{props.title}</Typography>
      </Stack>
      {props.children}
    </Box>
  );
}

function SectionStatus(props: {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  label: string;
  children: ReactNode;
}) {
  if (props.isLoading) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading {props.label}...</Typography>
        </Stack>
      </Box>
    );
  }

  if (props.error) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
        }}
      >
        <Stack spacing={1.25}>
          <Typography fontWeight={800}>Could not load {props.label}</Typography>
          <Typography color="text.secondary">Check the API server and try again.</Typography>
          <Button
            variant="outlined"
            onClick={props.onRetry}
            endIcon={<ArrowForwardIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  return <>{props.children}</>;
}

function EmptyState(props: { title: string; description?: string; actionLabel?: string }) {
  return (
    <Stack spacing={1.25}>
      <Typography fontWeight={800}>{props.title}</Typography>
      {props.description ? (
        <Typography color="text.secondary">{props.description}</Typography>
      ) : null}
      {props.actionLabel ? (
        <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ alignSelf: 'flex-start' }}>
          {props.actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}

function isNotFound(error: Error | null): boolean {
  return error instanceof ApiError && error.status === 404;
}

function formatCurrency(value: number): string {
  return `INR ${Math.round(value).toLocaleString('en-IN')}`;
}

export default App;
