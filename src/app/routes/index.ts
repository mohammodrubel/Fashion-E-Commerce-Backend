import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/user/user.router';
import { SizeRoutes } from '../modules/size/size.routes';
import { ColorRoutes } from '../modules/color/color.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { AddressRoutes } from '../modules/address/address.routes';

const router = express.Router();

type Route = {
  path: string;
  route: express.Router;
};

const routes: Route[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: userRouter,
  },
  {
    path: '/size',
    route: SizeRoutes,
  },
  {
    path: '/color',
    route: ColorRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/product',
    route: ProductRoutes,
  },
  {
    path: '/address',
    route: AddressRoutes,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
