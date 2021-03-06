import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = this.ormRepository.create({ customer });
    const ordersProducts: OrdersProducts[] = [];

    products.forEach(product => {
      const op = new OrdersProducts();
      op.product_id = product.id;
      // op.order = order;
      op.price = product.price;
      op.quantity = product.quantity;
      ordersProducts.push(op);
    });

    order.order_products = ordersProducts;

    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(id, {
      relations: ['customer', 'order_products'],
    });

    return order;
  }
}

export default OrdersRepository;
