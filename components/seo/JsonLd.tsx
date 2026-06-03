import type { JsonLdGraph } from '@/lib/structured-data';

type JsonLdProps = {
  data: JsonLdGraph | JsonLdGraph[];
};

function serializeJsonLd(data: JsonLdGraph): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: JsonLdProps) {
  const graphs = Array.isArray(data) ? data : [data];

  return (
    <>
      {graphs.map((graph, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
          key={graph['@type'] != null ? String(graph['@type']) : index}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
