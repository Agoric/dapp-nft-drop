// @ts-check

// `Far` makes objects callable outside the contract code, and even
// callable off-chain!
import { Far } from '@agoric/marshal';

// ERTP is the library for dealing with NFTs and fungible tokens
import { AmountMath, AssetKind } from '@agoric/ertp';

// Import the JSDoc/TypeScript types from Zoe
import '@agoric/zoe/exported.js';

/** @type {ContractStartFn} */
const start = async (zcf) => {
  const { pricePerNFT, tokenName } = zcf.getTerms();

  const mint = await zcf.makeZCFMint(tokenName, AssetKind.SET);
  const { brand: NFTBrand } = mint.getIssuerRecord();

  let currentId = 1n;
  const { zcfSeat: sellerSeat } = zcf.makeEmptySeatKit();

  const buyNFTs = (buyerSeat) => {
    // Reallocate the money
    sellerSeat.incrementBy(buyerSeat.decrementBy({ Money: pricePerNFT }));

    // Mint and reallocate the NFTs
    const amount = AmountMath.make(NFTBrand, [currentId]);
    mint.mintGains({ NFTs: amount }, buyerSeat);
    currentId += 1n;

    zcf.reallocate(buyerSeat, sellerSeat);
    buyerSeat.exit();
  };

  const publicFacet = Far('NFT Drop', {
    makeInvitation: () => zcf.makeInvitation(buyNFTs, 'buyNFTs'),
  });

  return harden({ publicFacet });
};
harden(start);
export { start };
