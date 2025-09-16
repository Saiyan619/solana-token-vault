import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletButton = () => {
    const { connected } = useWallet();

    return (
        <div>
            <div className="gap-2 flex flex-wrap items-center">

                <div><WalletMultiButton className="w-full" /></div>
                <div> {connected && <WalletDisconnectButton className="w-full" />}</div>

            </div>

        </div>
    )
}

export default WalletButton
