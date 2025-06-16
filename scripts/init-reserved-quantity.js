// Initialize reservedQuantity fields for all products
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function initializeReservedQuantity() {
  console.log('Initializing reservedQuantity fields...');
  
  try {
    // Get all products
    const products = await client.fetch(`*[_type == "product"]`);
    console.log(`Found ${products.length} products`);
    
    const transaction = client.transaction();
    
    for (const product of products) {
      // Add reservedQuantity field to main product if missing
      if (!product.hasOwnProperty('reservedQuantity')) {
        transaction.patch(product._id, {
          set: { reservedQuantity: 0 }
        });
        console.log(`Set reservedQuantity=0 for product: ${product.title}`);
      }
      
      // Add reservedQuantity to variants if they exist
      if (product.variants && Array.isArray(product.variants)) {
        const updatedVariants = product.variants.map(variant => ({
          ...variant,
          reservedQuantity: variant.reservedQuantity || 0
        }));
        
        transaction.patch(product._id, {
          set: { variants: updatedVariants }
        });
        console.log(`Updated variants for product: ${product.title}`);
      }
    }
    
    const result = await transaction.commit();
    console.log('✅ Successfully initialized reservedQuantity fields');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Error initializing reservedQuantity fields:', error);
  }
}

initializeReservedQuantity();