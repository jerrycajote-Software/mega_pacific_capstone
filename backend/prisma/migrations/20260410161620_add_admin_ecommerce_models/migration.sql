

ALTER TABLE "Order" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN     "shippingAddress" TEXT;


ALTER TABLE "Product" ADD COLUMN     "description" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'per meter',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;


CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
