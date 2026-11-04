export type OrderStatus = 'received' | 'accepted' | 'preparing' | 'ready' | 'served' | 'rejected';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  image?: string;
  specialNote?: string;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface CheckoutInput {
  customerName: string;
  whatsappNumber: string;
  tableNumber: string;
  specialInstructions?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof CheckoutInput, string>>;
}

/**
 * Calculates subtotal, 5% GST tax, and total.
 */
export function calculateOrderTotals(items: CartItem[], taxRate: number = 0.05): OrderTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  return {
    itemCount,
    subtotal,
    tax,
    total,
  };
}

/**
 * Validates checkout form fields.
 */
export function validateCheckoutForm(input: CheckoutInput): ValidationResult {
  const errors: Partial<Record<keyof CheckoutInput, string>> = {};

  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'Please enter a valid customer name (at least 2 characters).';
  }

  // Normalize phone number (strip whitespace, dashes, plus)
  const cleanPhone = (input.whatsappNumber || '').replace(/[\s\-\+\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
    errors.whatsappNumber = 'Please provide a valid 10-digit mobile number for WhatsApp updates.';
  }

  if (!input.tableNumber || input.tableNumber.trim().length === 0) {
    errors.tableNumber = 'Table number is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Defines next status progression in restaurant workflow.
 */
export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  switch (current) {
    case 'received':
      return 'accepted';
    case 'accepted':
      return 'preparing';
    case 'preparing':
      return 'ready';
    case 'ready':
      return 'served';
    case 'served':
    case 'rejected':
      return null;
  }
}

/**
 * Calculates average rating rounded to 1 decimal place.
 */
export function calculateAverageRating(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 4.9;
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / ratings.length).toFixed(1));
}

/**
 * Formats Indian Rupee currency.
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Extracts and formats table identifier from scanned QR code data or URL.
 * Supports:
 * - Full URLs: https://domain.com/menu/cozybite-cafe?table=05 -> "Table 05"
 * - Query strings: ?table=table-02 -> "Table 02"
 * - Slugs & bare text: "table-03" -> "Table 03", "Table 4" -> "Table 04", "06" -> "Table 06"
 */
export function parseTableFromQR(qrData: string): string | null {
  if (!qrData || typeof qrData !== 'string') return null;
  const trimmed = qrData.trim();

  try {
    // 1. Try URL parsing
    if (trimmed.includes('?') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://cozybite.cafe/${trimmed}`);
      const tableParam = urlObj.searchParams.get('table');
      if (tableParam) {
        return normalizeTableString(tableParam);
      }
    }
  } catch {
    // Fallback to regex
  }

  // 2. Try match for table patterns (e.g. table-04, Table 05, tbl-1, table03)
  const tableMatch = trimmed.match(/table[-_\s]*(\d+)/i) || trimmed.match(/tbl[-_\s]*(\d+)/i);
  if (tableMatch && tableMatch[1]) {
    const num = parseInt(tableMatch[1], 10);
    return `Table ${num.toString().padStart(2, '0')}`;
  }

  // 3. Just bare digits (e.g. "05" or "4")
  if (/^\d{1,3}$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    return `Table ${num.toString().padStart(2, '0')}`;
  }

  return null;
}

function normalizeTableString(val: string): string {
  const match = val.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `Table ${num.toString().padStart(2, '0')}`;
  }
  return val.charAt(0).toUpperCase() + val.slice(1);
}
