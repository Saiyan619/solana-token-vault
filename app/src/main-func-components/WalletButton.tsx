import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css'; 

const WalletButton = () => {
        const { publicKey, connected, wallet } = useWallet();

  return (
    <div>
       <div className="gap-2 flex flex-wrap items-center">
       
              <div><WalletMultiButton className="w-full" /></div>
              <div> {connected && <WalletDisconnectButton className="w-full" />}</div>
              
                </div>

                {/* imposter */}
                {/* Connection Status */}
                {/* <div className="mb-6">
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
                </div> */}
    </div>
  )
}

export default WalletButton
