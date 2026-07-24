"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import type { Size } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { SIZES } from "@/lib/constants";

type VariantRow = { size: Size; stock: number };
type Category = { id: string; name: string };

export function ProductForm({
  categories,
  productId,
  initial,
}: {
  categories: Category[];
  productId?: string;
  initial?: {
    name: string;
    nameBn: string | null;
    description: string | null;
    descriptionBn: string | null;
    price: number;
    compareAtPrice: number | null;
    categoryId: string;
    images: string[];
    status: "DRAFT" | "PUBLISHED";
    featured: boolean;
    variants: VariantRow[];
  };
}) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!productId;

  const [name, setName] = React.useState(initial?.name ?? "");
  const [nameBn, setNameBn] = React.useState(initial?.nameBn ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [descriptionBn, setDescriptionBn] = React.useState(initial?.descriptionBn ?? "");
  const [price, setPrice] = React.useState(initial?.price?.toString() ?? "");
  const [compareAt, setCompareAt] = React.useState(
    initial?.compareAtPrice?.toString() ?? "",
  );
  const [categoryId, setCategoryId] = React.useState(initial?.categoryId ?? "");
  const [images, setImages] = React.useState<string[]>(initial?.images ?? []);
  const [status, setStatus] = React.useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );
  const [featured, setFeatured] = React.useState(initial?.featured ?? false);
  const [variants, setVariants] = React.useState<VariantRow[]>(
    initial?.variants ?? [{ size: "M", stock: 0 }],
  );
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const usedSizes = new Set(variants.map((v) => v.size));
  const availableSizes = SIZES.filter((s) => !usedSizes.has(s));

  const addVariant = () => {
    if (!availableSizes.length) return;
    setVariants((v) => [...v, { size: availableSizes[0], stock: 0 }]);
  };
  const setVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));

  async function save() {
    if (saving) return;
    const priceNum = Number(price);
    if (!name.trim()) return toast("Name is required", "error");
    if (!categoryId) return toast("Select a category", "error");
    if (Number.isNaN(priceNum) || priceNum < 0)
      return toast("Enter a valid price", "error");
    if (!variants.length) return toast("Add at least one size", "error");

    setSaving(true);
    const payload = {
      name: name.trim(),
      nameBn: nameBn.trim(),
      description: description.trim(),
      descriptionBn: descriptionBn.trim(),
      price: priceNum,
      compareAtPrice: compareAt ? Number(compareAt) : null,
      categoryId,
      images,
      status,
      featured,
      variants: variants.map((v) => ({ size: v.size, stock: Number(v.stock) || 0 })),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Save failed", "error");
        setSaving(false);
        return;
      }
      toast(isEdit ? "Product updated" : "Product created", "success");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast("Network error", "error");
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Delete failed", "error");
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }
      toast("Product deleted", "success");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast("Network error", "error");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product name (English)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Product name (বাংলা)"
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea
            label="Description (English)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Textarea
            label="Description (বাংলা)"
            value={descriptionBn}
            onChange={(e) => setDescriptionBn(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Category"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input
            label="Price (৳)"
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Compare-at (৳)"
            type="number"
            min={0}
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            helper="Original price for discount"
          />
        </div>
      </Card>

      <Card className="space-y-2">
        <p className="text-sm font-medium text-foreground">Images</p>
        <ImageUpload value={images} onChange={setImages} />
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Size variants</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addVariant}
            disabled={!availableSizes.length}
          >
            <Plus className="size-4" /> Add size
          </Button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="w-28">
                <Select
                  label={i === 0 ? "Size" : undefined}
                  value={v.size}
                  onChange={(e) => setVariant(i, { size: e.target.value as Size })}
                >
                  {[v.size, ...availableSizes].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Input
                  label={i === 0 ? "Stock" : undefined}
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => setVariant(i, { stock: Number(e.target.value) })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeVariant(i)}
                aria-label="Remove size"
                disabled={variants.length <= 1}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={status === "PUBLISHED"}
            onChange={(e) => setStatus(e.target.checked ? "PUBLISHED" : "DRAFT")}
            className="size-4 accent-primary"
          />
          <span className="text-sm font-medium text-foreground">Published</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm font-medium text-foreground">Featured</span>
        </label>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={save} loading={saving}>
            {isEdit ? "Save changes" : "Create product"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
        </div>
        {isEdit && (
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Delete product?"
        message="This cannot be undone. Products with existing orders will be hidden instead."
        confirmLabel="Delete"
        destructive
        loading={deleting}
      />
    </div>
  );
}
