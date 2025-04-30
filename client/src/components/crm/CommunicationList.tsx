import { useCommunications } from '../../hooks/useCommunications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Send,
  Trash,
  Edit,
  Mail,
  Bell,
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export const CommunicationList = () => {
  const {
    communications,
    isLoadingCommunications,
    sendCommunication,
    deleteCommunication,
    isSendingCommunication,
    isDeletingCommunication
  } = useCommunications();

  // Helper to get the badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            <Timer className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case 'sent':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            {status}
          </Badge>
        );
    }
  };

  // Helper to get the channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoadingCommunications) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications</CardTitle>
        <CardDescription>Manage your outgoing messages and campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        {communications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No communications found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first communication using the compose panel
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communications.map((comm: any) => (
                <TableRow key={comm.id}>
                  <TableCell className="font-medium">{comm.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getChannelIcon(comm.channel)}
                      <span className="ml-2 capitalize">{comm.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(comm.status)}</TableCell>
                  <TableCell>
                    {comm.createdAt ? format(new Date(comm.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {comm.scheduledAt ? format(new Date(comm.scheduledAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {comm.status === 'draft' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendCommunication(comm.id)}
                          disabled={isSendingCommunication}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteCommunication(comm.id)}
                        disabled={isDeletingCommunication}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};