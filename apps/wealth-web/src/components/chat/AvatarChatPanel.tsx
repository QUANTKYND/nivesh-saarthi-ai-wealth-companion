import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import { Alert, Box, Button, Chip, CircularProgress, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import type {
  AdvisorChatActionCard,
  AdvisorChatMessage,
  AdvisorChatResponse,
} from '@wealth/shared-types';
import { Scrollbars } from 'react-custom-scrollbars-next';
import { suggestedPrompts } from '../../constants/chat';
import { EmptyState } from '../common/EmptyState';

export function AvatarChatPanel(props: {
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
    <Stack spacing={1.25} sx={{ height: '100%', minHeight: 0 }}>
      <Alert severity="info" variant="outlined" sx={{ flex: '0 0 auto' }}>
        Ask about spending, affordability, goals, risk profiling, or existing recommendations.
        Product choices stay controlled by backend rules.
      </Alert>

      <Paper
        variant="outlined"
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
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
      </Paper>

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
            aria-label="Send advisor message"
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
    </Stack>
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
      <Paper
        variant="outlined"
        sx={{
          maxWidth: { xs: '92%', md: '76%' },
          bgcolor: isCustomer ? 'primary.main' : isSystem ? 'warning.light' : 'background.paper',
          color: isCustomer ? 'common.white' : 'text.primary',
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
      </Paper>
    </Box>
  );
}

function AdvisorResponseActions(props: {
  response: AdvisorChatResponse;
  onActionCard: (actionCard: AdvisorChatActionCard) => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
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
    </Paper>
  );
}
