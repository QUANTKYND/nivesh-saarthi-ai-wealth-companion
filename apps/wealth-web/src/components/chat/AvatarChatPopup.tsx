import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function AvatarChatPopup(props: { children: ReactNode; onClose: () => void }) {
  return (
    <Paper
      elevation={12}
      sx={{
        position: 'fixed',
        right: { xs: 12, md: 28 },
        bottom: { xs: 12, md: 28 },
        width: { xs: 'calc(100vw - 24px)', sm: 440 },
        maxWidth: 'calc(100vw - 24px)',
        height: { xs: 'min(680px, calc(100vh - 24px))', sm: 680 },
        maxHeight: 'calc(100vh - 24px)',
        zIndex: 1300,
        borderRadius: 2,
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
        <Tooltip title="Close chat">
          <IconButton
            size="small"
            onClick={props.onClose}
            aria-label="Close advisor chat"
            sx={{ color: 'common.white' }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
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
    </Paper>
  );
}
