import { Helmet } from "react-helmet-async";

const SITE_NAME = "İSÇEV Arıtma ve Çevre Teknolojileri";
const BASE_URL  = "https://www.iscev.com.tr";

export default function PageSEO({
  title,
  description,
  canonical,
  image = "/og-default.jpg",
  type  = "website",
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={`${BASE_URL}${image}`} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="tr_TR" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={`${BASE_URL}${image}`} />
    </Helmet>
  );
}
