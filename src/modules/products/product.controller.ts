import type {
  Request,
  Response,
} from "express";

import * as productService from "./product.service.js";
import type {
  CreateProductInput,
  ProductQuery,
  UpdateProductInput,
} from "./product.validation.js";

interface ProductIdParams {
  id: string;
}

/*
 * Handles public product listing.
 *
 * The service applies active-only filtering and returns pagination metadata.
 */
export const getProducts = async (
  req: Request,
  res: Response,
) => {
  const query =
    req.validated?.query as ProductQuery;

  const result =
    await productService.getProducts(
      query,
    );

  res.status(200).json({
    success: true,
    data: result,
  });
};

/*
 * Handles admin product listing.
 *
 * Admins can see drafts and out-of-stock products, so includeInactive=true.
 */
export const getAdminProducts =
  async (
    req: Request,
    res: Response,
  ) => {
    const query =
      req.validated
        ?.query as ProductQuery;

    const result =
      await productService.getProducts(
        query,
        true,
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  };

/*
 * Handles one public product lookup by id.
 *
 * The id comes from req.validated.params after Zod has checked it.
 */
export const getProductById = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as ProductIdParams;

  const product =
    await productService.getProductById(
      params.id,
    );

  res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
};

/*
 * Handles admin product creation.
 *
 * The controller only deals with HTTP; the service checks category existence
 * and writes to MongoDB.
 */
export const createProduct = async (
  req: Request,
  res: Response,
) => {
  const input =
    req.validated
      ?.body as CreateProductInput;

  const product =
    await productService.createProduct(
      input,
      req.user?.id,
    );

  res.status(201).json({
    success: true,
    message:
      "Product created successfully",
    data: {
      product,
    },
  });
};

/*
 * Handles admin product updates.
 *
 * Business rules like category validity and slug refresh live in the service.
 */
export const updateProduct = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as ProductIdParams;

  const input =
    req.validated
      ?.body as UpdateProductInput;

  const product =
    await productService.updateProduct(
      params.id,
      input,
    );

  res.status(200).json({
    success: true,
    message:
      "Product updated successfully",
    data: {
      product,
    },
  });
};

/*
 * Handles admin product deletion.
 *
 * The service throws a 404 if the product does not exist.
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as ProductIdParams;

  await productService.deleteProduct(
    params.id,
  );

  res.status(200).json({
    success: true,
    message:
      "Product deleted successfully",
  });
};
