import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FlagIcon from '@mui/icons-material/Flag';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import type { Customer, RiskProfileResult } from '@wealth/shared-types';

export function DemoGuidePanel(props: {
  customer: Customer | null;
  hasGoals: boolean;
  riskProfile: RiskProfileResult | null | undefined;
  hasRecommendations: boolean;
  hasAdvisorCallbacks: boolean;
  onAskCapacity: () => void;
  onOpenGoals: () => void;
  onOpenRiskProfile: () => void;
  onOpenRecommendations: () => void;
  onRequestCallback: () => void;
  onOpenAdmin: () => void;
}) {
  const steps = [
    {
      label: 'Avatar insight',
      done: Boolean(props.customer),
      icon: <PersonSearchIcon fontSize="small" />,
      action: 'Ask capacity',
      onClick: props.onAskCapacity,
    },
    {
      label: 'Goal selected',
      done: props.hasGoals,
      icon: <FlagIcon fontSize="small" />,
      action: 'Goals',
      onClick: props.onOpenGoals,
    },
    {
      label: 'Risk profile',
      done: Boolean(props.riskProfile),
      icon: <AssignmentTurnedInIcon fontSize="small" />,
      action: 'Risk',
      onClick: props.onOpenRiskProfile,
    },
    {
      label: 'Recommendation',
      done: props.hasRecommendations,
      icon: <TrendingUpIcon fontSize="small" />,
      action: 'Plan',
      onClick: props.onOpenRecommendations,
    },
    {
      label: 'Advisor handoff',
      done: props.hasAdvisorCallbacks,
      icon: <SupportAgentIcon fontSize="small" />,
      action: 'Callback',
      onClick: props.onRequestCallback,
    },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 1.5, md: 2 },
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h2">5-minute demo mode</Typography>
            <Typography color="text.secondary">
              Use {props.customer?.fullName ?? 'the active customer'} to walk through insight,
              suitability, recommendation, and handoff.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={props.onAskCapacity}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Ask Rs 10,000 capacity
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {steps.map((step) => (
            <Chip
              key={step.label}
              icon={step.icon}
              label={`${step.label}: ${step.done ? 'Ready' : step.action}`}
              color={step.done ? 'success' : 'default'}
              variant={step.done ? 'filled' : 'outlined'}
              onClick={step.onClick}
              sx={{ fontWeight: 700 }}
            />
          ))}
          <Chip label="Advisor dashboard" variant="outlined" onClick={props.onOpenAdmin} />
        </Stack>
      </Stack>
    </Paper>
  );
}
