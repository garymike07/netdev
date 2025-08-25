import { useEffect } from "react";

type MetaProps = {
  title?: string;
  description?: string;
  canonical?: string;
  social?: {
    image?: string;
    type?: string; // website, article
    twitterCard?: string; // summary, summary_large_image
  };
};

export default function Meta({ title, description, canonical, social }: MetaProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // Open Graph
    const setOg = (property: string, content?: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setOg("og:type", social?.type || "website");
    setOg("og:title", title);
    setOg("og:description", description);
    setOg("og:url", canonical);
    setOg("og:image", social?.image);

    // Twitter
    const setTwitter = (name: string, content?: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setTwitter("twitter:card", social?.twitterCard || "summary");
    setTwitter("twitter:title", title);
    setTwitter("twitter:description", description);
    setTwitter("twitter:image", social?.image);
  }, [title, description, canonical]);

  return null;
}

