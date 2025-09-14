import './App.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EscrowVaultApp } from './EscrowVaultApp';
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus:false
    }
  }
});

function App() {
    return (
    <>
          <QueryClientProvider client={queryClient}> 
      <div>
                <EscrowVaultApp />
          </div>
                 <Toaster />
                 </QueryClientProvider>
    </>
  )
}

export default App
