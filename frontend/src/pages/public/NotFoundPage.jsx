import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Sayfa Bulunamadı | İSÇEV</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container-iscev py-20 min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center font-gilroy">
        <p className="text-8xl font-bold" style={{ color: "#DDE9F8" }}>404</p>
        <h1 className="text-2xl font-bold" style={{ color: "#1B3F84" }}>
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="text-gray-500 max-w-md">
          Bu sayfa kaldırılmış, taşınmış ya da hiç var olmamış olabilir.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#1B3F84" }}
        >
          Anasayfaya Dön
        </Link>
      </div>
    </>
  );
}
