import {
  AppBar,
  Button,
  Toolbar as MUIToolbar,
  Typography,
} from "@mui/material";

const Toolbar = ({ onSignOut }) => {
  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "#3f51b5" }}
    >
      <MUIToolbar>
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
      </MUIToolbar>
    </AppBar>
  );
};

export default Toolbar;
