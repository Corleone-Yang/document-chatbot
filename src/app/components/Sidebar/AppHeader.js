import { AppBar, Button, Toolbar, Typography } from "@mui/material";

const AppHeader = ({ onSignOut }) => {
  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#3f51b5" }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          DocTelligence
        </Typography>
        <Button color="inherit" onClick={onSignOut}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
