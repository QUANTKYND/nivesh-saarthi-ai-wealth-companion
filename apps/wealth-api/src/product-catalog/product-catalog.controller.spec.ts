import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { ProductCatalogController } from './product-catalog.controller';
import { ProductCatalogService } from './product-catalog.service';

describe('ProductCatalogController', () => {
  let controller: ProductCatalogController;

  beforeEach(() => {
    controller = new ProductCatalogController(
      new ProductCatalogService(new InMemoryWealthRepository()),
    );
  });

  it('returns active product catalog items', () => {
    const products = controller.findAll();

    expect(products.length).toBeGreaterThanOrEqual(3);
    expect(products.every((product) => product.isActive)).toBe(true);
  });
});
