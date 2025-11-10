export interface Order {
  order_id: string;  // BigInt 从后端转换为字符串
  user_id: number;
  total_amount: number;
  product_list: string;
  order_status: number;
  created_at: string;
  updated_at: string;
}

export interface OrderProduct {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export const ORDER_STATUS_MAP: Record<number, string> = {
  0: '待收货',
  1: '已完成',
  2: '已取消',
};