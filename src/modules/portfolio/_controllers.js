const express = require("express");
const httpValidator = require("../../shared/http-validator");
const {
  addBannersSchema,
  patchBannersSchema,
  allBannersSchema,
} = require("./_schemas");
const addBannersService = require("./addBanners");
const editBannersService = require("./editBanners");
const showBannersService = require("./showBanners");
const removeBannersService = require("./removeBanners");
const allBannersService = require("./allBanners");
const { UnauthorizedError } = require("../../shared/errors");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const addBanners = async (req, res, next) => {
  try {
    console.log(req.file, "file");

    httpValidator({ body: req.body }, addBannersSchema);

    const result = await addBannersService(req);

    console.log(result, "result");

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    console.log(error);
    next(error);
  }
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

const patchBanners = async (req, res, next) => {
  try {
    httpValidator({ body: req.body }, patchBannersSchema);
    if (req?.file) {
      let SITE_URL = process.env.SITE_URL;
      let image = `${SITE_URL}/${req.file.filename}`;
      console.log(`${SITE_URL}/${req.file.filename}`);
      // Only pass the necessary data from req.body
      req.body.image = image;
    }
    const result = await editBannersService({
      id: req.params.id,
      changes: { ...req.body }, // Include image in the changes
    });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const showBanners = async (req, res, next) => {
  try {
    const result = await showBannersService({ id: req.params.id });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

const getBanners = async (req, res, next) => {
  try {
    httpValidator({ query: req.query }, allBannersSchema);

    const { query } = req;
    const offset =
      query && query.page && query.page.offset
        ? parseInt(query.page.offset)
        : undefined;
    const limit =
      query && query.page && query.page.limit
        ? parseInt(query.page.limit)
        : undefined;

    const result = await allBannersService({
      q: query.q,
      sort: query.sort,
      page: { limit, offset },
    });

    res.status(200).json({
      data: result.banners,
      pageInfo: {
        total: result.total,
        offset: result.offset,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const deleteBanners = async (req, res, next) => {
  try {
    const result = await removeBannersService({ id: req.params.id });

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBanners,
  patchBanners,
  showBanners,
  deleteBanners,
  getBanners,
};
