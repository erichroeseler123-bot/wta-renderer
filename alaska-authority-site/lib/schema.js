export function articleSchema({ title, description, url }) {
  return `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": ${JSON.stringify(title)},
  "description": ${JSON.stringify(description)},
  "author": {
    "@type": "Organization",
    "name": "Alaska Cruise Port Authority"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Alaska Cruise Port Authority"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": ${JSON.stringify(url)}
  }
}
</script>`;
}

export function breadcrumbSchema(items) {
  return `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    ${items
      .map(
        (item, i) => `{
      "@type": "ListItem",
      "position": ${i + 1},
      "name": "${item.name}",
      "item": "${item.url}"
    }`,
      )
      .join(",")}
  ]
}
</script>`;
}
