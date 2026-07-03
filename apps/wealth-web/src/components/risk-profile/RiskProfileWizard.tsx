import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type {
  RiskProfileQuestion,
  RiskProfileResult,
  SubmitRiskProfileAnswer,
} from '@wealth/shared-types';
import { wealthApi } from '../../api';
import { EmptyState } from '../common/EmptyState';
import { Section } from '../common/Section';

type AnswerMap = Record<string, string>;

export function RiskProfileWizard(props: {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  hasGoals: boolean;
  onCreateGoal: () => void;
  onUseRecommendations: () => void;
  onProfileSaved?: (result: RiskProfileResult) => void;
}) {
  const questionnaireQuery = useQuery({
    queryKey: ['risk-profile-questionnaire'],
    queryFn: wealthApi.getRiskProfileQuestionnaire,
    enabled: props.isOpen,
  });
  const existingProfileQuery = useQuery({
    queryKey: ['risk-profile', props.customerId],
    queryFn: () => wealthApi.getRiskProfile(props.customerId),
    enabled: props.isOpen && Boolean(props.customerId),
  });
  const submitMutation = useMutation({
    mutationFn: (request: { customerId: string; answers: SubmitRiskProfileAnswer[] }) =>
      wealthApi.submitRiskProfile(request.customerId, { answers: request.answers }),
    onSuccess: (result) => {
      setSubmittedProfile(result);
      props.onProfileSaved?.(result);
    },
  });

  const questionnaire = questionnaireQuery.data?.questions ?? [];
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submittedProfile, setSubmittedProfile] = useState<RiskProfileResult | null>(null);
  const [hideExistingProfile, setHideExistingProfile] = useState(false);

  const profile = submittedProfile ?? (hideExistingProfile ? null : existingProfileQuery.data ?? null);
  const currentQuestion = questionnaire[activeStep];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isComplete = Boolean(profile);

  const steps = useMemo(
    () => questionnaire.map((question) => question.label),
    [questionnaire],
  );

  const resetForRetake = () => {
    setActiveStep(0);
    setAnswers({});
    setSubmittedProfile(null);
    setHideExistingProfile(true);
    void existingProfileQuery.refetch();
  };

  const handleClose = () => {
    setHideExistingProfile(false);
    props.onClose();
  };

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (!currentQuestion || !selectedOptionId) {
      return;
    }

    if (activeStep < questionnaire.length - 1) {
      setActiveStep((current) => current + 1);
      return;
    }

    submitMutation.mutate({
      customerId: props.customerId,
      answers: questionnaire.map((question) => ({
        questionId: question.id,
        optionId: answers[question.id],
      })),
    });
  };

  const handleBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const questionError = questionnaireQuery.error as Error | null;
  const profileError = existingProfileQuery.error as Error | null;
  const submitError = submitMutation.error as Error | null;

  return (
    <Dialog open={props.isOpen} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h2">Risk profile wizard</Typography>
            <Typography variant="body2" color="text.secondary">
              Suitability profiling is required before generating market-linked recommendations.
            </Typography>
          </Box>
          <Chip
            label={isComplete ? profile?.category ?? 'Pending' : 'Not a recommendation'}
            color={isComplete ? 'primary' : 'default'}
            variant={isComplete ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800 }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.25}>
          {questionnaireQuery.isLoading ? <LinearProgress /> : null}

          {questionError ? (
            <Alert severity="error" variant="outlined">
              Could not load the questionnaire. Check the API and retry.
            </Alert>
          ) : null}

          {profileError ? (
            <Alert severity="warning" variant="outlined">
              Could not load an existing profile. You can still complete a new questionnaire.
            </Alert>
          ) : null}

          {submitError ? (
            <Alert severity="error" variant="outlined">
              {submitError.message}
            </Alert>
          ) : null}

          {profile ? (
            <RiskProfileResultScreen
              profile={profile}
            onRetake={resetForRetake}
              hasGoals={props.hasGoals}
              onCreateGoal={props.onCreateGoal}
              onUseRecommendations={props.onUseRecommendations}
            />
          ) : questionnaireQuery.isLoading ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography color="text.secondary">Loading suitability questionnaire...</Typography>
            </Paper>
          ) : questionnaire.length === 0 ? (
            <EmptyState
              title="No risk questions available"
              description="The backend questionnaire is empty. Add questions before enabling this flow."
            />
          ) : (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(18, 76, 99, 0.03)' }}>
                <Stack spacing={1.25}>
                  <Typography fontWeight={800}>Why we ask this</Typography>
                  <Typography color="text.secondary">
                    The answers help determine whether a plan should stay conservative, balanced,
                    or more growth-oriented. This does not recommend a product by itself.
                  </Typography>
                </Stack>
              </Paper>

              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <LinearProgress
                variant="determinate"
                value={((activeStep + 1) / questionnaire.length) * 100}
                sx={{ height: 8, borderRadius: 999 }}
              />

              {currentQuestion ? (
                <QuestionCard
                  question={currentQuestion}
                  selectedOptionId={selectedOptionId}
                  onSelect={handleSelect}
                  stepLabel={`${activeStep + 1} of ${questionnaire.length}`}
                />
              ) : null}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
        {profile ? (
          <>
            <Button variant="outlined" startIcon={<AutorenewIcon />} onClick={resetForRetake}>
              Retake
            </Button>
            <Button
              variant="contained"
              onClick={props.hasGoals ? props.onUseRecommendations : props.onCreateGoal}
              endIcon={<ArrowForwardIcon />}
            >
              {props.hasGoals ? 'View recommendations' : 'Create goal'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={activeStep === 0 || submitMutation.isPending}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedOptionId || submitMutation.isPending}
              endIcon={activeStep === questionnaire.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
            >
              {submitMutation.isPending
                ? 'Submitting...'
                : activeStep === questionnaire.length - 1
                  ? 'Submit answers'
                  : 'Next'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function QuestionCard(props: {
  question: RiskProfileQuestion;
  selectedOptionId?: string;
  onSelect: (questionId: string, optionId: string) => void;
  stepLabel: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Question {props.stepLabel}
            </Typography>
            <Typography variant="h3">{props.question.label}</Typography>
          </Box>
          <Chip label="Single choice" size="small" variant="outlined" />
        </Stack>
        {props.question.description ? (
          <Typography color="text.secondary">{props.question.description}</Typography>
        ) : null}
        <Divider />
        <RadioGroup
          value={props.selectedOptionId ?? ''}
          onChange={(event) => props.onSelect(props.question.id, event.target.value)}
        >
          <Stack spacing={1}>
            {props.question.options.map((option) => (
              <Paper
                key={option.id}
                variant="outlined"
                sx={{
                  borderColor: props.selectedOptionId === option.id ? 'primary.main' : 'divider',
                  bgcolor:
                    props.selectedOptionId === option.id ? 'rgba(18, 76, 99, 0.05)' : 'background.paper',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12 }}>
                  <Radio value={option.id} />
                  <Box sx={{ pt: 0.5 }}>
                    <Typography fontWeight={700}>{option.label}</Typography>
                    {option.explanation ? (
                      <Typography variant="body2" color="text.secondary">
                        {option.explanation}
                      </Typography>
                    ) : null}
                  </Box>
                </label>
              </Paper>
            ))}
          </Stack>
        </RadioGroup>
      </Stack>
    </Paper>
  );
}

function RiskProfileResultScreen(props: {
  profile: RiskProfileResult;
  onRetake: () => void;
  hasGoals: boolean;
  onCreateGoal: () => void;
  onUseRecommendations: () => void;
}) {
  return (
    <Section title="Risk profile result" icon={<AssignmentTurnedInIcon />}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip
            label={props.profile.category}
            color={props.profile.category === 'AGGRESSIVE' ? 'warning' : props.profile.category === 'MODERATE' ? 'primary' : 'success'}
            sx={{ fontWeight: 800 }}
          />
          <Chip label={`${props.profile.scorePercent}%`} variant="outlined" />
          <Chip label={`Updated ${new Date(props.profile.updatedAt).toLocaleDateString()}`} variant="outlined" />
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(18, 76, 99, 0.03)' }}>
          <Typography fontWeight={800} sx={{ mb: 0.5 }}>
            Suitability notes
          </Typography>
          <Stack spacing={0.75}>
            {props.profile.suitabilityNotes.map((note) => (
              <Typography key={note} color="text.secondary">
                {note}
              </Typography>
            ))}
          </Stack>
        </Paper>

        <Stack spacing={1}>
          <Typography fontWeight={800}>Explanation</Typography>
          {props.profile.explanation.map((line) => (
            <Typography key={line} color="text.secondary">
              {line}
            </Typography>
          ))}
        </Stack>

        <Stack spacing={1}>
          <Typography fontWeight={800}>Score breakdown</Typography>
          {props.profile.scoreBreakdown.map((row) => (
            <Paper key={row.questionId} variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={0.5}>
                <Typography fontWeight={700}>{row.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Selected: {row.selectedOptionLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {row.score}/{row.maxScore}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.explanation}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Alert severity="warning" variant="outlined">
          This risk profile is a suitability input, not a product recommendation.
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" startIcon={<AutorenewIcon />} onClick={props.onRetake}>
            Retake
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={props.hasGoals ? props.onUseRecommendations : props.onCreateGoal}
          >
            {props.hasGoals ? 'View recommendations' : 'Create goal'}
          </Button>
        </Stack>
      </Stack>
    </Section>
  );
}
