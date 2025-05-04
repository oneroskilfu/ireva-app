import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <FileQuestion className="h-20 w-20 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl mb-6 text-muted-foreground max-w-md text-center">
        The page you are looking for could not be found.
      </p>
      <Button onClick={() => setLocation('/')} variant="default">
        Return to Home
      </Button>
    </div>
  );
};

export default NotFound;