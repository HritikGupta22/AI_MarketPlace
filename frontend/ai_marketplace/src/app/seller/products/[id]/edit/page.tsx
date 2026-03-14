import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <ProductForm
      initialData={{
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        images: product.images,
      }}
    />
  );
}
