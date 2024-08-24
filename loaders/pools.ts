import { Program } from "@coral-xyz/anchor";
import { Lavarage } from "../idl/lavarage";

export async function loadPoolsFromAnchor(anchor: Program<Lavarage>) {
  return await anchor.account.pool.all([
    {
      memcmp: {
        offset: 49,
        bytes: '6riP1W6R3qzUPWYwLGtXEC23aTqmyAEdDtXzhntJquAh',
      },
    },
  ])
}