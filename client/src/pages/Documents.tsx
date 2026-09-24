// Joseph Mews — Documents
// Design: Search-based, clean list, categories with counts + user upload
import { AppShell } from "@/components/AppShell";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import { Document, getProperty } from "@/lib/data";
import { getActiveDocuments, getActiveProperties } from "@/lib/holdings";
import {
  Search,
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const CATEGORIES: Document["category"][] = [
  "Contracts",
  "Rental",
  "Tax",
  "Mortgage",
  "Legal",
  "Others",
];

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeFromName(name: string): Document["fileType"] {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "doc" || ext === "docx") return "DOC";
  if (ext === "jpg" || ext === "jpeg" || ext === "png") return "JPG";
  return "PDF";
}

export default function Documents() {
  const [docs, setDocs] = useState<Document[]>(() => getActiveDocuments());
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    Document["category"] | "All"
  >("All");
  const [selected, setSelected] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const chipRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = chipRailRef.current;
    if (!rail) return;
    const onWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      rail.scrollLeft += delta;
      event.preventDefault();
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchCat = activeCategory === "All" || d.category === activeCategory;
      const matchQ =
        !query ||
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.category.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [docs, query, activeCategory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: docs.length };
    CATEGORIES.forEach((cat) => {
      c[cat] = docs.filter((d) => d.category === cat).length;
    });
    return c;
  }, [docs]);

  const recentCount = docs.filter((d) => d.isNew).length;

  const handleUploaded = (doc: Document) => {
    setDocs((prev) => [doc, ...prev]);
    setActiveCategory(doc.category);
    toast("Document uploaded", {
      description: `${doc.name} · ${doc.category}`,
    });
  };

  return (
    <AppShell>
      <div className="page-px">
        {/* Header */}
        <header className="page-intro flex items-center justify-between gap-3 animate-fade-up">
          <div className="min-w-0">
            <p className="label-eyebrow">Library</p>
            <h1 className="page-intro__title">Documents</h1>
            <p className="page-intro__sub">
              {docs.length} files
              {recentCount > 0 && (
                <>
                  {" · "}
                  <span className="text-primary">{recentCount} new</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="tap press inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-primary"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
            Upload
          </button>
        </header>

        <div
          className="search-field mb-5 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <Search
            className="w-4 h-4 text-muted-foreground shrink-0"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            aria-label="Search documents"
          />
        </div>

        {/* Category chips */}
        <div
          ref={chipRailRef}
          className="chip-rail pb-5 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <CategoryChip
            label="All"
            count={counts.All}
            active={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
          />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              count={counts[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass glass--pad py-12 text-center">
            <p className="label-eyebrow mb-2">No results</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try a different search or category
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-quiet mx-auto"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
              Upload a document
            </button>
          </div>
        ) : (
          <div className="glass-list">
            {filtered.map((doc, i) => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className="row group tap press animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="icon-well">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-[0.9375rem] tracking-tight truncate">
                      {doc.name}
                    </span>
                    {doc.isNew && <span className="chip chip--gold">New</span>}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {doc.category} · {doc.fileType} · {doc.size}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/70 mt-0.5">
                    {doc.uploaded}
                  </span>
                </span>
                <ChevronRight
                  className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0"
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>

      {selected && (
        <DocumentSheet doc={selected} onClose={() => setSelected(null)} />
      )}
      {showUpload && (
        <UploadSheet
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}
    </AppShell>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`tap press pill ${active ? "pill--on" : ""}`}
    >
      <span>{label}</span>
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}

function UploadSheet({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (doc: Document) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [category, setCategory] = useState<Document["category"]>("Others");
  const [done, setDone] = useState(false);
  const properties = getActiveProperties();

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) {
      toast("File is too large", {
        description: "Each file can be up to 25 MB.",
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(f);
    const base = f.name.replace(/\.[^.]+$/, "");
    setName(base);
  };

  const canSubmit = Boolean(file && name.trim());

  const handleSubmit = () => {
    if (!file || !name.trim()) return;
    const doc: Document = {
      id: `upload-${Date.now()}`,
      name: name.trim(),
      category,
      property: propertyId && propertyId !== "none" ? propertyId : undefined,
      fileType: fileTypeFromName(file.name),
      size: formatFileSize(file.size),
      uploaded: "Updated just now",
      isNew: true,
    };
    onUploaded(doc);
    setDone(true);
  };

  if (done) {
    return (
      <ModalShell onClose={onClose} title="Upload documents">
        <SuccessState
          headline="Document added"
          body={`${name.trim()} is in your library under ${category}.`}
          onClose={onClose}
        />
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} title="Upload documents">
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5">
        Add files to your library and choose a category so they appear in the
        right filter.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="tap press glass glass--pad w-full mb-5 text-center"
      >
        <Upload
          className="w-5 h-5 text-primary mx-auto mb-2.5"
          strokeWidth={1.5}
        />
        {file ? (
          <>
            <p className="text-[13px] font-medium truncate">{file.name}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {formatFileSize(file.size)} · Tap to change
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-medium">Choose files</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Files, gallery, or camera · up to 25 MB each
            </p>
          </>
        )}
      </button>

      <label className="block mb-5">
        <span className="label-eyebrow mb-2 block">Document name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Insurance certificate"
          className="field text-sm"
        />
      </label>

      <label className="block mb-5">
        <span className="label-eyebrow mb-2 block">Property</span>
        <span className="relative block">
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="field w-full appearance-none pr-10 text-sm"
          >
            <option value="">Select property (optional)</option>
            <option value="none">None</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </span>
      </label>

      <div className="mb-6">
        <p className="label-eyebrow mb-2.5">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`tap press pill ${
                category === cat ? "pill--on" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="tap press btn-gold"
      >
        <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
        Upload to library
      </button>
      <button
        type="button"
        onClick={onClose}
        className="btn-quiet w-full mt-2"
      >
        Cancel
      </button>
    </ModalShell>
  );
}

function DocumentSheet({
  doc,
  onClose,
}: {
  doc: Document;
  onClose: () => void;
}) {
  const handleDownload = () => {
    const body = [
      "Mews One — Document Vault",
      "————————————————————",
      `Document: ${doc.name}`,
      `Category: ${doc.category}`,
      `Type: ${doc.fileType}`,
      `Size: ${doc.size}`,
      `Updated: ${doc.uploaded}`,
      doc.property ? `Property ref: ${doc.property}` : null,
      "",
      "This is a prototype placeholder file for demonstration.",
      "In production, the signed document would download here.",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast("Download started", {
      description: `${doc.name} · sample file`,
    });
  };

  return (
    <ModalShell onClose={onClose} title={doc.name}>
      <div className="glass glass--pad mb-5">
        <div className="flex items-start gap-3.5">
          <span className="icon-well">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="label-eyebrow mb-2">{doc.category}</p>
            <p className="text-sm text-foreground/85 leading-relaxed">
              {doc.fileType} · {doc.size}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {doc.uploaded}
              {doc.property
                ? ` · ${getProperty(doc.property)?.name ?? doc.property}`
                : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-gold glass--pad mb-6">
        <p className="text-[12.5px] text-foreground/85 leading-snug mb-2">
          Keep a copy
        </p>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          Save this document to your phone so you can open it anytime.
        </p>
      </div>

      <button
        onClick={handleDownload}
        className="tap press btn-gold"
      >
        <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
        Download
      </button>
      <button
        onClick={onClose}
        className="btn-quiet w-full mt-2"
      >
        Close
      </button>
    </ModalShell>
  );
}
