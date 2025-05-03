import { cn } from "@/lib/utils";

interface ProcessingProps {
    className?: string;
    message?: string;
}

const Processing = ({ className, message = 'Processing...' }: ProcessingProps) => {
  return (
        <div className={cn('bg-background/50 absolute inset-0 min-h-screen z-50 flex items-center justify-center', className)}>
                <div className="bg-background flex flex-col items-center justify-center space-y-2 rounded-md p-4 shadow-md">
                <svg className="text-primary h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                </svg>
                <p className="text-foreground text-sm">{message}</p>
            </div>
        </div>
    )
}

export default Processing