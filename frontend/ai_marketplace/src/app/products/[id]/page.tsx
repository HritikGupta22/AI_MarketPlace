import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Store } from "lucide-react";
import AddToCartButton from "@/components/products/AddToCartButton";
import ChatButton from "@/components/products/ChatButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, approved: true },
    include: {
      category: true,
      seller: { select: { id: true, name: true, image: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(1).map((img, i) => (
                <img key={i} src={img} alt="" className="size-16 rounded-lg object-cover border" />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
            <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
            {avgRating && (
              <p className="text-sm text-muted-foreground mt-1">⭐ {avgRating} ({product.reviews.length} reviews)</p>
            )}
          </div>

          <p className="text-3xl font-bold">₹{product.price.toLocaleString()}</p>

          <p className="text-sm text-muted-foreground">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{product.stock} in stock</span>
            ) : (
              <span className="text-destructive font-medium">Out of stock</span>
            )}
          </p>

          <p className="text-sm leading-relaxed">{product.description}</p>

          <AddToCartButton
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.images[0] ?? "",
              sellerId: product.sellerId,
              sellerName: product.seller.name ?? "",
              stock: product.stock,
            }}
          />

          <ChatButton
            productId={product.id}
            sellerId={product.sellerId}
            sellerName={product.seller.name ?? "Seller"}
            productTitle={product.title}
            productPrice={product.price}
            productDescription={product.description}
          />

          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted flex items-center justify-center">
                <Store className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sold by</p>
                <p className="text-sm font-medium">{product.seller.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-lg font-bold">Reviews ({product.reviews.length})</h2>
          <div className="space-y-3">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{review.user.name}</p>
                    <p className="text-sm">{"⭐".repeat(review.rating)}</p>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
