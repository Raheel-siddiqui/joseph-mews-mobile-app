import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRoute } from "wouter";
import { Image as ImageIcon, Play, Volume2, VolumeX, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getProperty } from "@/lib/data";
import { getOpportunity } from "@/lib/explore";
import { ownsProperty } from "@/lib/holdings";
import { opportunityGallery, propertyGallery } from "@/lib/propertyImage";
import NotFound from "./NotFound";

type MediaFilter = "all" | "images" | "videos";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: { Player: new (id: string, options: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PENNY_COPY =
  "Penny Place sits at the centre of a city in the middle of a rapidly growing transformation. Wolverhampton is no longer an overlooked alternative, it’s an emerging growth market with real investment committed, planning approved, and demand building fast.";

const PENNY_VIDEO = {
  id: "csYlq5YLsVI",
  poster: "/properties/penny-video-thumb.jpg",
  title: "Most investors think UK prope...",
  playerTitle:
    "Most investors think UK property requires a huge upfront commitment. Penny Place...",
  meta: "VIDEO · 5627199",
  playerMeta: "Video - 5627199",
};

const PENNY_IMAGES = [
  {
    src: "/properties/penny-aerial.jpg",
    name: "MS-Aerial-View_NEW-2048x1365.jpg.webp",
    wide: true,
  },
  {
    src: "/properties/penny-rear.jpg",
    name: "MS-Rear-View-1920x720.jpg.webp",
    wide: false,
  },
  {
    src: "/properties/penny-front.jpg",
    name: "MS-Front-View-1920x720.jpg.webp",
    wide: false,
  },
];

export default function ContentDetail() {
  const [, propertyParams] = useRoute<{ id: string }>("/property/:id/content");
  const [, exploreParams] = useRoute<{ id: string }>("/explore/:id/content");
  const property =
    propertyParams?.id && ownsProperty(propertyParams.id)
      ? getProperty(propertyParams.id)
      : null;
  const opportunity = exploreParams?.id
    ? getOpportunity(exploreParams.id)
    : null;
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [imageIndex, setImageIndex] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  if (!property && !opportunity) return <NotFound />;

  const title = property?.name ?? opportunity!.name;
  const backTo = property
    ? `/property/${property.id}`
    : `/explore/${opportunity!.id}`;
  const images = property
    ? property.id === "JM-PENNY"
      ? PENNY_IMAGES
      : propertyGallery(property).map((src, index) => ({
          src,
          name: src.split("/").pop() ?? "image",
          wide: index === 0,
        }))
    : opportunityGallery(opportunity!).map((src, index) => ({
        src,
        name: src.split("/").pop() ?? "image",
        wide: index === 0,
      }));
  const video = PENNY_VIDEO;
  const fileCount = images.length + (video ? 1 : 0);
  const showVideo = Boolean(video) && filter !== "images";
  const showImages = images.length > 0 && filter !== "videos";
  const activeImage = imageIndex === null ? null : images[imageIndex];

  return (
    <AppShell backTo={backTo} showNav={false}>
      <div className="page-px pt-4 pb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="label-eyebrow">General</p>
          <span className="chip chip--gold">Published</span>
        </div>
        <h1 className="page-intro__title">{title}</h1>
        <>
            <p className="mb-4 mt-1 text-[12px] text-muted-foreground">
              {property?.id === "JM-PENNY" ? "15 Sep 2026 · " : ""}
              {fileCount} {fileCount === 1 ? "file" : "files"}
            </p>
            {property?.id === "JM-PENNY" && (
              <p className="mb-5 text-sm leading-relaxed text-foreground/85">
                {PENNY_COPY}
              </p>
            )}
            <div className="mb-6 flex flex-wrap gap-2">
              {images.length > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px]"
                  onClick={() => setFilter("images")}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  {images.length} {images.length === 1 ? "image" : "images"}
                </button>
              )}
              {video && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px]"
                  onClick={() => setFilter("videos")}
                >
                  <Play className="h-3.5 w-3.5" />
                  1 video
                </button>
              )}
            </div>
            <div className="mb-6 flex gap-5 border-b border-border">
              {(
                [
                  ["all", "All"],
                  ["images", "Images"],
                  ...(video ? [["videos", "Videos"] as const] : []),
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`tap pb-2 text-sm ${
                    filter === id
                      ? "-mb-px border-b border-primary text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {showVideo && (
              <section id="content-videos" className="mb-8">
                <h2 className="mb-3 font-serif text-2xl">Videos</h2>
                <button
                  type="button"
                  className="tap block w-[10.5rem] overflow-hidden rounded-lg text-left"
                  onClick={() => setVideoOpen(true)}
                >
                  <img
                    src={video.poster}
                    alt={video.title}
                    className="block w-full"
                  />
                </button>
              </section>
            )}
            {showImages && (
              <section id="content-images">
                <h2 className="mb-3 font-serif text-2xl">Images</h2>
                <div className="grid grid-cols-2 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={image.name}
                      type="button"
                      className={`tap text-left ${image.wide ? "col-span-2" : ""}`}
                      onClick={() => setImageIndex(index)}
                    >
                      <img
                        src={image.src}
                        alt=""
                        className="w-full rounded-lg object-cover"
                      />
                      <span className="mt-1.5 block break-all text-[11px] text-muted-foreground">
                        {image.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
        </>
      </div>

      {activeImage &&
        createPortal(
        <div
          className="fixed inset-0 z-[80] bg-black/80"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="tap absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/80"
            aria-label="Close image"
            onClick={() => setImageIndex(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-full items-center px-4">
            <figure className="w-full">
              <img src={activeImage.src} alt="" className="w-full object-contain" />
              <figcaption className="mt-4 text-center text-sm text-white">
                {activeImage.name}
              </figcaption>
            </figure>
          </div>
        </div>,
          document.body
        )}

      {videoOpen &&
        createPortal(
          <VideoPlayer onClose={() => setVideoOpen(false)} />,
          document.body
        )}
    </AppShell>
  );
}

function VideoPlayer({ onClose }: { onClose: () => void }) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer = 0;
    let cancelled = false;

    const mount = () => {
      if (cancelled || !window.YT?.Player || playerRef.current) return;
      playerRef.current = new window.YT.Player("penny-yt", {
        width: "100%",
        height: "100%",
        videoId: PENNY_VIDEO.id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          fs: 0,
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            event.target.mute();
            event.target.playVideo();
          },
        },
      });
      timer = window.setInterval(() => {
        const player = playerRef.current;
        if (!player?.getDuration) return;
        const total = player.getDuration() || 1;
        setProgress(Math.min(1, player.getCurrentTime() / total));
        setMuted(player.isMuted());
      }, 250);
    };

    if (window.YT?.Player) mount();
    else {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        mount();
      };
      if (!document.getElementById("yt-iframe-api")) {
        const script = document.createElement("script");
        script.id = "yt-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) player.unMute();
    else player.mute();
    setMuted(player.isMuted());
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute -inset-y-[12%] inset-x-0 [&_iframe]:pointer-events-none [&_iframe]:h-full [&_iframe]:w-full">
          <div id="penny-yt" className="h-full w-full" />
        </div>
      </div>
      <button
        type="button"
        className="tap absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white"
        aria-label="Close video"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        className="tap absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={toggleMute}
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 pt-16 text-white">
        <p className="text-[12px] text-white/80">1 / 1</p>
        <p className="mt-1 text-[15px] leading-snug">{PENNY_VIDEO.playerTitle}</p>
        <p className="mt-1 text-[13px] text-white/80">{PENNY_VIDEO.playerMeta}</p>
        <div className="mt-3 h-[3px] bg-white/30">
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.max(progress * 100, 8)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
