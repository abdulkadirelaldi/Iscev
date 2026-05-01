import PageSEO from "../../components/common/PageSEO";

export default function MapPage() {
  return (
    <>
      <PageSEO
        title="Proje Haritası"
        description="İSÇEV'in Türkiye ve dünya genelinde gerçekleştirdiği su arıtma projelerini interaktif harita üzerinde keşfedin."
        canonical="/harita"
      />
      <div className="container-iscev py-20 min-h-[60vh] flex items-center justify-center">
        <h1 className="section-title">Proje Haritası</h1>
      </div>
    </>
  );
}
