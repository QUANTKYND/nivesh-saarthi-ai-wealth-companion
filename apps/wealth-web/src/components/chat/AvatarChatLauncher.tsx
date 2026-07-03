import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Badge, IconButton, Tooltip } from '@mui/material';

export function AvatarChatLauncher(props: { isOpen: boolean; hasMessages: boolean; onOpen: () => void }) {
  if (props.isOpen) {
    return null;
  }

  return (
    <Tooltip title="Open advisor chat">
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
        <Badge
          color="secondary"
          variant="dot"
          invisible={!props.hasMessages}
          overlap="circular"
        >
          <ChatBubbleOutlineIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
