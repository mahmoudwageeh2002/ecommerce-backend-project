import type {
  Request,
  Response,
} from "express";

import * as categoryService from "./category.service.js";
import type {
  CategoryQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation.js";

interface CategoryIdParams {
  id: string;
}

/*
 * Handles public category listing.
 *
 * Public users only receive active categories.
 */
export const getCategories = async (
  req: Request,
  res: Response,
) => {
  const query =
    req.validated?.query as CategoryQuery;

  const result =
    await categoryService.getCategories(
      query,
    );

  res.status(200).json({
    success: true,
    data: result,
  });
};

/*
 * Handles admin category listing.
 *
 * Admins receive active and inactive categories so they can manage the catalog.
 */
export const getAdminCategories =
  async (
    req: Request,
    res: Response,
  ) => {
    const query =
      req.validated
        ?.query as CategoryQuery;

    const result =
      await categoryService.getCategories(
        query,
        true,
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  };

/*
 * Handles loading one public category by id.
 *
 * The service throws a 404 if the category does not exist or is inactive.
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as CategoryIdParams;

  const category =
    await categoryService.getCategoryById(
      params.id,
    );

  res.status(200).json({
    success: true,
    data: {
      category,
    },
  });
};

/*
 * Handles category creation.
 *
 * Only admin routes call this controller.
 */
export const createCategory = async (
  req: Request,
  res: Response,
) => {
  const input =
    req.validated
      ?.body as CreateCategoryInput;

  const category =
    await categoryService.createCategory(
      input,
    );

  res.status(201).json({
    success: true,
    message:
      "Category created successfully",
    data: {
      category,
    },
  });
};

/*
 * Handles category updates.
 *
 * The controller stays HTTP-focused; the service owns database details.
 */
export const updateCategory = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as CategoryIdParams;

  const input =
    req.validated
      ?.body as UpdateCategoryInput;

  const category =
    await categoryService.updateCategory(
      params.id,
      input,
    );

  res.status(200).json({
    success: true,
    message:
      "Category updated successfully",
    data: {
      category,
    },
  });
};

/*
 * Handles category deletion.
 *
 * The service prevents deleting categories that still have products.
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as CategoryIdParams;

  await categoryService.deleteCategory(
    params.id,
  );

  res.status(200).json({
    success: true,
    message:
      "Category deleted successfully",
  });
};
