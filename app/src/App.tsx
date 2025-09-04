import { useState } from 'react'
import './App.css'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { EscrowVaultApp } from './EscrowVaultApp';
function App() {
    const { publicKey, connected, wallet } = useWallet();  return (
    <>
      <div>
        hi this is my first dapp working with solana so escited
          <div className="mb-6 space-y-4">
                    <WalletMultiButton className="w-full" />
                    {connected && <WalletDisconnectButton className="w-full" />}
                </div>

                {/* imposter */}
                {/* Connection Status */}
                <div className="mb-6">
                    <p className="mb-2">
                        <strong>Status:</strong> {connected ? 'Connected' : 'Disconnected'}
                    </p>
                    
                    {wallet && (
                        <p className="mb-2">
                            <strong>Wallet:</strong> {wallet.adapter.name}
                        </p>
                    )}
                    
                    {publicKey && (
                        <div className="mb-2">
                            <strong>Address:</strong>
                            <p className="text-sm font-mono bg-gray-700 p-2 rounded mt-1 break-all">
                                {publicKey.toString()}
                            </p>
                        </div>
                    )}
                </div>

                <EscrowVaultApp />
     </div>
    </>
  )
}

export default App
