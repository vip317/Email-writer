import { useState } from 'react';
import axios from 'axios';
import './App.css';
import {
  Container,
  Box,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/email/generate';

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      setError('Please enter email content.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedReply('');

    try {
      const { data } = await axios.post(backendUrl, { emailContent, tone });

      // Expecting JSON with "generatedReply" key
      setGeneratedReply(data.generatedReply || JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setError(
        '❌ Failed to generate email reply. Check backend, network, or API key.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setShowCopied(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        ✉️ AI Smart Email Assistant
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="tone-select-label">Tone</InputLabel>
          <Select
            labelId="tone-select-label"
            id="tone-select"
            value={tone}
            label="Tone"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Reply'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {generatedReply && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Reply:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={generatedReply}
            inputProps={{ readOnly: true }}
          />
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleCopy}>
            Copy to Clipboard
          </Button>
        </Box>
      )}

      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Copied to clipboard!"
      />
    </Container>
  );
}

export default App;
