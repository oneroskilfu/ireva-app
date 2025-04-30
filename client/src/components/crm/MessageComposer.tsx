import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSegments } from '../../hooks/useSegments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  FormControl, 
  FormHelperText, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography, 
  FormControlLabel,
  Switch,
  Tooltip,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { 
  Schedule as ScheduleIcon,
  Send as SendIcon, 
  Save as SaveIcon, 
  People as PeopleIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Edit as EditNoteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { add } from 'date-fns';

interface FormData {
  title: string;
  content: string;
  channel: 'email' | 'push' | 'sms';
  segmentId: string;
  scheduledAt: Date | null;
  schedule: boolean;
}

const MessageComposer: React.FC = () => {
  const { segments, isLoading: segmentsLoading } = useSegments();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
      channel: 'email',
      segmentId: '',
      scheduledAt: add(new Date(), { hours: 1 }),
      schedule: false
    }
  });

  // Watch form values for preview
  const formValues = watch();
  
  // Create communication mutation
  const createCommunication = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        title: data.title,
        content: data.content,
        channel: data.channel,
        segmentId: data.segmentId || undefined,
        scheduledAt: data.schedule ? data.scheduledAt : undefined
      };
      
      const res = await apiRequest('POST', '/api/crm/communications', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
      reset();
    }
  });

  // Send communication immediately
  const sendCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      const res = await apiRequest('POST', `/api/crm/communications/${communicationId}/send`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    }
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      const result = await createCommunication.mutateAsync(data);
      
      // If not scheduled, send immediately
      if (!data.schedule && result.id) {
        await sendCommunication.mutateAsync(result.id);
      }
    } catch (error) {
      console.error('Error saving/sending communication:', error);
    }
  };

  // Helper to render channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon />;
      case 'push': return <NotificationsIcon />;
      case 'sms': return <SmsIcon />;
      default: return <EmailIcon />;
    }
  };

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto', py: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom display="flex" alignItems="center">
              <SendIcon sx={{ mr: 1 }} /> 
              Compose Message
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create and send communications to users based on segments and channels.
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button 
                variant={previewMode ? "outlined" : "contained"} 
                color="primary"
                onClick={() => setPreviewMode(false)}
                startIcon={<EditNoteIcon />}
              >
                Edit
              </Button>
              <Button 
                variant={previewMode ? "contained" : "outlined"} 
                color="primary"
                onClick={() => setPreviewMode(true)}
                startIcon={<VisibilityIcon />}
              >
                Preview
              </Button>
            </Box>
          </Grid>

          {previewMode ? (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    {getChannelIcon(formValues.channel)}
                    <Chip 
                      label={formValues.channel} 
                      color="primary" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                    {formValues.segmentId && (
                      <Chip 
                        icon={<PeopleIcon />}
                        label={segments?.find(s => s.id === formValues.segmentId)?.name || 'All Users'} 
                        color="secondary" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                    {formValues.schedule && (
                      <Chip 
                        icon={<ScheduleIcon />}
                        label={formValues.scheduledAt?.toLocaleString() || 'Scheduled'} 
                        color="info" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                  <Typography variant="h6" gutterBottom>{formValues.title || 'No Title'}</Typography>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    bgcolor: '#f9f9f9',
                    minHeight: '200px'
                  }}>
                    <Typography variant="body1">
                      {formValues.content || 'No content'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Title"
                    variant="outlined"
                    {...register('title', { required: 'Title is required' })}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.channel}>
                    <InputLabel>Channel</InputLabel>
                    <Controller
                      name="channel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Channel"
                        >
                          <MenuItem value="email">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EmailIcon sx={{ mr: 1 }} />
                              Email
                            </Box>
                          </MenuItem>
                          <MenuItem value="push">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <NotificationsIcon sx={{ mr: 1 }} />
                              Push Notification
                            </Box>
                          </MenuItem>
                          <MenuItem value="sms">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SmsIcon sx={{ mr: 1 }} />
                              SMS
                            </Box>
                          </MenuItem>
                        </Select>
                      )}
                    />
                    {errors.channel && <FormHelperText>{errors.channel.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Content"
                    variant="outlined"
                    multiline
                    rows={6}
                    {...register('content', { required: 'Content is required' })}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>User Segment</InputLabel>
                    <Controller
                      name="segmentId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="User Segment"
                          displayEmpty
                        >
                          <MenuItem value="">All Users</MenuItem>
                          {segmentsLoading ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} />
                              Loading segments...
                            </MenuItem>
                          ) : (
                            segments?.map(segment => (
                              <MenuItem key={segment.id} value={segment.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                                  {segment.name}
                                </Box>
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      Select a user segment or leave empty to target all users
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="schedule"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            checked={value}
                            onChange={onChange}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Schedule for later"
                  />
                  
                  {watch('schedule') && (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Controller
                        name="scheduledAt"
                        control={control}
                        render={({ field }) => (
                          <DateTimePicker
                            label="Schedule Date & Time"
                            value={field.value}
                            onChange={(date) => field.onChange(date)}
                            disablePast
                            sx={{ width: '100%', mt: 1 }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => reset()}
                      disabled={createCommunication.isPending || sendCommunication.isPending}
                    >
                      Reset
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={createCommunication.isPending || sendCommunication.isPending}
                      startIcon={watch('schedule') ? <ScheduleIcon /> : <SendIcon />}
                    >
                      {createCommunication.isPending || sendCommunication.isPending ? (
                        <CircularProgress size={24} />
                      ) : watch('schedule') ? (
                        'Schedule'
                      ) : (
                        'Send Now'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MessageComposer;