import { normalise } from "@ensdomains/ensjs/utils";
import { Button } from "frames.js/next";
import { NameWithAvatar } from "../../components/NameWithAvatar";
import { Heading } from "../../components/heading";
import { getEnsProfile } from "../../ens/getEnsProfile";
import { formatExpiration } from "../../utils";
import { frames } from "../frames";

function getEthTld(name: string) {
  const segments = name.split(".");

  // Return last 2 segments joined by a dot
  return segments.slice(-2).join(".");
}

export const handleManageImpl = async (
  ctx: Parameters<Parameters<typeof frames>[0]>[0]
) => {
  const nameRaw = ctx.searchParams.name as string | undefined;
  let name = getEthTld(nameRaw?.endsWith(".eth") ? nameRaw : `${nameRaw}.eth`);

  try {
    name = normalise(name);
  } catch (error) {
    return {
      image: <div tw="flex">Invalid ENS name</div>,
      buttons: [
        <Button action="post" target="/">
          ← Back
        </Button>,
      ] as [any],
    };
  }

  const profile = await getEnsProfile(name);

  if (!profile) {
    return {
      image: <div tw="flex">{name} is available to register</div>,
      buttons: [
        <Button action="post" target="/">
          ← Back
        </Button>,
        <Button
          action="link"
          target={`https://app.ens.domains/${name}/register`}
        >
          Register
        </Button>,
      ] as [any, any],
    };
  }

  return {
    image: (
      <div tw="flex flex-col">
        <Heading>Manage ENS</Heading>
        <div tw="flex -ml-2 items-center">
          <NameWithAvatar avatar={profile.avatar_url} name={profile.ens} />{" "}
          (expires in {formatExpiration(profile.expiry)})
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
          query: { name: profile.ens, avatar: profile.avatar_url },
        }}
      >
        Renew
      </Button>,
    ] as [any, any],
  };
};
