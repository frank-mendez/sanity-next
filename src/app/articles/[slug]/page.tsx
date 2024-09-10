import { defineQuery, PortableText } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

const options = { next: { revalidate: 60 } };

const ARTICLE_QUERY = defineQuery(`*[
    _type == "article" &&
    slug.current == $slug
  ][0]{
  ...,
  "date": coalesce(date, now()),
  "doorsOpen": coalesce(doorsOpen, 0),
  author->,
  date->
}`);

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await client.fetch(ARTICLE_QUERY, params, options);
  if (!article) {
    notFound();
  }

  const { title, author, image, details, _createdAt, tags } = article;
  const eventImageUrl = image
    ? urlFor(image)?.width(550).height(310).url()
    : null;
  const eventDate = _createdAt
    ? new Date(_createdAt).toDateString() +
      " " +
      new Date(_createdAt).toLocaleTimeString()
    : Date.now();

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <div className="mb-4">
        <Link href="/">← Back to main</Link>
      </div>
      <div className="flex flex-col gap-4">
        <Image
          src={eventImageUrl ?? "https://via.placeholder.com/550x310"}
          alt={title ?? "Article Image"}
          className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
          height="60"
          width="468"
        />
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-4">
            {title ? (
              <h1 className="text-4xl font-bold tracking-tighter mb-8">
                {title}
              </h1>
            ) : null}
            {author?.name ? (
              <dl className="flex flex-row gap-2">
                <dd className="font-semibold">Author</dd>
                <dt>{author?.name}</dt>
              </dl>
            ) : null}
            <dl className="flex flex-row gap-2">
              <dd className="font-semibold">Date created</dd>
              <div>{eventDate && <dt>{eventDate}</dt>}</div>
            </dl>
          </div>
          <div className="flex flex-row gap-2">
            {tags &&
              tags?.length > 0 &&
              tags.map((tag) => (
                <div
                  key={tag.value}
                  className="text-white rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800 capitalize cursor-pointer"
                >
                  {tag.label}
                </div>
              ))}
          </div>
          {details && details.length > 0 && (
            <div className="prose max-w-none">
              <PortableText value={details} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
