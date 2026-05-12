export default async function extension() {

  shopify.tools.register('search', async (input) => {
    const { query = '', first = 10, after } = input;

    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (first) params.set('first', String(first));
    if (after) params.set('after', after);

    const url = `/api/search${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    return response.json();
  });

  //@ts-ignore
  shopify.tools.register('get_product_metafields', async () => {
    try {
      const startTime = Date.now();
      const startTimeHR = performance.now();
      const res = await fetch('shopify:admin/api/2025-10/graphql.json', {
        method: 'POST',
        body: JSON.stringify({
          query: `
            query GetProductMetafield {
              productByIdentifier(identifier: { handle: "button-up-flounce-sleeve-shirt" }) {
                id
                title
                metafield(namespace: "sidekicking", key: "test_key") {
                  namespace
                  key
                  value
                }
              }
            }
          `,
        }),
      });
      const elapsedDate = Date.now() - startTime;
      const elapsedPerf = performance.now() - startTimeHR;
      console.log(`[get_product_metafields] fetch responded in ${elapsedDate}ms (Date) / ${elapsedPerf.toFixed(1)}ms (performance) (status: ${res.status})`);

      const { data } = await res.json();
      const product = data.productByIdentifier;

      return {
        product: product ? {
          id: product.id,
          title: product.title,
          metafield: product.metafield,
        } : null,
      };
    } catch (error) {
      return {
        error: `Failed to fetch product metafields: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });

  //@ts-ignore
  shopify.tools.register('get_shop_metafields', async () => {                                         
    try {                                                                                           
      const startTime = Date.now();                                                                 
      const startTimeHR = performance.now();                                                        
      const res = await fetch('shopify:admin/api/2025-10/graphql.json', {                         
        method: 'POST',                                                                             
        body: JSON.stringify({                                                                    
          query: `                                                                                
            query GetShopMetafield {
              shop {                                                                                
                metafield(namespace: "sidekicking", key: "test_key") {
                  namespace                                                                         
                  key                                                                             
                  value                                                                           
                }
              }
            }
          `,
        }),
      });
      const elapsedDate = Date.now() - startTime;
      const elapsedPerf = performance.now() - startTimeHR;                                          
      console.log(`[get_shop_metafields] fetch responded in ${elapsedDate}ms (Date) / 
${elapsedPerf.toFixed(1)}ms (performance) (status: ${res.status})`);                                
                                                                                                  
      const { data } = await res.json();                                                            
      const metafield = data.shop?.metafield;                                                     
                                                                                                  
      return { metafield: metafield ?? null };                                                      
    } catch (error) {
      return {                                                                                      
        error: `Failed to fetch shop metafields: ${error instanceof Error ? error.message :       
String(error)}`,                                                                                  
      };
    }
  });

  //@ts-ignore                                                                                        
  shopify.tools.register('get_product_metafields_by_id', async () => {
    try {                                                                                             
      const startTime = Date.now();                                                                 
      const startTimeHR = performance.now();                                                          
      const res = await fetch('shopify:admin/api/2025-10/graphql.json', {                           
        method: 'POST',                                                                               
        body: JSON.stringify({                                                                      
          query: `                                                                                    
            query GetProductMetafield {                                                             
              product(id: "gid://shopify/Product/7583524388966") {                                  
                id                                                                                  
                title
                metafield(namespace: "sidekicking", key: "test_key") {                                
                  namespace
                  key                                                                                 
                  value                                                                             
                }                                                                                   
              }                                                                                     
            }
          `,
        }),
      });
      const elapsedDate = Date.now() - startTime;
      const elapsedPerf = performance.now() - startTimeHR;                                            
      console.log(`[get_product_metafields] fetch responded in ${elapsedDate}ms (Date) / 
  ${elapsedPerf.toFixed(1)}ms (performance) (status: ${res.status})`);                                
                                                                                                    
      const { data } = await res.json();                                                              
      const product = data.product;                                                                 
                                                                                                    
      return {                                                                                      
        product: product ? {
          id: product.id,
          title: product.title,
          metafield: product.metafield,
        } : null,                                                                                     
      };
    } catch (error) {                                                                                 
      return {                                                                                      
        error: `Failed to fetch product metafields: ${error instanceof Error ? error.message :      
  String(error)}`,                                                                                  
      };
    }
  });

}

