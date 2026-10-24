
import { NextRequest, NextResponse } from "next/server";

type ProductImage = {
  url: string;
  title: string;
  source: string;
  attributionUrl: string;
  license: string;
};

export async function GET(request: NextRequest) {
  const query =
    request.nextUrl.searchParams.get("q")?.trim() || "";

  const isbn =
    request.nextUrl.searchParams.get("isbn")?.trim() || "";

  const category =
    request.nextUrl.searchParams.get("category") || "";

  if (!query && !isbn) {
    return NextResponse.json({ images: [] });
  }

  const images: ProductImage[] = [];

  try {
    // Search Open Library for textbook covers
    if (category === "Textbook") {
      const params = new URLSearchParams({
        limit: "6",
        fields: "title,cover_i,key",
      });

      if (isbn) {
        params.set("isbn", isbn);
      } else {
        params.set("q", query);
      }

      const response = await fetch(
        `https://openlibrary.org/search.json?${params}`,
        {
          signal: AbortSignal.timeout(8000),
        }
      );

      if (response.ok) {
        const data = await response.json();

        for (const book of data.docs || []) {
          if (!book.cover_i) continue;

          images.push({
            url:
              `https://covers.openlibrary.org/b/id/` +
              `${book.cover_i}-L.jpg`,
            title: book.title,
            source: "Open Library",
            attributionUrl:
              `https://openlibrary.org${book.key}`,
            license: "Check source usage terms",
          });
        }
      }
    } else {
      // Search Wikimedia Commons for equipment
      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: `filetype:bitmap ${query}`,
        gsrnamespace: "6",
        gsrlimit: "12",
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "800",
        format: "json",
        formatversion: "2",
      });

      const response = await fetch(
        `https://commons.wikimedia.org/w/api.php?${params}`,
        {
          signal: AbortSignal.timeout(8000),
          headers: {
            "User-Agent":
              "CampusRentalHub/1.0 (student project)",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        for (const page of data.query?.pages || []) {
          const info = page.imageinfo?.[0];
          if (!info?.thumburl) continue;

          const metadata = info.extmetadata || {};

          images.push({
            url: info.thumburl,
            title: page.title.replace(/^File:/, ""),
            source: "Wikimedia Commons",
            attributionUrl:
              info.descriptionurl ||
              `https://commons.wikimedia.org/`,
            license:
              metadata.LicenseShortName?.value ||
              "Check source license",
          });
        }
      }
    }

    return NextResponse.json({
      images: images.slice(0, 8),
    });
  } catch {
    return NextResponse.json(
      {
        images: [],
        error: "Image search is temporarily unavailable.",
      },
      { status: 502 }
    );
  }
}
