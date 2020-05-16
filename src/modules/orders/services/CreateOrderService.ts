import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}
interface IProduct2 {
  id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError("You can't choose a non-existent client!");
    }

    let findProducts: Product[] = [];
    try {
      findProducts = await this.productsRepository.updateQuantity(products);
      if (!findProducts || findProducts.length !== products.length) {
        throw new AppError("You can't choose a non-existent product");
      }
    } catch {
      throw new AppError(
        'Not has quanity sufficient to create this order',
        400,
      );
    }

    const newOrderProducts: IProduct2[] = [];

    products.forEach(product => {
      const price = findProducts.find(fp => fp.id === product.id)?.price;
      if (price) {
        newOrderProducts.push({
          id: product.id,
          quantity: product.quantity,
          price,
        });
      }
    });

    const order = await this.ordersRepository.create({
      customer,
      products: newOrderProducts,
    });

    return order;
  }
}

export default CreateProductService;
