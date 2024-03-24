import { getPrice } from "@ensdomains/ensjs/public";
import { Button } from "frames.js/next";
import { formatEther } from "viem";
import { base, baseSepolia } from "viem/chains";
import { TESTNET_ENABLED, mainnetWithEns, publicClient } from "../../client";
import { NameWithAvatar } from "../../components/NameWithAvatar";
import { Heading } from "../../components/heading";
import { makeRenewTxData } from "../../ens/makeRenewTxData";
import { createRelayCall, getEthUsdPrice, numberWithCommas } from "../../utils";
import { frames } from "../frames";

function formatEtherDisplay(eth: bigint) {
  return parseFloat(formatEther(eth)).toPrecision(4);
}

function formatUsdDisplay(usd: number) {
  return numberWithCommas(
    // People don't care about cents when it's over $100
    usd > 100 ? usd.toPrecision(3) : usd.toFixed(2)
  );
}

export const POST = frames(async (ctx) => {
  const name = ctx.searchParams["name"];
  let avatar = ctx.searchParams["avatar"];

  if (!name) {
    throw new Error("No name");
  }

  if (!ctx.message) {
    throw new Error("No message");
  }

  let yearsInput = 1;

  if (ctx.message.inputText) {
    yearsInput = parseInt(ctx.message.inputText);
  }

  const duration = 31536000 * yearsInput;

  const [renewPrice, renewTxData, ethUsdPrice] = await Promise.all([
    getPrice(publicClient, {
      nameOrNames: name,
      duration,
    }),
    makeRenewTxData(publicClient, {
      nameOrNames: name,
      duration,
      value: BigInt(0), // Dummy value
    }),
    getEthUsdPrice(),
  ]);

  const { base: basePrice, premium } = renewPrice;

  const renewalEth = ((basePrice + premium) * BigInt(110)) / BigInt(100); // add 10% to the price for buffer
  const renewalUsd = ethUsdPrice * parseFloat(formatEther(renewalEth));

  const renewalEtherFormatted = formatEtherDisplay(renewalEth);
  const renewalUsdFormatted = formatUsdDisplay(renewalUsd);

  // const [gas, gasPrice] = await Promise.all([
  //   publicClient.estimateGas({
  //     ...renewTxData,
  //     value: renewalEth,
  //   }),
  //   publicClient.getGasPrice(),
  // ]);

  // Initiate cross-chain execution
  const { steps } = await createRelayCall({
    /**
     * An address that would never fail (WETH)
     * since we don't have access to the user's connected address
     */
    user: TESTNET_ENABLED
      ? // https://sepolia.etherscan.io/accounts
        "0x0000006916a87b82333f4245046623b23794C65C"
      : "0x4200000000000000000000000000000000000006",
    txs: [
      {
        ...renewTxData,
        value: renewalEth.toString(),
      },
    ],
    originChainId: TESTNET_ENABLED ? baseSepolia.id : base.id,
    destinationChainId: mainnetWithEns.id,
    source: "https://stephancill.co.za",
  });
  const relayTxData = steps[0].items?.[0].data;

  const totalFeesEther = BigInt(relayTxData.value) - renewalEth;
  const totalFeesUsd = ethUsdPrice * parseFloat(formatEther(totalFeesEther));

  const totalFeesEtherFormatted = formatEtherDisplay(totalFeesEther);
  const totalFeesUsdFormatted = formatUsdDisplay(totalFeesUsd);

  const totalEther = BigInt(relayTxData.value);
  const totalUsd = ethUsdPrice * parseFloat(formatEther(totalEther));

  const totalEtherFormatted = formatEtherDisplay(totalEther);
  const totalUsdFormatted = formatUsdDisplay(totalUsd);

  return {
    image: (
      <div tw="flex flex-col">
        <Heading>Renew</Heading>
        <div tw="flex items-center">
          Renewing <NameWithAvatar avatar={avatar} name={name} /> for{" "}
          {yearsInput} year{yearsInput > 1 ? "s" : ""}
        </div>
        <div tw="flex flex-row">
          <div tw="flex flex-col mt-4 mr-4">
            <div tw="flex text-gray-500">Renewal</div>
            <div tw="flex text-gray-500">Fees*</div>
            <div tw="flex">Total</div>
          </div>
          <div tw="flex flex-col mt-4">
            <div tw="flex text-gray-500">
              Ξ{renewalEtherFormatted} (${renewalUsdFormatted})
            </div>
            <div tw="flex text-gray-500">
              Ξ{totalFeesEtherFormatted} (${totalFeesUsdFormatted})
            </div>
            <div tw="flex">
              Ξ{totalEtherFormatted} (${totalUsdFormatted})
            </div>
          </div>
        </div>
        <div tw="mt-[50px] text-[24px] text-gray-500">
          *Approximate fees for execution from Base via relay.link
        </div>
      </div>
    ),
    buttons: [
      <Button action="post" target={{ pathname: "/manage", query: { name } }}>
        ← Back
      </Button>,
      <Button
        action="tx"
        target={{ pathname: "/renew-tx", query: { name } }}
        post_url={`/renew-tx-submitted?name=${name}`}
      >
        Pay (auto)
      </Button>,
    ],
  };
});
