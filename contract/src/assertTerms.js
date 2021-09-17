import { isNat } from '@agoric/nat';
import { looksLikeBrand } from '@agoric/ertp';

const assertTerms = (terms) => {
  const {
    tokenName,
    pricePerNFT,
    brands: { Money: moneyBrand },
  } = terms;
  assert.typeof(
    tokenName,
    'string',
    assert.details`A name for the NFTs must be provided, not ${tokenName}`,
  );
  assert(
    typeof pricePerNFT === 'bigint' && isNat(pricePerNFT),
    assert.details`A bigint pricePerNFT must be provided, not ${pricePerNFT}`,
  );
  assert(
    looksLikeBrand(moneyBrand),
    assert.details`The brand for the price needs to be specified, not ${moneyBrand}`,
  );
};

export { assertTerms };
