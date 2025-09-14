import { 
  Database, 
  ExternalLink, 
  Twitter, 
  Github,
  Lock
} from 'lucide-react';

import CreateVault from './main-func-components/CreateVault';
import DepositToken from './main-func-components/DepositToken';
import SettleTokens from './main-func-components/SettleTokens';
import WithDrawTokens from './main-func-components/WithDrawTokens';
import CloseVault from './main-func-components/CloseVault';
import WalletButton from './main-func-components/WalletButton';
import VaultDetails from './main-func-components/VaultDetails';

export const EscrowVaultApp = () => {

  return (
    <div className="min-h-screen bg-gradient-vault text-foreground">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center flex-wrap gap-2 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-2xl text-black font-bold">
                SolVault
              </h1>
            </div>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* CreateVault Section */}
          <CreateVault />

          <div className="space-y-6">
          {/* Deposit Section */}
           <DepositToken />
          </div>
        
          {/* SettleTokens Section */}
            <SettleTokens />

          <div className="space-y-6">
            {/* WithDrawTokens Section */}
            <WithDrawTokens />
          </div>

          {/* Close section */}
          <CloseVault />

        </div>

        {/* Vault Details */}
        <VaultDetails />
        
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-muted-foreground">SolVault - Secure Escrow on Solana</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};