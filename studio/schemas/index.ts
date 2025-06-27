import { category } from "./category";
import { product } from "./product";
import homepage from "./homepage";
import { stockReservation } from "./stock-reservation";
import { idempotencyRecord } from "./idempotency-record";
import { errorLog } from "./error-log";

export const schemaTypes = [
  category,
  product,
  homepage,
  stockReservation,
  idempotencyRecord,
  errorLog,
];
