import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InsightsIcon from '@mui/icons-material/Insights';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Alert,
  AppBar,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-next';
import type {
  AdvisorChatActionCard,
  AdvisorChatMessage,
  AdvisorChatResponse,
  CreateGoalPriority,
  CreateGoalRequest,
  Customer,
  Goal,
  GoalProjection,
  GoalType,
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
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>(() => createBlankGoalForm());
  const [goalFormErrors, setGoalFormErrors] = useState<GoalFormErrors>({});
  const [chatDraft, setChatDraft] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [latestChatResponse, setLatestChatResponse] = useState<AdvisorChatResponse | null>(null);
  const queryClient = useQueryClient();
  const spendingSectionRef = useRef<HTMLElement | null>(null);
  const goalsSectionRef = useRef<HTMLElement | null>(null);
  const riskSectionRef = useRef<HTMLElement | null>(null);
  const recommendationsSectionRef = useRef<HTMLElement | null>(null);
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
  const resolvedSelectedGoalId =
    goalsQuery.data?.some((goal) => goal.id === selectedGoalId)
      ? selectedGoalId
      : goalsQuery.data?.[0]?.id ?? '';
  const selectedGoal = useMemo(
    () => goalsQuery.data?.find((goal) => goal.id === resolvedSelectedGoalId) ?? null,
    [goalsQuery.data, resolvedSelectedGoalId],
  );
  const goalProjectionQuery = useQuery({
    queryKey: ['goal-projection', activeCustomerId, resolvedSelectedGoalId],
    queryFn: () => wealthApi.getGoalProjection(activeCustomerId, resolvedSelectedGoalId),
    enabled: Boolean(activeCustomerId && resolvedSelectedGoalId),
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
  const advisorChatQuery = useQuery({
    queryKey: ['advisor-chat-messages', activeCustomerId],
    queryFn: () => wealthApi.getAdvisorChatMessages(activeCustomerId),
    enabled: Boolean(activeCustomerId),
  });
  const sendChatMutation = useMutation({
    mutationFn: wealthApi.sendAdvisorChatMessage,
    onSuccess: (response) => {
      setLatestChatResponse(response);
      setChatDraft('');
      void queryClient.invalidateQueries({
        queryKey: ['advisor-chat-messages', response.customerId],
      });
    },
  });
  const createGoalMutation = useMutation({
    mutationFn: ({ customerId, request }: { customerId: string; request: CreateGoalRequest }) =>
      wealthApi.createGoal(customerId, request),
    onSuccess: (createdGoal) => {
      queryClient.setQueryData<Goal[]>(['goals', createdGoal.customerId], (currentGoals = []) => {
        if (currentGoals.some((goal) => goal.id === createdGoal.id)) {
          return currentGoals;
        }

        return [...currentGoals, createdGoal];
      });
      void queryClient.invalidateQueries({
        queryKey: ['goals', createdGoal.customerId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['goal-projection', createdGoal.customerId],
      });
      setSelectedGoalId(createdGoal.id);
      resetGoalForm();
      setIsGoalDialogOpen(false);
    },
  });

  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) ?? null;
  const resetGoalForm = () => {
    setGoalForm(createBlankGoalForm());
    setGoalFormErrors({});
    createGoalMutation.reset();
  };

  const handleCustomerChange = (event: SelectChangeEvent<string>) => {
    setSelectedCustomerId(event.target.value);
    setSelectedGoalId('');
    setIsGoalDialogOpen(false);
    resetGoalForm();
    setLatestChatResponse(null);
    setChatDraft('');
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const handleSendChatMessage = (message: string) => {
    const trimmedMessage = message.trim();

    if (!activeCustomerId || !trimmedMessage) {
      return;
    }

    sendChatMutation.mutate({
      customerId: activeCustomerId,
      message: trimmedMessage,
    });
  };

  const openGoalDialog = () => {
    resetGoalForm();
    setGoalFormErrors({});
    setIsGoalDialogOpen(true);
  };

  const handleGoalFieldChange = <K extends keyof GoalFormState>(
    field: K,
    value: GoalFormState[K],
  ) => {
    setGoalForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateGoal = () => {
    const validationErrors = validateGoalForm(goalForm);
    setGoalFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !activeCustomerId) {
      return;
    }

    const request = buildGoalRequest(goalForm);

    createGoalMutation.mutate({
      customerId: activeCustomerId,
      request,
    });
  };

  const handleUseGoalForRecommendation = (goalId: string) => {
    setSelectedGoalId(goalId);
    recommendationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleActionCard = (actionCard: AdvisorChatActionCard) => {
    const target =
      actionCard.type === 'OPEN_SPENDING_INSIGHTS'
        ? spendingSectionRef.current
        : actionCard.type === 'OPEN_GOAL_PLANNER'
          ? goalsSectionRef.current
          : actionCard.type === 'OPEN_RISK_PROFILE'
            ? riskSectionRef.current
            : actionCard.type === 'OPEN_RECOMMENDATIONS'
              ? recommendationsSectionRef.current
              : null;

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (actionCard.type === 'REQUEST_ADVISOR_CALLBACK') {
      setChatDraft('Request advisor callback');
      setIsChatOpen(true);
      return;
    }

    if (target) {
      setIsChatOpen(false);
    }
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
              onOpenChat={openChat}
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
                <Box ref={spendingSectionRef}>
                  {spendingInsightsQuery.data ? (
                    <SpendingInsightsPanel insights={spendingInsightsQuery.data} />
                  ) : (
                    <EmptyState title="No spending insights available" />
                  )}
                </Box>
              </SectionStatus>

              <Stack spacing={3}>
                <SectionStatus
                  isLoading={goalsQuery.isLoading}
                  error={goalsQuery.error}
                  onRetry={() => void goalsQuery.refetch()}
                  label="goals"
                >
                  <Box ref={goalsSectionRef}>
                    <GoalsPanel
                      goals={goalsQuery.data ?? []}
                      selectedGoalId={selectedGoalId}
                      selectedGoal={selectedGoal}
                      projection={goalProjectionQuery.data}
                      isProjectionLoading={goalProjectionQuery.isLoading}
                      projectionError={goalProjectionQuery.error}
                      isCreatingGoal={createGoalMutation.isPending}
                      createGoalError={createGoalMutation.error}
                      onOpenCreateGoal={openGoalDialog}
                      onSelectGoal={setSelectedGoalId}
                      onRetryProjection={() => void goalProjectionQuery.refetch()}
                      onUseGoalForRecommendation={handleUseGoalForRecommendation}
                    />
                  </Box>
                </SectionStatus>

                <SectionStatus
                  isLoading={riskProfileQuery.isLoading}
                  error={isNotFound(riskProfileQuery.error) ? null : riskProfileQuery.error}
                  onRetry={() => void riskProfileQuery.refetch()}
                  label="risk profile"
                >
                  <Box ref={riskSectionRef}>
                    <RiskProfileStatus riskProfile={riskProfileQuery.data} />
                  </Box>
                </SectionStatus>

                <SectionStatus
                  isLoading={recommendationsQuery.isLoading}
                  error={recommendationsQuery.error}
                  onRetry={() => void recommendationsQuery.refetch()}
                  label="recommendations"
                >
                  <Box ref={recommendationsSectionRef}>
                    <RecommendationPreview
                      recommendations={recommendationsQuery.data ?? []}
                      hasGoals={(goalsQuery.data?.length ?? 0) > 0}
                      selectedGoal={selectedGoal}
                    />
                  </Box>
                </SectionStatus>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <AvatarChatLauncher
          isOpen={isChatOpen}
          hasMessages={(advisorChatQuery.data?.length ?? 0) > 0}
          onOpen={openChat}
        />

        {isChatOpen ? (
          <AvatarChatPopup onClose={() => setIsChatOpen(false)}>
            <SectionStatus
              isLoading={advisorChatQuery.isLoading}
              error={advisorChatQuery.error}
              onRetry={() => void advisorChatQuery.refetch()}
              label="advisor chat"
            >
              <AvatarChatPanel
                customerId={activeCustomerId}
                messages={advisorChatQuery.data ?? []}
                draft={chatDraft}
                latestResponse={
                  latestChatResponse?.customerId === activeCustomerId ? latestChatResponse : null
                }
                isSending={sendChatMutation.isPending}
                sendError={sendChatMutation.error}
                onDraftChange={setChatDraft}
                onSend={handleSendChatMessage}
                onActionCard={handleActionCard}
              />
            </SectionStatus>
          </AvatarChatPopup>
        ) : null}

        <GoalCreateDialog
          open={isGoalDialogOpen}
          form={goalForm}
          errors={goalFormErrors}
          isSubmitting={createGoalMutation.isPending}
          error={createGoalMutation.error}
          onClose={() => {
            setIsGoalDialogOpen(false);
            resetGoalForm();
          }}
          onFieldChange={handleGoalFieldChange}
          onSubmit={handleCreateGoal}
        />
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

function AvatarChatLauncher(props: { isOpen: boolean; hasMessages: boolean; onOpen: () => void }) {
  if (props.isOpen) {
    return null;
  }

  return (
    <IconButton
      onClick={props.onOpen}
      aria-label="Open advisor chat"
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 28 },
        bottom: { xs: 16, md: 28 },
        zIndex: 1200,
        width: 58,
        height: 58,
        bgcolor: 'primary.main',
        color: 'common.white',
        boxShadow: 8,
        '&:hover': {
          bgcolor: 'primary.dark',
        },
      }}
      size="large"
    >
      <ChatBubbleOutlineIcon />
    </IconButton>
  );
}

function AvatarChatPopup(props: { children: ReactNode; onClose: () => void }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 12, md: 28 },
        bottom: { xs: 12, md: 28 },
        width: { xs: 'calc(100vw - 24px)', sm: 440 },
        maxWidth: 'calc(100vw - 24px)',
        height: { xs: 'min(680px, calc(100vh - 24px))', sm: 680 },
        maxHeight: 'calc(100vh - 24px)',
        zIndex: 1300,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.dark',
          color: 'common.white',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <ChatBubbleOutlineIcon fontSize="small" />
          <Typography fontWeight={800} noWrap>
            Avatar advisor
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={props.onClose}
          sx={{
            color: 'common.white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          p: 1.25,
          overflow: 'hidden',
        }}
      >
        {props.children}
      </Box>
    </Box>
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
  onOpenChat: () => void;
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
          <Button
            variant="contained"
            endIcon={<ChatBubbleOutlineIcon />}
            onClick={props.onOpenChat}
          >
            Ask advisor
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

const suggestedPrompts = [
  'Can I invest INR 10,000 per month?',
  'How is my spending this month?',
  'Help me create a goal.',
  'Explain my recommendation.',
  'Should I complete my risk profile?',
  'Request advisor callback.',
];

function AvatarChatPanel(props: {
  customerId: string;
  messages: AdvisorChatMessage[];
  draft: string;
  latestResponse: AdvisorChatResponse | null;
  isSending: boolean;
  sendError: Error | null;
  onDraftChange: (value: string) => void;
  onSend: (message: string) => void;
  onActionCard: (actionCard: AdvisorChatActionCard) => void;
}) {
  const visibleMessages = props.messages.slice(-8);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
    >
      <Alert severity="info" variant="outlined" sx={{ flex: '0 0 auto' }}>
        Ask about spending, affordability, goals, risk profiling, or existing recommendations.
        Product choices stay controlled by backend rules.
      </Alert>

      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: '#f9fbfb',
          overflow: 'hidden',
        }}
      >
        <Scrollbars
          autoHide
          autoHideTimeout={700}
          autoHideDuration={160}
          universal
          renderTrackVertical={(scrollbarProps) => (
            <Box
              {...scrollbarProps}
              sx={{
                position: 'absolute',
                width: 6,
                right: 4,
                top: 4,
                bottom: 4,
                borderRadius: 999,
              }}
            />
          )}
          renderThumbVertical={(scrollbarProps) => (
            <Box
              {...scrollbarProps}
              sx={{
                bgcolor: 'rgba(18, 76, 99, 0.38)',
                borderRadius: 999,
              }}
            />
          )}
        >
          <Box sx={{ p: 1.25 }}>
            {visibleMessages.length === 0 ? (
              <EmptyState
                title="Start with a suggested prompt"
                description="The advisor can explain data-backed insights and route you to approved next steps."
              />
            ) : (
              <Stack spacing={1.25}>
                {visibleMessages.map((message) => (
                  <ChatMessageBubble key={message.id} message={message} />
                ))}
              </Stack>
            )}
          </Box>
        </Scrollbars>
      </Box>

      <Stack
        direction="row"
        spacing={0.75}
        flexWrap="wrap"
        useFlexGap
        sx={{
          flex: '0 0 auto',
          maxHeight: 74,
          overflow: 'hidden',
        }}
      >
        {suggestedPrompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            variant="outlined"
            size="small"
            onClick={() => props.onSend(prompt)}
            disabled={props.isSending || !props.customerId}
          />
        ))}
      </Stack>

      {props.latestResponse ? (
        <AdvisorResponseActions response={props.latestResponse} onActionCard={props.onActionCard} />
      ) : null}

      {props.sendError ? (
        <Alert severity="error" variant="outlined" sx={{ flex: '0 0 auto' }}>
          Could not send the message. Check the API server and try again.
        </Alert>
      ) : null}

      <Box
        component="form"
        sx={{ flex: '0 0 auto' }}
        onSubmit={(event) => {
          event.preventDefault();
          props.onSend(props.draft);
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            size="small"
            value={props.draft}
            onChange={(event) => props.onDraftChange(event.target.value)}
            placeholder="Ask your wealth advisor..."
            disabled={props.isSending || !props.customerId}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={props.isSending || !props.customerId || !props.draft.trim()}
            sx={{
              width: 42,
              height: 42,
              bgcolor: 'primary.main',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            {props.isSending ? <CircularProgress size={18} /> : <SendIcon />}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

function ChatMessageBubble({ message }: { message: AdvisorChatMessage }) {
  const isCustomer = message.role === 'customer';
  const isSystem = message.role === 'system';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCustomer ? 'flex-end' : 'flex-start',
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: '92%', md: '76%' },
          bgcolor: isCustomer ? 'primary.main' : isSystem ? 'warning.light' : 'background.paper',
          color: isCustomer ? 'common.white' : 'text.primary',
          border: '1px solid',
          borderColor: isCustomer ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 1.25,
          overflowWrap: 'anywhere',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          {isCustomer ? 'You' : isSystem ? 'Guardrail' : 'Advisor'}
        </Typography>
        <Typography sx={{ mt: 0.25 }}>{message.message}</Typography>
      </Box>
    </Box>
  );
}

function AdvisorResponseActions(props: {
  response: AdvisorChatResponse;
  onActionCard: (actionCard: AdvisorChatActionCard) => void;
}) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: props.response.intent === 'unsupported_advice' ? 'warning.main' : 'divider',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Stack spacing={1.25}>
        <Typography variant="h3">Advisor response actions</Typography>
        <Typography color="text.secondary">{props.response.disclaimer}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {props.response.actionCards.map((actionCard) => (
            <Button
              key={`${actionCard.type}-${actionCard.label}`}
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => props.onActionCard(actionCard)}
            >
              {actionCard.label}
            </Button>
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

function GoalsPanel(props: {
  goals: Goal[];
  selectedGoalId: string;
  selectedGoal: Goal | null;
  projection: GoalProjection | undefined;
  isProjectionLoading: boolean;
  projectionError: Error | null;
  isCreatingGoal: boolean;
  createGoalError: Error | null;
  onOpenCreateGoal: () => void;
  onSelectGoal: (goalId: string) => void;
  onRetryProjection: () => void;
  onUseGoalForRecommendation: (goalId: string) => void;
}) {
  if (props.goals.length === 0) {
    return (
      <Stack spacing={1.5}>
        <Alert severity="info" variant="outlined">
          Create a goal to unlock backend projection and recommendation handoff.
        </Alert>
        <EmptyState
          title="No goals yet"
          description="Create a first goal for education, home purchase, retirement, or wealth building."
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={props.onOpenCreateGoal}
          sx={{ alignSelf: 'flex-start' }}
        >
          Create goal
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box>
          <Typography variant="h3">Your goals</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a goal to review the deterministic projection and set up the next step.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={props.onOpenCreateGoal}>
          Create goal
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '0.95fr 1.05fr' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={1.25}>
          {props.goals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                : 0;
            const isSelected = goal.id === props.selectedGoalId;

            return (
              <ButtonBase
                key={goal.id}
                onClick={() => props.onSelectGoal(goal.id)}
                sx={{
                  borderRadius: 1,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'rgba(18, 76, 99, 0.04)' : 'background.paper',
                    borderRadius: 1,
                    p: 1.5,
                    boxShadow: isSelected ? 1 : 0,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" gap={1} alignItems="start">
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                        <Typography fontWeight={800} noWrap>
                          {goal.name}
                        </Typography>
                        {isSelected ? <Chip label="Selected" color="primary" size="small" /> : null}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {formatGoalTypeLabel(goal.type)} · target {formatCurrency(goal.targetAmount)} ·
                        {` due ${formatGoalDate(goal.targetDate)}`}
                      </Typography>
                    </Box>
                    <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                      {formatCurrency(goal.currentAmount)}
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 7, borderRadius: 1, mt: 1.25 }}
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1 }}
                  >
                    <Chip
                      label={goal.status.toUpperCase()}
                      size="small"
                      variant={isSelected ? 'filled' : 'outlined'}
                    />
                    <Chip
                      label={`Priority: ${goal.priority}`}
                      size="small"
                      variant="outlined"
                    />
                    {goal.plannedMonthlyContribution ? (
                      <Chip
                        label={`Planned ${formatCurrency(goal.plannedMonthlyContribution)}/mo`}
                        size="small"
                        variant="outlined"
                      />
                    ) : null}
                  </Stack>
                </Box>
              </ButtonBase>
            );
          })}
        </Stack>

        <GoalProjectionPanel
          goal={props.selectedGoal}
          projection={props.projection}
          isLoading={props.isProjectionLoading}
          error={props.projectionError}
          createGoalError={props.createGoalError}
          isCreatingGoal={props.isCreatingGoal}
          onRetry={props.onRetryProjection}
          onUseGoalForRecommendation={props.onUseGoalForRecommendation}
        />
      </Box>
    </Stack>
  );
}

function GoalProjectionPanel(props: {
  goal: Goal | null;
  projection: GoalProjection | undefined;
  isLoading: boolean;
  error: Error | null;
  createGoalError: Error | null;
  isCreatingGoal: boolean;
  onRetry: () => void;
  onUseGoalForRecommendation: (goalId: string) => void;
}) {
  if (!props.goal) {
    return (
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography fontWeight={800}>Select a goal</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Projection details appear here after you choose a goal from the list.
        </Typography>
      </Box>
    );
  }

  const goal = props.goal;

  if (props.isLoading) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper',
          minHeight: 240,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading projection...</Typography>
        </Stack>
      </Box>
    );
  }

  if (props.error) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1.25}>
          <Typography fontWeight={800}>Could not load projection</Typography>
          <Typography color="text.secondary">{props.error.message}</Typography>
          <Button variant="outlined" onClick={props.onRetry} sx={{ alignSelf: 'flex-start' }}>
            Retry projection
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!props.projection) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography color="text.secondary">Projection data is not available yet.</Typography>
      </Box>
    );
  }

  const statusColor =
    props.projection.achievabilityStatus === 'ACHIEVABLE'
      ? 'success'
      : props.projection.achievabilityStatus === 'AT_RISK'
        ? 'warning'
        : 'error';
  const shortfallIsPositive = props.projection.shortfallOrSurplus >= 0;
  const shortfallLabel = shortfallIsPositive ? 'Surplus' : 'Shortfall';
  const shortfallAmount = Math.abs(props.projection.shortfallOrSurplus);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip label={props.projection.achievabilityStatus} color={statusColor} size="small" />
          <Chip label={formatGoalTypeLabel(goal.type)} variant="outlined" size="small" />
          <Button
            variant="outlined"
            size="small"
            endIcon={<OpenInNewIcon />}
            onClick={() => props.onUseGoalForRecommendation(goal.id)}
            disabled={props.isCreatingGoal}
          >
            Continue to recommendations
          </Button>
        </Stack>

        <Box>
          <Typography variant="h3">{goal.name}</Typography>
          <Typography color="text.secondary">
            Due {formatGoalDate(goal.targetDate)} · backend projection as of{' '}
            {formatProjectionDate(props.projection.calculatedAt)}
          </Typography>
        </Box>

        {props.createGoalError ? (
          <Alert severity="error" variant="outlined">
            {props.createGoalError.message}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gap: 1.25,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <MetricCard
            label="Projected amount"
            value={formatCurrency(props.projection.projectedAmount)}
          />
          <MetricCard
            label="Required monthly contribution"
            value={formatCurrency(props.projection.requiredMonthlyContribution)}
          />
          <MetricCard
            label="Planned monthly contribution"
            value={formatCurrency(props.projection.plannedMonthlyContribution)}
          />
          <MetricCard
            label="Months remaining"
            value={`${props.projection.monthsRemaining.toLocaleString('en-IN')} months`}
          />
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: shortfallIsPositive ? 'success.light' : 'warning.light',
            borderRadius: 1,
            p: 1.5,
            bgcolor: shortfallIsPositive ? 'rgba(36, 122, 77, 0.05)' : 'rgba(166, 106, 0, 0.05)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {shortfallLabel}
          </Typography>
          <Typography variant="h2" color={shortfallIsPositive ? 'success.main' : 'warning.main'}>
            {formatCurrency(shortfallAmount)}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {shortfallIsPositive
              ? 'Projected savings exceed the target amount at the current plan.'
              : 'The current plan still falls short of the target and needs a higher contribution or longer horizon.'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="h3" gutterBottom>
            Suitability notes
          </Typography>
          <Stack spacing={1}>
            {props.projection.explanations.map((explanation) => (
              <Typography key={explanation} color="text.secondary" variant="body2">
                {explanation}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="h3" gutterBottom>
            Step-up suggestion
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {props.projection.stepUpSuggestion.explanation}
          </Typography>
          {props.projection.stepUpSuggestion.isRequired ? (
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              <Typography variant="body2" fontWeight={700}>
                Suggested annual step-up: {props.projection.stepUpSuggestion.suggestedAnnualStepUpPercent}%
              </Typography>
              {props.projection.stepUpSuggestion.estimatedProjectedAmountWithStepUp !== null ? (
                <Typography variant="body2" color="text.secondary">
                  Estimated projected amount with step-up:{' '}
                  {formatCurrency(props.projection.stepUpSuggestion.estimatedProjectedAmountWithStepUp)}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
        </Box>

        <Box>
          <Typography variant="h3" gutterBottom>
            Projection assumptions
          </Typography>
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              Compounding frequency: {props.projection.assumptions.compoundingFrequency}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inflation adjusted: {props.projection.assumptions.inflationAdjusted ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Returns are illustrative: {props.projection.assumptions.returnsAreIllustrative ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Projected returns are illustrative only and do not guarantee outcomes.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function GoalCreateDialog(props: {
  open: boolean;
  form: GoalFormState;
  errors: GoalFormErrors;
  error: Error | null;
  isSubmitting: boolean;
  onClose: () => void;
  onFieldChange: <K extends keyof GoalFormState>(field: K, value: GoalFormState[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create goal</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {props.error ? <Alert severity="error">{props.error.message}</Alert> : null}

          <TextField
            label="Goal name"
            value={props.form.name}
            onChange={(event) => props.onFieldChange('name', event.target.value)}
            error={Boolean(props.errors.name)}
            helperText={props.errors.name ?? 'Enter a clear goal title.'}
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small" error={Boolean(props.errors.goalType)}>
            <Select
              value={props.form.goalType}
              onChange={(event) => props.onFieldChange('goalType', event.target.value as GoalType | '')}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select goal type
              </MenuItem>
              {goalTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{props.errors.goalType ?? 'Choose the closest supported goal type.'}</FormHelperText>
          </FormControl>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <TextField
              label="Target amount"
              value={props.form.targetAmount}
              onChange={(event) => props.onFieldChange('targetAmount', event.target.value)}
              error={Boolean(props.errors.targetAmount)}
              helperText={props.errors.targetAmount ?? 'Total amount needed for the goal.'}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, step: '1' }}
              InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
            />
            <TextField
              label="Current savings"
              value={props.form.currentSavings}
              onChange={(event) => props.onFieldChange('currentSavings', event.target.value)}
              error={Boolean(props.errors.currentSavings)}
              helperText={props.errors.currentSavings ?? 'Amount already saved for this goal.'}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, step: '1' }}
              InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <TextField
              label="Target date"
              value={props.form.targetDate}
              onChange={(event) => props.onFieldChange('targetDate', event.target.value)}
              error={Boolean(props.errors.targetDate)}
              helperText={props.errors.targetDate ?? 'Select a future date.'}
              fullWidth
              size="small"
              type="date"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTomorrowDateInputValue() }}
            />
            <FormControl fullWidth size="small" error={Boolean(props.errors.priority)}>
              <Select
                value={props.form.priority}
                onChange={(event) => props.onFieldChange('priority', event.target.value as CreateGoalPriority | '')}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select priority
                </MenuItem>
                {goalPriorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{props.errors.priority ?? 'Choose how urgently the goal should be funded.'}</FormHelperText>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <TextField
              label="Planned monthly contribution"
              value={props.form.plannedMonthlyContribution}
              onChange={(event) =>
                props.onFieldChange('plannedMonthlyContribution', event.target.value)
              }
              error={Boolean(props.errors.plannedMonthlyContribution)}
              helperText={props.errors.plannedMonthlyContribution ?? 'Optional. Leave blank to use backend fallback.'}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, step: '1' }}
              InputProps={{ startAdornment: <InputAdornment position="start">INR</InputAdornment> }}
            />
            <TextField
              label="Expected annual return %"
              value={props.form.expectedAnnualReturnPercent}
              onChange={(event) =>
                props.onFieldChange('expectedAnnualReturnPercent', event.target.value)
              }
              error={Boolean(props.errors.expectedAnnualReturnPercent)}
              helperText={props.errors.expectedAnnualReturnPercent ?? 'Optional. Range 0 to 15.'}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0, max: 15, step: '0.1' }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={props.onClose} disabled={props.isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={props.onSubmit}
          disabled={props.isSubmitting}
          startIcon={props.isSubmitting ? <CircularProgress size={16} /> : <AddIcon />}
        >
          Create goal
        </Button>
      </DialogActions>
    </Dialog>
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
  selectedGoal: Goal | null;
}) {
  const latest = props.recommendations.at(-1);

  if (!latest) {
    return (
      <Section title="Recommendations" icon={<TrendingUpIcon />}>
        <Stack spacing={1.25}>
          {props.selectedGoal ? (
            <Alert severity="info" variant="outlined">
              Selected goal for the next recommendation: <strong>{props.selectedGoal.name}</strong>
            </Alert>
          ) : null}
          <EmptyState
            title="No recommendation yet"
            description={
              props.hasGoals
                ? 'Generate a recommendation after confirming risk profile and capacity.'
                : 'Create a goal first so the engine can recommend against a clear target.'
            }
          />
        </Stack>
      </Section>
    );
  }

  return (
    <Section title="Recommendations" icon={<TrendingUpIcon />}>
      <Stack spacing={1.25}>
        {props.selectedGoal ? (
          <Alert severity="info" variant="outlined">
            Selected goal for the next recommendation: <strong>{props.selectedGoal.name}</strong>
          </Alert>
        ) : null}
        {'recommendationId' in latest ? (
          <GeneratedRecommendationSummary recommendation={latest} />
        ) : (
          <SeededRecommendationSummary recommendation={latest} />
        )}
      </Stack>
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

const goalTypeOptions: Array<{ value: GoalType; label: string }> = [
  { value: 'emergency-fund', label: 'Emergency fund' },
  { value: 'home', label: 'Home purchase' },
  { value: 'education', label: 'Education' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'travel', label: 'Travel' },
  { value: 'wealth-building', label: 'Wealth building' },
];

const goalPriorityOptions: Array<{ value: CreateGoalPriority; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

interface GoalFormState {
  goalType: GoalType | '';
  name: string;
  targetAmount: string;
  currentSavings: string;
  targetDate: string;
  priority: CreateGoalPriority | '';
  plannedMonthlyContribution: string;
  expectedAnnualReturnPercent: string;
}

type GoalFormErrors = Partial<Record<keyof GoalFormState, string>>;

function createBlankGoalForm(): GoalFormState {
  return {
    goalType: '',
    name: '',
    targetAmount: '',
    currentSavings: '',
    targetDate: getDateInputValueFromOffset(12),
    priority: 'MEDIUM',
    plannedMonthlyContribution: '',
    expectedAnnualReturnPercent: '',
  };
}

function buildGoalRequest(form: GoalFormState): CreateGoalRequest {
  return {
    goalType: form.goalType as GoalType,
    name: form.name.trim(),
    targetAmount: Number(form.targetAmount),
    currentSavings: Number(form.currentSavings),
    targetDate: form.targetDate,
    priority: form.priority as CreateGoalPriority,
    plannedMonthlyContribution: parseOptionalNumber(form.plannedMonthlyContribution),
    expectedAnnualReturnPercent: parseOptionalNumber(form.expectedAnnualReturnPercent),
  };
}

function validateGoalForm(form: GoalFormState): GoalFormErrors {
  const errors: GoalFormErrors = {};
  const today = getTodayDateInputValue();

  if (!goalTypeOptions.some((option) => option.value === form.goalType)) {
    errors.goalType = 'Select a supported goal type.';
  }

  if (!form.name.trim()) {
    errors.name = 'Goal name is required.';
  }

  if (!isPositiveNumber(form.targetAmount)) {
    errors.targetAmount = 'Target amount must be greater than 0.';
  }

  if (!isNonNegativeNumber(form.currentSavings)) {
    errors.currentSavings = 'Current savings must be greater than or equal to 0.';
  }

  if (!form.targetDate || form.targetDate <= today) {
    errors.targetDate = 'Target date must be in the future.';
  }

  if (!goalPriorityOptions.some((option) => option.value === form.priority)) {
    errors.priority = 'Select a supported priority.';
  }

  if (form.plannedMonthlyContribution.trim()) {
    const plannedMonthlyContribution = Number(form.plannedMonthlyContribution);

    if (!Number.isFinite(plannedMonthlyContribution) || plannedMonthlyContribution < 0) {
      errors.plannedMonthlyContribution =
        'Planned monthly contribution must be greater than or equal to 0.';
    }
  }

  if (form.expectedAnnualReturnPercent.trim()) {
    const expectedAnnualReturnPercent = Number(form.expectedAnnualReturnPercent);

    if (
      !Number.isFinite(expectedAnnualReturnPercent) ||
      expectedAnnualReturnPercent < 0 ||
      expectedAnnualReturnPercent > 15
    ) {
      errors.expectedAnnualReturnPercent = 'Expected annual return must be between 0 and 15.';
    }
  }

  return errors;
}

function formatGoalTypeLabel(goalType: GoalType): string {
  return goalTypeOptions.find((option) => option.value === goalType)?.label ?? goalType;
}

function formatGoalDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatProjectionDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getTodayDateInputValue(): string {
  return toDateInputValue(new Date());
}

function getDateInputValueFromOffset(monthsAhead: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return toDateInputValue(date);
}

function getTomorrowDateInputValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isPositiveNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function isNonNegativeNumber(value: string): boolean {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
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
