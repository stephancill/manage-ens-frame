import { Button } from "frames.js/next";
import { NameWithAvatar } from "../../components/NameWithAvatar";
import { Heading } from "../../components/heading";
import { getEnsProfile } from "../../ens/getEnsProfile";
import { frames } from "../frames";
import { handleManageImpl } from "../manage/handleManageImpl";
import { formatExpiration, imageUrl } from "../../utils";
import { farcasterHubContext } from "frames.js/middleware";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const POST = frames(
  async (ctx) => {
    if (!ctx.message) {
      throw new Error("No message");
    }

    if (ctx.message.inputText) {
      return handleManageImpl({
        ctx,
        searchParams: { ...ctx.searchParams, name: ctx.message.inputText },
      });
    }

    const addresses = ctx.message.requesterVerifiedAddresses;
    const username = ctx.message.requesterUserData?.username;

    const [...ensResults] = await Promise.all([
      username ? { profile: await getEnsProfile(username) } : {},
      ...addresses.map(async (address) => ({
        address,
        profile: await getEnsProfile(address),
      })),
    ]);

    // Filter out and deduplicate profiles
    const ensProfiles = ensResults
      .filter((e) => Boolean(e.profile?.ens))
      .filter(
        (e, i, a) => a.findIndex((x) => x.profile?.ens === e.profile?.ens) === i
      );

    if (ensProfiles.length === 0) {
      return {
        image: imageUrl(<div>No addresses to check</div>),
        textInput: "Search for an ENS name",
        buttons: [
          <Button action="post" target="/">
            ← Back
          </Button>,
          <Button action="post" target="/check-names">
            Search
          </Button>,
        ],
      };
    }

    return {
      image: imageUrl(
        <div tw="flex flex-col">
          <Heading>Your Names</Heading>
          <div tw="flex flex-col">
            {ensProfiles.map((e) => (
              <div tw="flex flex-col">
                <div tw="flex flex-row items-center" key={e.profile?.address}>
                  <div tw="mr-1 -ml-2 flex items-center">
                    <NameWithAvatar
                      avatar={e.profile!.avatar_url}
                      name={e.profile!.ens}
                    />
                  </div>
                  {e.profile?.address && (
                    <span tw="flex">
                      ({truncateAddress(e.profile.address)})
                    </span>
                  )}
                </div>
                {e.profile?.expiry && (
                  <div tw="flex text-gray-500">
                    expires in {formatExpiration(e.profile.expiry)}
                  </div>
                )}
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
          {e.profile!.ens}
        </Button>
      )) as any,
    };
  },
  {
    middleware: [farcasterHubContext({ hubHttpUrl: process.env.HUB_HTTP_URL })],
  }
);
