import { LoaderCircle } from 'lucide-react';
import { Button } from './button';

interface ProcessingButtonProps extends React.ComponentProps<typeof Button> {
  processing?: boolean;
  children: React.ReactNode;
}

function ProcessingButton({ processing, children, ...props }: ProcessingButtonProps) {
  return (
    <Button disabled={processing} {...props}>
      {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}

export default ProcessingButton;