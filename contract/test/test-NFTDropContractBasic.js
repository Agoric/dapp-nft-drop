// @ts-check

import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import path from 'path';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';

const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(filename);

const contractPath = `${dirname}/../src/NFTDropContractBasic.js`;

test('NFTDropContractBasic', async (t) => {
  // Imaginary tokens that we will use as money
  const {
    issuer: moneyIssuer,
    brand: moneyBrand,
    mint: moneyMint,
  } = makeIssuerKit('money');

  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse();
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse);

  // pack the contract
  const bundle = await bundleSource(contractPath);

  // install the contract
  const installation = E(zoe).install(bundle);

  const pricePerNFT = AmountMath.make(moneyBrand, 10n);

  const issuers = harden({ Money: moneyIssuer });
  const terms = harden({
    pricePerNFT,
    nftName: 'PetRocks',
  });
  const { instance } = await E(zoe).startInstance(installation, issuers, terms);

  // Make an offer
  const publicFacet = E(zoe).getPublicFacet(instance);
  const invitation = E(publicFacet).makeInvitation();

  const { PetRocks: nftIssuer } = await E(zoe).getIssuers(instance);
  const nftBrand = await E(nftIssuer).getBrand();

  const oneMoney = AmountMath.make(moneyBrand, 1n);

  const aLittleExtra = AmountMath.add(pricePerNFT, oneMoney);

  const proposal = harden({
    give: {
      Money: aLittleExtra,
    },
    want: {
      NFTs: AmountMath.make(nftBrand, harden([1n])),
    },
  });

  const payments = harden({
    Money: moneyMint.mintPayment(aLittleExtra),
  });

  const seat = E(zoe).offer(invitation, proposal, payments);

  const offerResult = await E(seat).getOfferResult();
  t.is(offerResult, 'your offer was successful');

  const nftPayment = await E(seat).getPayout('NFTs');
  const moneyPayment = await E(seat).getPayout('Money');

  const moneyPayoutAmount = await E(moneyIssuer).getAmountOf(moneyPayment);
  const nftPayoutAmount = await E(nftIssuer).getAmountOf(nftPayment);

  t.true(
    AmountMath.isEqual(nftPayoutAmount, AmountMath.make(nftBrand, harden([1n]))),
    `nftPayoutAmount value should be [1n] but was ${nftPayoutAmount.value}`,
  );

  t.true(
    AmountMath.isEqual(moneyPayoutAmount, AmountMath.make(moneyBrand, 1n)),
    `moneyPayoutAmount should be a refund of 1n, but was ${moneyPayoutAmount}`,
  );

  // Buy another
  const invitation2 = E(publicFacet).makeInvitation();
  const proposal2 = harden({
    give: {
      Money: pricePerNFT,
    },
    want: {
      NFTs: AmountMath.make(nftBrand, harden([2n])),
    },
  });

  const payments2 = harden({
    Money: moneyMint.mintPayment(pricePerNFT),
  });

  const seat2 = E(zoe).offer(invitation2, proposal2, payments2);

  const nftPayment2 = await E(seat2).getPayout('NFTs');
  const moneyPayment2 = await E(seat2).getPayout('Money');

  const moneyPayoutAmount2 = await E(moneyIssuer).getAmountOf(moneyPayment2);
  const nftPayoutAmount2 = await E(nftIssuer).getAmountOf(nftPayment2);

  t.true(
    AmountMath.isEqual(nftPayoutAmount2, AmountMath.make(nftBrand, harden([2n]))),
    `nftPayoutAmount value should be [2n] but was ${nftPayoutAmount2.value}`,
  );

  t.true(
    AmountMath.isEqual(moneyPayoutAmount2, AmountMath.make(moneyBrand, 0n)),
    `moneyPayoutAmount should be 0n, but was ${moneyPayoutAmount2}`,
  );
});
