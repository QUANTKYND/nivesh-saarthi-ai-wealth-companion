import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { Avatar, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { Goal, RiskProfileResult, WealthProfile } from '@wealth/shared-types';
import type { DashboardRecommendation } from '../../api';
import { formatCurrency } from '../../utils/formatters';

export function AvatarAdvisorCard(props: {
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
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: 'primary.main',
            color: 'common.white',
            flex: '0 0 auto',
          }}
        >
          <PersonSearchIcon fontSize="large" />
        </Avatar>

        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h2">Avatar advisor</Typography>
          <Typography color="text.secondary">
            {props.profile
              ? `I found ${formatCurrency(props.profile.idleBalance)} idle balance and ${formatCurrency(props.profile.monthlySurplus)} monthly surplus to review for goals.`
              : 'Connect the dashboard APIs to surface personalized advisor prompts.'}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {readiness.map((item) => (
            <Chip
              key={item.label}
              label={`${item.label}: ${item.complete ? 'Ready' : 'Pending'}`}
              color={item.complete ? 'success' : 'default'}
              variant={item.complete ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
          <Tooltip title="Ask advisor">
            <IconButton color="primary" onClick={props.onOpenChat} aria-label="Ask advisor">
              <ChatBubbleOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
