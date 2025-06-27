// studio/components/StockStatusIndicator.tsx
import React from "react";
import { Stack, Card, Text, Badge } from "@sanity/ui";

interface StockVariant {
  size: string;
  stockQuantity: number;
}

interface StockStatusProps {
  stockQuantity?: number;
  variants?: StockVariant[];
  hasVariants?: boolean;
}

export function StockStatusIndicator({
  stockQuantity,
  variants,
  hasVariants,
}: StockStatusProps) {
  if (hasVariants && variants) {
    const totalStock = variants.reduce(
      (sum, variant) => sum + (variant.stockQuantity || 0),
      0,
    );
    const outOfStockSizes = variants.filter(
      (v) => (v.stockQuantity || 0) === 0,
    );
    const lowStockSizes = variants.filter(
      (v) => (v.stockQuantity || 0) > 0 && (v.stockQuantity || 0) <= 3,
    );

    return (
      <Card
        padding={3}
        tone={
          totalStock === 0
            ? "critical"
            : totalStock <= 5
              ? "caution"
              : "positive"
        }
      >
        <Stack space={3}>
          <Text weight="semibold">
            📦 Stock Overview: {totalStock} total across all sizes
          </Text>

          {outOfStockSizes.length > 0 && (
            <div>
              <Badge tone="critical">
                Out of Stock:{" "}
                {outOfStockSizes.map((v) => v.size.toUpperCase()).join(", ")}
              </Badge>
            </div>
          )}

          {lowStockSizes.length > 0 && (
            <div>
              <Badge tone="caution">
                Low Stock:{" "}
                {lowStockSizes
                  .map((v) => `${v.size.toUpperCase()} (${v.stockQuantity})`)
                  .join(", ")}
              </Badge>
            </div>
          )}

          {totalStock === 0 && (
            <Text size={1}>
              ⚠️ Product is completely out of stock
            </Text>
          )}
        </Stack>
      </Card>
    );
  }

  const stock = stockQuantity || 0;
  const tone = stock === 0 ? "critical" : stock <= 3 ? "caution" : "positive";
  const emoji = stock === 0 ? "❌" : stock <= 3 ? "⚠️" : "✅";

  return (
    <Card padding={3} tone={tone}>
      <Text weight="semibold">
        {emoji} Stock: {stock} {stock === 1 ? "item" : "items"} available
      </Text>
      {stock === 0 && (
        <Text size={1}>
          ⚠️ Product is out of stock
        </Text>
      )}
      {stock > 0 && stock <= 3 && (
        <Text size={1}>
          ⚠️ Running low - consider restocking soon
        </Text>
      )}
    </Card>
  );
}
