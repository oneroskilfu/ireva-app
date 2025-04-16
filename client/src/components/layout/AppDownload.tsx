import { Button } from "@/components/ui/button";

// Apple Icon SVG component
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.05 20.28c-.98.95-2.05.86-3.09.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.5 3.51 7.7 8.62 7.45c1.36.05 2.32.66 3.11.67.93-.06 1.82-.56 3.09-.6 1.44.06 2.55.53 3.23 1.33-2.7 1.7-2.2 5.5.19 6.66-.5 1.27-1.13 2.6-2.19 4.77zM12.03 7.26c-.15-2.23 1.66-4.13 3.67-4.26.29 2.44-2.12 4.25-3.67 4.26z" />
    </svg>
  );
}

// Android Icon SVG component
function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.523 15.34a.887.887 0 01-.885.888.882.882 0 01-.885-.889V9.621c0-.491.398-.889.885-.889.489 0 .885.398.885.889v5.718zm-9.005-.001a.882.882 0 01-.884.889.884.884 0 01-.884-.889V9.621a.884.884 0 01.884-.889c.49 0 .884.398.884.889v5.718zM20.09 9.522c0-.491-.398-.889-.884-.889a.882.882 0 00-.884.889v8.466c0 .49.398.889.884.889a.884.884 0 00.884-.889V9.522zm-3.45 10.478c0 .49.398.889.885.889a.884.884 0 00.887-.889v-1.15h-.006c.134.023.27.04.408.04h.027c1.086 0 1.969-.868 1.969-1.935V9.23h.006v-.17c0-1.066-.883-1.934-1.969-1.934h-.027c-.697 0-1.301.359-1.646.898a3.757 3.757 0 00-2.32-.792h-.058a3.753 3.753 0 00-2.32.792c-.346-.539-.95-.898-1.645-.898h-.029c-1.086 0-1.968.868-1.968 1.934v.17h.004v7.726c0 1.067.884 1.935 1.969 1.935h.028c.139 0 .274-.017.41-.04h.004v1.149c0 .49.398.889.886.889a.883.883 0 00.884-.889v-1.149h.004c.136.023.273.04.41.04h.028c.61 0 1.153-.272 1.517-.698.365.426.91.698 1.518.698h.03c.136 0 .274-.017.408-.04h.006v1.149zm-2.977-3.109c.364.426.91.698 1.517.698h.03c.607 0 1.153-.272 1.516-.698.366.426.91.698 1.518.698h.029c.168 0 .33-.023.481-.064V9.522a.884.884 0 00-.885-.889c-.49 0-.886.398-.886.889v5.718a.882.882 0 01-.885.889.884.884 0 01-.886-.889V9.522a.884.884 0 00-.885-.889c-.49 0-.884.398-.884.889v5.718c0 .49-.399.889-.886.889a.884.884 0 01-.886-.889V9.522a.884.884 0 00-.885-.889c-.49 0-.885.398-.885.889v7.306c.154.41.315.64.483.064h.028c.607 0 1.153-.272 1.516-.698l.003-.003zM5.776 18.097a.884.884 0 00.885-.889V9.622a.884.884 0 00-.885-.889.884.884 0 00-.885.889v7.586c0 .49.398.889.885.889zm11.618-14.825l.772-1.39c.056-.104.019-.231-.08-.289-.1-.055-.232-.012-.29.092l-.793 1.421c-.677-.3-1.43-.467-2.227-.467-.796 0-1.551.168-2.227.467l-.795-1.421c-.056-.104-.19-.145-.29-.092-.1.058-.136.188-.08.289l.773 1.389c-1.297.645-2.18 1.835-2.312 3.2h9.86c-.133-1.365-1.016-2.555-2.31-3.2zm-4.457 1.83c-.238 0-.43-.19-.43-.428 0-.236.192-.428.43-.428.236 0 .428.192.428.428 0 .235-.192.428-.428.428zm4.055 0c-.237 0-.428-.19-.428-.428 0-.236.19-.428.428-.428.237 0 .428.192.428.428 0 .235-.191.428-.428.428z" />
    </svg>
  );
}

export default function AppDownload() {
  return (
    <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Download Our Mobile App</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your investments, receive updates, and manage your portfolio on the go with our mobile application.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <Button 
            variant="outline"
            className="bg-black text-white hover:bg-black/90 border-0 h-14 w-full sm:w-48 flex items-center justify-center gap-2"
          >
            <AppleIcon className="h-7 w-7" />
            <div className="flex flex-col items-start">
              <span className="text-xs">Download on the</span>
              <span className="text-base font-semibold">App Store</span>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="bg-black text-white hover:bg-black/90 border-0 h-14 w-full sm:w-48 flex items-center justify-center gap-2"
          >
            <AndroidIcon className="h-7 w-7" />
            <div className="flex flex-col items-start">
              <span className="text-xs">GET IT ON</span>
              <span className="text-base font-semibold">Google Play</span>
            </div>
          </Button>
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="bg-white shadow-lg rounded-lg p-4 inline-flex items-center">
            <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded-full mr-4">
              <div className="text-primary text-2xl font-bold">QR</div>
            </div>
            <div>
              <p className="font-semibold">Scan to download</p>
              <p className="text-sm text-gray-500">Or visit ireva.com/app</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}