/* Sayfa geçişlerinde gösterilecek yükleme göstergesi */
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-4 border-iscev-light border-t-iscev-navy animate-spin" />
    </div>
  );
}
