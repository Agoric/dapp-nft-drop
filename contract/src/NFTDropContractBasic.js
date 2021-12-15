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
  const { pricePerNFT, nftName } = zcf.getTerms();

  // Set up the mint
  const mint = await zcf.makeZCFMint(nftName, AssetKind.SET);
  const { brand: NFTBrand } = mint.getIssuerRecord();

  let currentId = 1n;
  const { zcfSeat: sellerSeat } = zcf.makeEmptySeatKit();

  /** @type {OfferHandler} */
  const buyNFTs = (buyerSeat) => {
    // Mint the NFTs
    const amount = AmountMath.make(NFTBrand, harden([currentId]));
    mint.mintGains(harden({ NFTs: amount }), buyerSeat);
    currentId += 1n;

    // Take the money
    sellerSeat.incrementBy(buyerSeat.decrementBy(harden({ Money: pricePerNFT })));

    zcf.reallocate(buyerSeat, sellerSeat);
    buyerSeat.exit();

    return 'your offer was successful';
  };

  const publicFacet = Far('NFT Drop', {
    makeInvitation: () => zcf.makeInvitation(buyNFTs, 'buyNFTs'),
  });

  return harden({ publicFacet });
};

harden(start);
export { start };
