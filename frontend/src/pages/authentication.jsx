import { useState, useRef, useContext } from "react";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { Snackbar } from "@mui/material";

const defaultTheme = createTheme();

export default function Authentication() {
  const nameRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [error, setError] = useState();
  const [message, setMessage] = useState();

  const [formState, setFormState] = useState(0);

  const [open, setOpen] = useState(false);

  const { handleSignup, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    try {
      const name = nameRef.current?.value;
      const username = usernameRef.current?.value;
      const password = passwordRef.current?.value;

      if (formState === 0) {
        let result = await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleSignup(name, username, password);
        console.log(result);

        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);

        if (nameRef.current) nameRef.current.value = "";
        if (usernameRef.current) usernameRef.current.value = "";
        if (passwordRef.current) passwordRef.current.value = "";
      }
    } catch (err) {
      console.log(err);
      let message = err.response.data.message;
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={12}
          sm={4}
          md={7}
          sx={{
            flexGrow: 1,
            height: "100vh",
            backgroundImage: "url('https://picsum.photos/1920/1080')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: { xs: 320, sm: 450 },
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <div>
              <Button
                variant={formState === 0 ? "contained" : ""}
                onClick={() => {
                  setFormState(0);
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : ""}
                onClick={() => {
                  setFormState(1);
                }}
              >
                Sign Up
              </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 ? (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Full Name"
                  name="username"
                  inputRef={nameRef}
                  autoFocus
                />
              ) : (
                <></>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                inputRef={usernameRef}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                inputRef={passwordRef}
              />

              <p style={{ color: "red" }}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login " : "Signup"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  );
}
