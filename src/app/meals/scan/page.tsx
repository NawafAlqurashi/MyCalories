import BarcodeScanner from "@/components/BarcodeScanner";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ barcode?: string }>;
}) {
  const { barcode } = await searchParams;
  return <BarcodeScanner initialBarcode={barcode} />;
}
