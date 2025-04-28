import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid
} from '@mui/material';

export default function MinimalMuiPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Material UI Test
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page demonstrates that Material UI components are rendering correctly with proper theming.
        </Typography>
        
        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
          />
          
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="I agree to the terms and conditions"
            sx={{ mt: 2 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
          
          <Grid container justifyContent="center">
            <Grid item>
              <Link href="/" variant="body2">
                Return to Homepage
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}