import { CartItem } from "@/lib/cart";

const QR_GRID_SIZE = 21;
const FINDER_SIZE = 7;

export const QR_PAYMENT_INITIAL_SECONDS = 4 * 60 + 59;

export const QR_PAYMENT_COPY = {
  cancelLabel: "CANCEL AND RETURN TO CHECKOUT",
  emptyItemsLabel: "No items in this payment request yet.",
  emptyItemsText:
    "Return to checkout, review your bouquet selection and create a QR payment request again.",
  encryptedSession: "ENCRYPTED SESSION",
  expiryLabel: "TRANSACTION EXPIRY",
  expiryPrefix: "Valid for",
  headerSubtitle: "WAITING FOR SECURE TRANSACTION CONFIRMATION",
  headerTitle: "Complete Your Purchase",
  orderTotalLabel: "ORDER TOTAL",
};

export const QR_PAYMENT_STEPS = [
  {
    description: "Open your banking app and scan the QR frame.",
    step: "STEP 01",
    title: "Scan Code",
  },
  {
    description: "Confirm the amount and authorize the payment.",
    step: "STEP 02",
    title: "Authenticate",
  },
  {
    description: "Wait for the automatic confirmation screen.",
    step: "STEP 03",
    title: "Success",
  },
];

export function formatQrPaymentCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function formatQrPaymentTimer(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function getQrPaymentItemLabel(item: CartItem) {
  const quantity = item.quantity > 1 ? ` x${item.quantity}` : "";

  return `${item.productName.toUpperCase()}${quantity}`;
}

function isFinderZone(row: number, col: number, startRow: number, startCol: number) {
  return (
    row >= startRow &&
    row < startRow + FINDER_SIZE &&
    col >= startCol &&
    col < startCol + FINDER_SIZE
  );
}

function isFinderCell(row: number, col: number, startRow: number, startCol: number) {
  if (!isFinderZone(row, col, startRow, startCol)) {
    return false;
  }

  const relativeRow = row - startRow;
  const relativeCol = col - startCol;
  const edge =
    relativeRow === 0 ||
    relativeRow === FINDER_SIZE - 1 ||
    relativeCol === 0 ||
    relativeCol === FINDER_SIZE - 1;
  const center =
    relativeRow >= 2 &&
    relativeRow <= 4 &&
    relativeCol >= 2 &&
    relativeCol <= 4;

  return edge || center;
}

export function isQrPaymentCellFilled(row: number, col: number) {
  const bottomFinderStart = QR_GRID_SIZE - FINDER_SIZE;

  if (
    isFinderCell(row, col, 0, 0) ||
    isFinderCell(row, col, 0, bottomFinderStart) ||
    isFinderCell(row, col, bottomFinderStart, 0)
  ) {
    return true;
  }

  if (
    isFinderZone(row, col, 0, 0) ||
    isFinderZone(row, col, 0, bottomFinderStart) ||
    isFinderZone(row, col, bottomFinderStart, 0)
  ) {
    return false;
  }

  if (row === 6 || col === 6) {
    return (row + col) % 2 === 0;
  }

  const wave = (row * 7 + col * 11 + row * col * 3) % 9;
  const diagonal = (row + col) % 5;
  const block = (row % 4 === 0 && col % 3 !== 1) || (col % 5 === 0 && row % 2 === 0);

  return wave <= 2 || diagonal === 0 || block;
}
