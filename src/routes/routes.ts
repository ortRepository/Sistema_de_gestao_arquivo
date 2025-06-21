import { FastifyInstance } from "fastify";

import type { FastifyTypedInstance } from "../types/fastify_types";

import { userRoutes } from "./UsersRoutes";
import { notificationsRoutes } from "./NotificationsRoutes";
import { productsRoutes } from "./productsRoutes";
import { documentsRoutes} from "./DocumentsRoutes";
import { employeesRoutes } from "./EmployeesRoutes";
import { orderNotificationsRoutes } from "./OrderNotificationsRoutes";
import { ordersRoutes } from "./OrdersRoutes";
import { registeredRoutes } from "./RegisteredRoutes";
import { reservationsRoutes } from "./ReservationsRoutes";
import { restaurantsRoutes } from "./RestaurantsRoutes";
import { selectedProductsRoutes } from "./SelectedProductsRoutes";
import { technicalSupportsRoutes } from "./TechnicalSupportsRoutes";
import { warningsRoutes } from "./WarningsRoutes";

export async function routes(app:FastifyTypedInstance) {
 userRoutes(app)
productsRoutes(app)
notificationsRoutes(app)
documentsRoutes(app)
employeesRoutes(app)
orderNotificationsRoutes(app)
ordersRoutes(app)
registeredRoutes(app)
reservationsRoutes(app)
restaurantsRoutes(app)
selectedProductsRoutes(app)
technicalSupportsRoutes(app)
warningsRoutes(app)
  


}