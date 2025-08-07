import dynamic from "next/dynamic";

export const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => {
        const WalletMultiButton = mod.WalletMultiButton;

        interface StyledWalletMultiButtonProps {
            className?: string;
            [key: string]: unknown;
        }

        return function StyledWalletMultiButton(props: StyledWalletMultiButtonProps) {
            return (
                <div className="wallet-button-wrapper">
                    <WalletMultiButton
                        {...props}
                        className="!bg-primary !text-white !font-medium !rounded-md !px-4 !py-2 !hover:bg-primary/90 !transition-all !border !border-border !shadow-sm"
                    />
                </div>
            );
        };
      }
    ),
  {
    ssr: false,
    loading: () => {
      return (
        <div
          className="bg-muted border border-border rounded-md animate-pulse flex items-center"
          style={{
            width: "173.47px",
            height: "48px",
            padding: "0 12px",
            gap: "8px",
          }}
        >
          <div
            className="rounded-full bg-purple-400/30"
            style={{ width: "24px", height: "24px" }}
          ></div>
          <div
            className="h-4 bg-muted-foreground/20 rounded-sm"
            style={{ width: "100px" }}
          ></div>
        </div>
      );
    },
  }
);
