import Link from "next/link";
import { defineQuery } from "next-sanity";

import { client } from "@/sanity/client";
import Image from "next/image";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";

const options = { next: { revalidate: 60 } };

const EVENTS_QUERY = defineQuery(`*[
  _type == "event"
  && defined(slug.current)
]{_id, name, slug, date}|order(date desc)`);

const ARTICLES_QUERY = defineQuery(`*[
  _type == "article"
  && defined(slug.current)
]{_id, title, slug, date, image}|order(date desc)`);

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default async function IndexPage() {
  const events = await client.fetch(EVENTS_QUERY, {}, options);
  const articles = await client.fetch(ARTICLES_QUERY, {}, options);

  return (
    <main className="flex bg-gray-100 min-h-screen flex-col p-24 gap-12">
      <h1 className="text-4xl font-bold tracking-tighter">Articles</h1>
      <ul className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {articles.map((article) => {
          const { title, image } = article;
          const eventImageUrl = image
            ? urlFor(image)?.width(550).height(310).url()
            : null;
          return (
            <li className="bg-white p-4 rounded-lg" key={article._id}>
              <Link
                className="hover:underline"
                href={`/articles/${article?.slug?.current}`}
              >
                {" "}
                <Image
                  src={eventImageUrl ?? "https://via.placeholder.com/550x310"}
                  alt={title ?? "Article Image"}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  height="60"
                  width="468"
                />
                <h2 className="text-xl font-semibold">{article?.title}</h2>
                {article?.date && (
                  <p className="text-gray-500">
                    {new Date(article.date).toLocaleDateString()}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <h1 className="text-4xl font-bold tracking-tighter">Events</h1>
      <ul className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {events.map((event) => (
          <li className="bg-white p-4 rounded-lg" key={event._id}>
            <Link
              className="hover:underline"
              href={`/events/${event?.slug?.current}`}
            >
              <h2 className="text-xl font-semibold">{event?.name}</h2>
              {event?.date && (
                <p className="text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
