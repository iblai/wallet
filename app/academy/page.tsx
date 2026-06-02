"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  DiscoverFilterDrawer,
  FacetFilterContext,
  useDiscover,
} from "@iblai/iblai-js/web-containers";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import config from "@/lib/iblai/config";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;
const GRADIENT = "linear-gradient(135deg, #00A3EC 0%, #6988FF 100%)";
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function CatalogImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="flex h-[160px] w-full items-center justify-center border bg-gradient-to-br from-[#e0f2ff] to-[#dbeafe] sm:h-[150px]">
        <GraduationCap className="h-12 w-12 text-[#6988FF]" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={400}
      height={200}
      onError={() => setErrored(true)}
      className="h-[160px] w-full border object-cover sm:h-[150px]"
    />
  );
}

function AcademyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Cross-tenant marketplace scope. `lmsBrowserUrl` is the IMAGE host —
  // edX serves `/asset-v1:...` only from `learn.<domain>`, not the
  // API gateway. Without this the catalog images would 500.
  const lmsImageHost = config.lmsBrowserUrl();
  const discover = useDiscover({
    limit: PAGE_SIZE,
    lmsUrl: lmsImageHost,
    tenantOverride: "main",
  }) as any;
  const baseLmsUrl = lmsImageHost.replace(/\/+$/, "");
  const contentsLoading: boolean = !!discover?.contentsLoading;
  const rawContents: any[] = discover?.contents ?? [];

  // URL <-> state sync (?q, ?page) — hydrate once on mount, and seed the
  // `content` facet to "courses" so the discover endpoint scopes results to
  // courses only (the API does not default to courses when no content
  // filter is sent).
  const initialQ = searchParams.get("q") ?? "";
  const initialPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [searchValue, setSearchValue] = useState(initialQ);
  const didSyncFromUrl = useRef(false);
  useEffect(() => {
    if (didSyncFromUrl.current) return;
    didSyncFromUrl.current = true;
    discover.setSelectedFacets((prev: any) => {
      const next = { ...(prev || {}), content: ["courses"] };
      if (initialQ) next.q = [initialQ];
      return next;
    });
    if (initialPage > 1) discover.setPage(initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeUrl = useCallback(
    (q: string, page: number) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (page > 1) params.set("page", String(page));
      const qs = params.toString();
      router.replace(qs ? `/academy?${qs}` : "/academy", { scroll: false });
    },
    [router],
  );

  const onSearchChange = (v: string) => {
    setSearchValue(v);
    discover.setSelectedFacets((prev: any) => {
      const next = { ...(prev || {}) };
      if (v) next.q = [v];
      else delete next.q;
      return next;
    });
    discover.setPage(1);
    writeUrl(v, 1);
  };

  const totalPages: number = discover?.pagination?.total_pages ?? 0;
  const page: number = discover?.page ?? 1;
  const goToPage = (next: number) => {
    if (next < 1 || (totalPages > 0 && next > totalPages) || next === page) return;
    discover.setPage(next);
    writeUrl(searchValue, next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeChips: { slug: string; term: string }[] = useMemo(() => {
    const sel = discover?.selectedFacets ?? {};
    const out: { slug: string; term: string }[] = [];
    for (const slug of Object.keys(sel)) {
      if (slug === "q" || slug === "content") continue;
      for (const t of sel[slug] || []) out.push({ slug, term: String(t) });
    }
    return out;
  }, [discover?.selectedFacets]);

  const removeChip = (slug: string, term: string) => {
    discover.handleSelectFacets(slug, term);
  };

  const clearAllFilters = () => {
    discover.setSelectedFacets({ content: ["courses"] });
    discover.setPage(1);
    writeUrl(searchValue, 1);
  };

  // Loader settles on (a) true->false transition, (b) pagination present,
  // or (c) 8s timeout so the page never gets stuck.
  const [hasSettled, setHasSettled] = useState(false);
  const prevLoadingRef = useRef(false);
  useEffect(() => {
    if (prevLoadingRef.current && !contentsLoading) setHasSettled(true);
    prevLoadingRef.current = contentsLoading;
  }, [contentsLoading]);
  useEffect(() => {
    if (discover?.pagination) setHasSettled(true);
  }, [discover?.pagination]);
  useEffect(() => {
    const t = setTimeout(() => setHasSettled(true), 8000);
    return () => clearTimeout(t);
  }, []);
  const isLoading = !hasSettled || contentsLoading;

  const formatContent: (row: any) => any =
    discover?.handleFormatContents ?? ((row: any) => row);

  const courses = rawContents.map((row, i) => {
    const f = formatContent(row);
    // SDK builds `${lmsUrl}${edx_data.course_image_asset_path||""}`. With
    // no asset path that string is just `lmsUrl` (not an image) so the
    // browser hangs loading it. Detect + drop to the icon fallback.
    const img: string = f?.image ?? "";
    const trimmed = img.replace(/\/+$/, "");
    const image = !trimmed || trimmed === baseLmsUrl ? "" : f.image;
    const rawLevel = f?.level;
    const apiLevel = Array.isArray(rawLevel)
      ? rawLevel[0]
      : typeof rawLevel === "string"
        ? rawLevel
        : "";
    const level = apiLevel
      ? String(apiLevel).charAt(0).toUpperCase() + String(apiLevel).slice(1)
      : LEVELS[i % LEVELS.length];
    return {
      id: String(f?.course_id ?? f?.id ?? i),
      title: f?.title ?? f?.name ?? "Untitled course",
      image,
      level,
    };
  });

  const facetCtx = useMemo(
    () => ({
      facetsLoading: !!discover?.facetsLoading,
      isError: !!discover?.isError,
      filteredFacets: discover?.filteredFacets ?? [],
      facets: discover?.facets ?? [],
      handleToggleFacet: discover?.handleToggleFacet ?? (() => {}),
      handleFilterFacets: discover?.handleFilterFacets ?? (() => {}),
      isFacetTermSelected: discover?.isFacetTermSelected ?? (() => false),
      handleSelectFacets: discover?.handleSelectFacets ?? (() => {}),
      filterDrawerOpen,
      setFilterDrawerOpen,
    }),
    [discover, filterDrawerOpen],
  );

  const handleCourseClick = (courseId: string) => {
    // Open the LMS course "about" page (course description + enrollment)
    // on the direct LMS host. Browser carries SSO cookies for *.iblai.app.
    const url = `${config.lmsBrowserUrl()}/courses/${encodeURIComponent(courseId)}/about`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <FacetFilterContext.Provider value={facetCtx as any}>
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Academy</h1>

        {/* Search + Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative w-full min-w-0 sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses…"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2 pl-10 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchValue && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterDrawerOpen(true)}
            className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 sm:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeChips.length > 0 && (
              <span
                className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                style={{ background: GRADIENT }}
              >
                {activeChips.length}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((c) => (
              <button
                key={`${c.slug}-${c.term}`}
                type="button"
                onClick={() => removeChip(c.slug, c.term)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span className="capitalize text-gray-500">{c.slug}:</span>
                <span className="capitalize">{c.term}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-[#2563EB] hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading courses…
          </div>
        )}

        <div
          className={cn(
            "grid grid-cols-1 gap-3 pb-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4",
            isLoading && "hidden",
          )}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              data-testid="course-card"
              className="cursor-pointer overflow-hidden rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="relative overflow-hidden rounded-lg">
                <div
                  className="absolute bottom-2 left-2 z-10 rounded px-2 py-1 text-xs text-white"
                  style={{ background: GRADIENT }}
                >
                  {course.level}
                </div>
                <CatalogImage src={course.image} alt={course.title} />
              </div>
              <div className="pt-3">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-700 sm:text-base">
                  {course.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && courses.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">
              {searchValue || activeChips.length > 0
                ? "No courses match your search or filters."
                : "No courses are available in the catalog yet."}
            </p>
            {(searchValue || activeChips.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  clearAllFilters();
                }}
                className="mt-3 text-sm font-medium text-[#2563EB] hover:underline"
              >
                Reset search and filters
              </button>
            )}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <nav
            aria-label="Catalog pagination"
            className="mt-2 flex items-center justify-center gap-2 pb-10"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="px-2 text-sm text-gray-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>

      <DiscoverFilterDrawer />
    </FacetFilterContext.Provider>
  );
}

export default function AcademyPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center py-20">
            <p className="text-sm text-gray-400">Loading academy...</p>
          </div>
        }
      >
        <AcademyContent />
      </Suspense>
    </MainLayout>
  );
}
