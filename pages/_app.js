import "regenerator-runtime/runtime";
import "../styles/globals.css";
import { ThirdwebProvider } from "@3rdweb/react";

function MyApp({ Component, pageProps }) {
  // Ethereum chain ID
  const supportedChainIds = [4];

  // Support only Matemask
  const connectors = {
    injected: {},
  };

  return (
    <ThirdwebProvider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <Component {...pageProps} />{" "}
    </ThirdwebProvider>
  );
}

export default MyApp;
