import { Button } from "frames.js/next";
import { TESTNET_ENABLED, mainnetWithEns } from "../../client";
import { NameWithAvatar } from "../../components/NameWithAvatar";
import { Heading } from "../../components/heading";
import { getEnsProfile } from "../../ens/getEnsProfile";
import { frames } from "../frames";
import { imageUrl } from "../../utils";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const POST = frames(async (ctx) => {
  if (!ctx.message) {
    throw new Error("No message");
  }

  const addresses = ctx.message.requesterVerifiedAddresses;

  const ensResults = await Promise.all(
    addresses.map(async (address) => ({
      address,
      profile: await getEnsProfile(address),
    }))
  );

  const ensProfiles = ensResults.filter((e) => Boolean(e.profile?.ens));

  if (ensProfiles.length === 0) {
    return {
      image: <div>No addresses to check</div>,
      buttons: [
        <Button action="post" target="/check-names">
          Check names
        </Button>,
      ],
    };
  }

  return {
    image: (
      <div tw="flex flex-col">
        <Heading>Your Names</Heading>
        <div tw="flex flex-col">
          {ensProfiles.map((e) => (
            <div tw="flex flex-row items-center" key={e.address}>
              <div tw="mr-1 -ml-2 flex">
                <NameWithAvatar
                  avatar={e.profile!.avatar_url}
                  name={e.profile!.ens}
                />
              </div>
              ({truncateAddress(e.address)})
            </div>
          ))}
        </div>
      </div>
    ),
    buttons: ensProfiles.slice(0, 4).map((e) => (
      <Button
        action="post"
        target={{ pathname: "/manage", query: { name: e.profile?.ens } }}
      >
        {e.profile!.ens!.toString()}
      </Button>
    )) as any,
  };
});
