import { Button } from "frames.js/next";
import { NameWithAvatar } from "../../components/NameWithAvatar";
import { getEnsProfile } from "../../ens/getEnsProfile";
import { frames } from "../frames";
import { Heading } from "../../components/heading";
import { formatExpiration, imageUrl } from "../../utils";

export const handleManageImpl = async (
  ctx: Parameters<Parameters<typeof frames>[0]>[0]
) => {
  const name = ctx.searchParams.name;
  const profile = await getEnsProfile(name);

  if (!profile) {
    return {
      image: imageUrl(
        <div tw="flex">Failed to fetch ENS profile for {name}</div>
      ),
    };
  }

  return {
    image: imageUrl(
      <div tw="flex flex-col">
        <Heading>Manage ENS</Heading>
        <div tw="flex -ml-2 items-center">
          <NameWithAvatar avatar={profile.avatar_url} name={name} /> (expires in{" "}
          {formatExpiration(profile.expiry)})
        </div>
      </div>
    ),
    textInput: "Years to renew (default: 1)",
    buttons: [
      <Button action="post" target={"/"}>
        ← Back
      </Button>,
      <Button
        action="post"
        target={{
          pathname: "/renew",
          query: { name, avatar: profile.avatar_url },
        }}
      >
        Renew
      </Button>,
    ] as [any, any],
  };
};
