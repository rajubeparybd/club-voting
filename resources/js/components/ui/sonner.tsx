import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(143, 85%, 96%)",
          "--success-text": "hsl(140, 100%, 27%)",
          "--success-border": "hsl(145, 92%, 91%)",
          "--error-bg": "hsl(359, 100%, 97%)",
          "--error-text": "hsl(358, 100%, 33%)",
          "--error-border": "hsl(359, 100%, 94%)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          success: "group-[.toaster]:bg-[--success-bg] group-[.toaster]:text-[--success-text] group-[.toaster]:border-[--success-border]",
          error: "group-[.toaster]:bg-[--error-bg] group-[.toaster]:text-[--error-text] group-[.toaster]:border-[--error-border]",
        },
        duration: 3000
      }}
      richColors
      {...props}
    />
  )
}

export { Toaster }
