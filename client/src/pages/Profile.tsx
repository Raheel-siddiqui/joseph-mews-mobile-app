import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { Camera, ChevronRight, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ContactAdvisorSheet } from "@/components/ContactAdvisorSheet";
import { ModalShell } from "@/components/ModalShell";
import {
  clearSession,
  getActiveUser,
  homePathForPersona,
  saveProfilePhoto,
  userInitials,
} from "@/lib/session";

const LINKS = ["Terms & Conditions", "Privacy Policy", "Contact us"] as const;
const GRADIENT_KEY = "jm_screen_gradient";

function readScreenGradient(): boolean {
  try {
    return localStorage.getItem(GRADIENT_KEY) === "on";
  } catch {
    return false;
  }
}

function setScreenGradient(on: boolean) {
  localStorage.setItem(GRADIENT_KEY, on ? "on" : "off");
  window.dispatchEvent(new Event("jm-screen-gradient"));
}

function fileToPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not-image"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}

export default function Profile() {
  const user = getActiveUser();
  const [, setLocation] = useLocation();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photo, setPhoto] = useState(user.photo);
  const [gradientOn, setGradientOn] = useState(readScreenGradient);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const soon = () => {
    window.dispatchEvent(new Event("toast-coming-soon"));
  };

  const logout = () => {
    clearSession();
    setLocation("/");
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToPhoto(file);
      saveProfilePhoto(user.email, dataUrl);
      setPhoto(dataUrl);
      setPhotoOpen(false);
    } catch {
      toast("Couldn't use that photo", {
        description: "Choose an image from your gallery or take a new one.",
      });
    }
  };

  return (
    <AppShell showNav={false} backTo={homePathForPersona()} title="Profile">
      <div className="page-px pt-5 pb-10">
        <button
          type="button"
          onClick={() => setPhotoOpen(true)}
          className="tap relative mb-5 block h-20 w-20"
          aria-label="Change profile photo"
        >
          <span className="block h-full w-full overflow-hidden rounded-full">
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-primary/10 font-serif text-xl text-primary">
                {userInitials(user)}
              </span>
            )}
          </span>
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
            <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
        </button>
        <p className="label-eyebrow">Account</p>
        <h1 className="page-intro__title">{user.name}</h1>
        <p className="mt-2 text-sm text-foreground/85">{user.email}</p>
        <p className="label-eyebrow mt-3">Member since {user.memberSince}</p>

        <div className="mt-6 rounded-lg border border-border px-4 py-4">
          <p className="label-eyebrow mb-3">Your advisor</p>
          <p className="font-serif text-lg leading-tight">{user.advisor}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {user.advisorTitle}
          </p>
          <button
            type="button"
            onClick={() => setAdvisorOpen(true)}
            className="tap mt-4 inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.12em] text-primary"
          >
            Contact advisor
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="glass glass--pad mt-6">
          <button
            type="button"
            role="switch"
            aria-checked={gradientOn}
            onClick={() => {
              const next = !gradientOn;
              setGradientOn(next);
              setScreenGradient(next);
            }}
            className="tap flex min-h-11 w-full items-center gap-3 text-left"
          >
            <span
              className={`pref-radio${gradientOn ? " pref-radio--on" : ""}`}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block text-sm">Screen gradient</span>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">
                {gradientOn ? "On" : "Off"}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-8">
          {LINKS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={soon}
              className="tap flex w-full items-center justify-between border-b border-border py-4 text-left text-[15px]"
            >
              {label}
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.5}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={soon}
            className="tap flex w-full items-center justify-between border-b border-border py-4 text-left text-[15px] text-destructive"
          >
            Request account deletion
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={logout}
          className="tap mt-10 w-full text-center text-[12px] font-medium uppercase tracking-[0.16em] text-destructive"
        >
          Logout
        </button>
      </div>

      {advisorOpen && (
        <ContactAdvisorSheet onClose={() => setAdvisorOpen(false)} />
      )}
      {photoOpen && (
        <ModalShell onClose={() => setPhotoOpen(false)} title="Profile photo">
          <p className="mb-5 text-[12.5px] leading-relaxed text-muted-foreground">
            Use a photo from your gallery, or take a new one.
          </p>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="tap press glass glass--pad flex w-full items-center gap-3.5 text-left"
            >
              <span className="icon-well h-9 w-9">
                <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block text-[13px] font-medium leading-snug">
                  Choose from gallery
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  Photos on this device
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="tap press glass glass--pad flex w-full items-center gap-3.5 text-left"
            >
              <span className="icon-well h-9 w-9">
                <Camera className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block text-[13px] font-medium leading-snug">
                  Take photo
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  Use the camera
                </span>
              </span>
            </button>
          </div>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void onPhoto(file);
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void onPhoto(file);
            }}
          />
          <button
            type="button"
            onClick={() => setPhotoOpen(false)}
            className="btn-quiet mt-6 w-full"
          >
            Cancel
          </button>
        </ModalShell>
      )}
    </AppShell>
  );
}
