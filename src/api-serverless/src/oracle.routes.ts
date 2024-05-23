import { Request } from 'express';
import { returnJsonResult } from './api-helpers';
import { asyncRouter } from './async.router';
import * as db from '../../db-api';

const router = asyncRouter();

export default router;

router.get(
  '/tdh/total',
  async function (req: Request<{}, any, any, {}>, res: any) {
    const result = await db.fetchTotalTDH();
    return returnJsonResult(result, res);
  }
);

router.get(
  '/tdh/above/:value',
  async function (
    req: Request<
      {
        value: number;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const value = req.params.value;
    if (isNaN(value)) {
      return res.status(400).send({ error: 'Invalid value' });
    }
    const result = await db.fetchTDHAbove(Number(value));
    return returnJsonResult(result, res);
  }
);

router.get(
  '/tdh/percentile/:value',
  async function (
    req: Request<
      {
        value: number;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const percentile = req.params.value;
    if (
      !percentile ||
      isNaN(percentile) ||
      !Number.isInteger(Number(percentile)) ||
      percentile <= 0 ||
      percentile > 10000
    ) {
      return res
        .status(400)
        .send(
          'Invalid percentile value. Please provide an integer between 0 and 10000.'
        );
    }

    const resolvedPercentile = Number(percentile) / 100;
    const result = await db.fetchTDHPercentile(resolvedPercentile);
    return returnJsonResult(result, res);
  }
);

router.get(
  '/tdh/cutoff/:value',
  async function (
    req: Request<
      {
        value: number;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const cutoff = req.params.value;
    if (!Number.isInteger(Number(cutoff)) || cutoff < 1) {
      return res
        .status(400)
        .send('Invalid cutoff value. Please provide a non-negative integer.');
    }

    const result = await db.fetchTDHCutoff(Number(cutoff));
    return returnJsonResult(result, res);
  }
);

router.get(
  '/tdh/:address',
  async function (
    req: Request<
      {
        address: string;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const address = req.params.address;
    const result = await db.fetchSingleAddressTDH(address);
    return returnJsonResult(result, res);
  }
);

router.get(
  '/tdh/:address/breakdown',
  async function (
    req: Request<
      {
        address: string;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const address = req.params.address;
    const result = await db.fetchSingleAddressTDHBreakdown(address);
    return returnJsonResult(result, res);
  }
);

router.get(
  '/tdh/:address/memes_seasons',
  async function (
    req: Request<
      {
        address: string;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const address = req.params.address;
    const result = await db.fetchSingleAddressTDHMemesSeasons(address);
    return returnJsonResult(result, res);
  }
);

router.get(
  '/nfts/:contract?/:id?',
  async function (
    req: Request<
      {
        contract?: string;
        id?: string;
      },
      any,
      any,
      {}
    >,
    res: any
  ) {
    const contract = req.params.contract;
    const id = req.params.id;
    const result = await db.fetchNfts(contract, id);
    if (contract && id) {
      if (result.nfts.length === 0) {
        return res.status(404).send({ error: 'NFT not found' });
      } else {
        return returnJsonResult(
          {
            ...result.nfts[0],
            block: result.block
          },
          res
        );
      }
    }
    return returnJsonResult(result, res);
  }
);