import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { dbService } from '../db/index.js';

export const lookupOrderTool = tool(
  async ({ orderId }) => {
    console.log(`[Tool] Looking up order: ${orderId}`);
    const orders = await dbService.getOrders(10);
    // In a real app with SQL, we'd do a WHERE clause. 
    // Here we filter the array for demonstration.
    const order = orders.find((o: any) => o.order_id === orderId.toUpperCase());
    
    if (!order) {
      return JSON.stringify({ error: "Order not found. Please verify the order ID." });
    }
    return JSON.stringify(order);
  },
  {
    name: "lookup_order",
    description: "Look up the shipping status and expected delivery of a specific order ID.",
    schema: z.object({
      orderId: z.string().describe("The order ID provided by the customer, e.g. ORD-123"),
    }),
  }
);
