"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    sellerId: string;
    sellerName: string;
    stock: number;
  };
};

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.id === product.id);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (product.stock === 0) {
    return <Button className="w-full" disabled>Out of Stock</Button>;
  }

  return (
    <Button className="w-full" onClick={handleAdd}>
      {added ? (
        <><Check className="size-4 mr-1" /> Added! {inCart ? `(${inCart.quantity + 1})` : ""}</>
      ) : (
        <><ShoppingCart className="size-4 mr-1" /> Add to Cart</>
      )}
    </Button>
  );
}
