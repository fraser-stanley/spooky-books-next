import styles from "./product-card-skeleton.module.css";

export function ProductCardSkeleton() {
  return (
    <div className="col-span-12 sm:col-span-4">
      <div className={styles.container}>
        {/* Image skeleton with pixelated pattern */}
        <div className={styles.imageSkeleton}>
          <div className={styles.pixelGrid}>
            {/* Generate a 4x4 grid of pixels for visual interest */}
            {Array.from({ length: 16 }).map((_, index) => (
              <div 
                key={index} 
                className={styles.pixel}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Text content skeleton */}
        <div className={styles.content}>
          <div className={styles.titleSkeleton} />
          <div className={styles.authorSkeleton} />
          <div className={styles.priceSkeleton} />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-2 mb-12 xl:mb-24">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}