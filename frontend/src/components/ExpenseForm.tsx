/**
 * Form component for adding/editing expenses
 */

import React, { useEffect, useState } from "react";
import { Category, ExpenseFormData } from "../types";
import { TextField, SelectBox, Button, Modal } from "../vibes";
import { createCategory, fetchCategories } from "../services/api";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { formatDate } from "../utils/expenseUtils";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((error) => {
        console.error("Failed to load categories:", error);
      });
  }, []);

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) return;

    setIsCreatingCategory(true);

    try {
      const category = await createCategory(name);
      const updatedCategories = await fetchCategories();

      setCategories(updatedCategories);
      handleChange("category", category.name);
      handleCloseCategoryModal();
    } catch (error) {
      console.error("Failed to create category:", error);
      setCategoryError("Unable to add category. Please try again");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const categoryButtonStyle: React.CSSProperties = {
    marginTop: "0.5rem",
  };

  const categoryModalStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const categoryModalActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
  };

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    setCategoryError("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          error={errors.amount}
          fullWidth
          required
        />

        <TextField
          label="Description"
          type="text"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          error={errors.description}
          fullWidth
          required
        />

        <div>
          <SelectBox
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={errors.category}
            fullWidth
            required
          />

          <div style={categoryButtonStyle}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              Add Category
            </Button>
          </div>
        </div>

        <TextField
          label="Date"
          type="date"
          max={formatDate(new Date())}
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
          error={errors.date}
          fullWidth
          required
        />

        <div style={buttonGroupStyle}>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title="Add Category"
      >
        <div style={categoryModalStyle}>
          <TextField
            label="Category Name"
            type="text"
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            error={categoryError}
            fullWidth
            required
          />

          <div style={categoryModalActionsStyle}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCategoryModal}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
