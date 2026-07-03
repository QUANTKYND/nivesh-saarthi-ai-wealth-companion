import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Grid,
  Paper,
  Stack,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import type {
  AdvisorChatActionCard,
  AdvisorChatResponse,
  CreateGoalRequest,
  Goal,
} from '@wealth/shared-types';
import { wealthApi } from './api';
import { AvatarChatLauncher } from './components/chat/AvatarChatLauncher';
import { AvatarChatPanel } from './components/chat/AvatarChatPanel';
import { AvatarChatPopup } from './components/chat/AvatarChatPopup';
import { EmptyState } from './components/common/EmptyState';
import { SectionStatus } from './components/common/SectionStatus';
import { CustomerSwitcher } from './components/customer/CustomerSwitcher';
import { AvatarAdvisorCard } from './components/dashboard/AvatarAdvisorCard';
import { HeaderBand } from './components/dashboard/HeaderBand';
import { RecommendationPreview } from './components/dashboard/RecommendationPreview';
import { RiskProfileStatus } from './components/dashboard/RiskProfileStatus';
import { SpendingInsightsPanel } from './components/dashboard/SpendingInsightsPanel';
import { WealthOverview } from './components/dashboard/WealthOverview';
import { GoalCreateDialog } from './components/goals/GoalCreateDialog';
import { GoalsPanel } from './components/goals/GoalsPanel';
import { RiskProfileWizard } from './components/risk-profile/RiskProfileWizard';
import { AdvisorCallbackDialog } from './components/callbacks/AdvisorCallbackDialog';
import { AdvisorCallbackAdminPanel } from './components/callbacks/AdvisorCallbackAdminPanel';
import { DemoGuidePanel } from './components/demo/DemoGuidePanel';
import { theme } from './theme';
import type { GoalFormErrors, GoalFormState } from './types/goalForm';
import { isNotFound } from './utils/errors';
import { buildGoalRequest, createBlankGoalForm, validateGoalForm } from './utils/goalForm';
import Scrollbars from 'react-custom-scrollbars-next';

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isRiskWizardOpen, setIsRiskWizardOpen] = useState(false);
  const [isCallbackDialogOpen, setIsCallbackDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'customer' | 'advisor'>('customer');
  const [callbackSource, setCallbackSource] = useState<'RECOMMENDATION' | 'CHAT' | 'MANUAL'>(
    'MANUAL',
  );
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
  const resolvedSelectedGoalId = goalsQuery.data?.some((goal) => goal.id === selectedGoalId)
    ? selectedGoalId
    : (goalsQuery.data?.[0]?.id ?? '');
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
  const advisorCallbacksQuery = useQuery({
    queryKey: ['advisor-callbacks', activeCustomerId],
    queryFn: () => wealthApi.getAdvisorCallbacks(activeCustomerId),
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

  const openRiskWizard = () => {
    setIsRiskWizardOpen(true);
  };
  const openCallbackDialog = (source: 'RECOMMENDATION' | 'CHAT' | 'MANUAL' = 'MANUAL') => {
    setCallbackSource(source);
    setIsCallbackDialogOpen(true);
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

  const handleAskDemoCapacity = () => {
    setActiveView('customer');
    setIsChatOpen(true);
    handleSendChatMessage('Can I invest Rs 10,000 per month?');
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
      openCallbackDialog('CHAT');
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
          height: '100vh',
          bgcolor: 'background.default',
          background: 'linear-gradient(180deg, rgba(18,76,99,0.08) 0%, rgba(245,247,248,0) 280px)',
        }}
      >
        <Scrollbars>
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
                width: '100%',
                mx: 'auto',
                px: { xs: 2, md: 3 },
              }}
            >
              <AutoGraphIcon color="primary" />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={800} noWrap>
                  Digital Bank
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  Nivesh Saarthi Wealth Advisor
                </Typography>
              </Box>

              <CustomerSwitcher
                customers={customers}
                value={activeCustomerId}
                isLoading={customersQuery.isLoading}
                onChange={handleCustomerChange}
              />
              <ToggleButtonGroup
                exclusive
                size="small"
                value={activeView}
                onChange={(_, value: 'customer' | 'advisor' | null) => {
                  if (value) {
                    setActiveView(value);
                    setIsChatOpen(false);
                  }
                }}
                sx={{ bgcolor: 'background.paper' }}
              >
                <ToggleButton value="customer">Customer</ToggleButton>
                <ToggleButton value="advisor">Advisor</ToggleButton>
              </ToggleButtonGroup>
            </Toolbar>
          </AppBar>

          {activeView === 'customer' ? (
            <>
              <Grid container spacing={3} p={{ xs: 2, md: 3 }} sx={{ pb: { xs: 11, md: 4 } }}>
                <Grid size={{ xs: 12 }}>
                  <HeaderBand
                    customer={activeCustomer}
                    profile={wealthProfileQuery.data}
                    isLoading={customersQuery.isLoading || wealthProfileQuery.isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DemoGuidePanel
                    customer={activeCustomer}
                    hasGoals={(goalsQuery.data?.length ?? 0) > 0}
                    riskProfile={riskProfileQuery.data}
                    hasRecommendations={(recommendationsQuery.data?.length ?? 0) > 0}
                    hasAdvisorCallbacks={(advisorCallbacksQuery.data?.length ?? 0) > 0}
                    onAskCapacity={handleAskDemoCapacity}
                    onOpenGoals={() =>
                      goalsSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }
                    onOpenRiskProfile={openRiskWizard}
                    onOpenRecommendations={() =>
                      recommendationsSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }
                    onRequestCallback={() => openCallbackDialog('MANUAL')}
                    onOpenAdmin={() => setActiveView('advisor')}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <AvatarAdvisorCard
                    profile={wealthProfileQuery.data}
                    goals={goalsQuery.data}
                    riskProfile={riskProfileQuery.data}
                    recommendations={recommendationsQuery.data}
                    onOpenChat={openChat}
                  />
                </Grid>
                <Grid size={12}>
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
                </Grid>
                <Grid size={{ xs: 12, lg: 7 }}>
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
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
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
                        <RiskProfileStatus
                          riskProfile={riskProfileQuery.data}
                          onOpenWizard={openRiskWizard}
                        />
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
                          customerId={activeCustomerId}
                          goals={goalsQuery.data ?? []}
                          riskProfile={riskProfileQuery.data}
                          recommendations={recommendationsQuery.data ?? []}
                          selectedGoal={selectedGoal}
                          onSelectGoal={setSelectedGoalId}
                          onCreateGoal={openGoalDialog}
                          onTakeRiskProfile={openRiskWizard}
                          onOpenAdvisorCallback={() => {
                            openCallbackDialog('RECOMMENDATION');
                          }}
                        />
                      </Box>
                    </SectionStatus>
                  </Stack>
                </Grid>
              </Grid>
              <AvatarChatLauncher
                isOpen={isChatOpen}
                hasMessages={(advisorChatQuery.data?.length ?? 0) > 0}
                onOpen={openChat}
              />
            </>
          ) : (
            <Grid container spacing={3} p={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
                  <Stack spacing={0.75}>
                    <Typography variant="h2">Advisor operations workspace</Typography>
                    <Typography color="text.secondary">
                      Review callback requests, customer context, recommendation summaries, and
                      latest advisor chat summaries before contacting the customer.
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <AdvisorCallbackAdminPanel />
              </Grid>
            </Grid>
          )}

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
          {activeCustomerId ? (
            <RiskProfileWizard
              customerId={activeCustomerId}
              isOpen={isRiskWizardOpen}
              onClose={() => setIsRiskWizardOpen(false)}
              hasGoals={(goalsQuery.data?.length ?? 0) > 0}
              onCreateGoal={openGoalDialog}
              onProfileSaved={(result) => {
                void queryClient.setQueryData(['risk-profile', result.customerId], result);
                void queryClient.invalidateQueries({
                  queryKey: ['risk-profile', result.customerId],
                });
              }}
              onUseRecommendations={() => {
                setIsRiskWizardOpen(false);
                recommendationsSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            />
          ) : null}
          {activeCustomerId ? (
            <AdvisorCallbackDialog
              customerId={activeCustomerId}
              open={isCallbackDialogOpen}
              onClose={() => setIsCallbackDialogOpen(false)}
              source={callbackSource}
              onCreated={() => {
                void queryClient.invalidateQueries({
                  queryKey: ['advisor-callbacks', activeCustomerId],
                });
                void queryClient.invalidateQueries({ queryKey: ['admin-advisor-callbacks'] });
              }}
            />
          ) : null}
        </Scrollbars>
        <Paper
          elevation={8}
          sx={{
            display: { xs: activeView === 'customer' ? 'block' : 'none', md: 'none' },
            position: 'fixed',
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 1200,
            borderRadius: 2,
            p: 0.75,
          }}
        >
          <Stack direction="row" spacing={0.75} justifyContent="space-between">
            <Button
              size="small"
              onClick={() =>
                goalsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Goals
            </Button>
            <Button size="small" onClick={openRiskWizard}>
              Risk
            </Button>
            <Button
              size="small"
              onClick={() =>
                recommendationsSectionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            >
              Plan
            </Button>
            <Button size="small" onClick={openChat}>
              Chat
            </Button>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;
