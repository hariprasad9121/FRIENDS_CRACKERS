import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailLive } from "@/components/products/ProductDetailLive";
import { getProductBySlug } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name || "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Link href="/products" className="text-sm text-orange hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-navy/5">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          )}
        </div>
        <ProductDetailLive product={product} />
      </div>
    </div>
  );
}
