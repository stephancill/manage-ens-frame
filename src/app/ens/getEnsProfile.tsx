import { createEnsPublicClient } from "@ensdomains/ensjs";
import { http, isAddress } from "viem";
import { TESTNET_ENABLED, mainnetWithEns, publicClient } from "../client";
import { normalise } from "@ensdomains/ensjs/utils";

interface ENSProfile {
  address?: string;
  avatar?: string;
  avatar_url?: string;
  description?: string;
  ens: string;
  ens_primary?: string;
  expiry: Date;
}
export async function getEnsProfile(
  ensNameOrAddress: string
): Promise<ENSProfile | null> {
  let ensProfile: ENSProfile | null = null;

  if (TESTNET_ENABLED) {
    ensProfile = await getEnsProfileOnchain(ensNameOrAddress);
  } else {
    try {
      const [response, onchainProfile] = await Promise.all([
        // returns avatar_url for different types of avatar records
        fetch(`https://ensdata.net/${ensNameOrAddress}`),
        getEnsProfileOnchain(ensNameOrAddress),
      ]);
      if (!response.ok) {
        throw new Error(`Error fetching ENS profile: ${response.status}`);
      }

      if (!onchainProfile) {
        throw new Error("Failed to fetch ENS profile onchain");
      }

      const data: Omit<ENSProfile, "expiry"> = await response.json();
      ensProfile = { ...data, expiry: onchainProfile.expiry };
    } catch (error) {
      console.error("Failed to fetch ENS profile:", error);
      return null;
    }
  }
  return ensProfile;
}

async function getEnsProfileOnchain(
  ensNameOrAddress: string
): Promise<ENSProfile | null> {
  const ensClient = createEnsPublicClient({
    chain: mainnetWithEns,
    transport: http(),
  });

  if (isAddress(ensNameOrAddress)) {
    const ensName = await publicClient.getEnsName({
      address: ensNameOrAddress,
    });

    if (!ensName) {
      return null;
    }

    const expiry = await ensClient.getExpiry({ name: ensName });

    return {
      address: ensNameOrAddress,
      ens: ensName,
      expiry: expiry?.expiry!.date!,
    };
  } else {
    const ensName = normalise(ensNameOrAddress);

    const [address, expiry] = await Promise.all([
      publicClient.getEnsAddress({
        name: ensName,
      }),
      ensClient.getExpiry({ name: ensName }),
    ]);

    ensClient.getAddressRecord({ name: ensName });

    if (!expiry) {
      return null;
    }

    return {
      address: address || undefined,
      ens: ensNameOrAddress,
      expiry: expiry?.expiry!.date!,
    };
  }
}
