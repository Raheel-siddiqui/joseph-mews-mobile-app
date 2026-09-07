// Joseph Mews — Documents
// Design: Search-based, clean list, categories with counts + user upload
import { AppShell } from "@/components/AppShell";
import { ModalShell, SuccessState } from "@/components/ModalShell";
import { Document } from "@/lib/data";
import { getActiveDocuments } from "@/lib/holdings";
import {
  Search,
  FileText,
  ChevronRight,
  Download,
  Upload,
  Plus,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const CATEGORIES: Document["category"][] = [
  "Contracts",
  "Rental",
  "Tax",
  "Mortgage",
  "Legal",
  "Others",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeFromName(name: string): Document["fileType"] {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "doc" || ext === "docx" ? "DOC" : "PDF";
}

export default function Documents() {
  const [docs, setDocs] = useState<Document[]>(() => getActiveDocuments());
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    Document["category"] | "All"
  >("All");
  const [selected, setSelected] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);

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
        <div className="pt-4 pb-6 animate-fade-up">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label-eyebrow mb-2">Library</p>
              <h1 className="font-serif text-2xl sm:text-3xl tracking-tight mb-1">
                Documents
              </h1>
              <p className="text-sm text-muted-foreground">
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
              onClick={() => setShowUpload(true)}
              className="tap press flex-shrink-0 inline-flex items-center gap-1.5 mt-1 px-3 py-2 rounded-sm border border-primary/50 text-primary text-[11px] tracking-wider uppercase active:bg-primary/5 transition-colors min-h-[40px]"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
              Upload
            </button>
          </div>
        </div>

        {/* Search */}
        <div
          className="relative mb-6 animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <Search
            className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="w-full bg-transparent border-0 border-b border-border pl-7 pr-2 py-3 text-base sm:text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category chips */}
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-page page-px pb-6 animate-fade-up"
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

        <div className="hairline mb-2" />

        {/* Document list */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="label-eyebrow mb-2">No results</p>
              <p className="text-sm text-muted-foreground mb-5">
                Try a different search or category
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="tap press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-primary/50 text-primary text-[11px] tracking-wider uppercase active:bg-primary/5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                Upload a document
              </button>
            </div>
          ) : (
            filtered.map((doc, i) => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className="w-full flex items-center gap-4 py-5 group text-left animate-fade-up tap press min-h-[60px]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="w-11 h-11 rounded-sm border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors">
                  <FileText
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                    {doc.isNew && (
                      <span className="text-[10px] tracking-widest uppercase text-primary border border-primary/30 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground/70">{doc.category}</span>
                    {" · "}
                    <span className="font-mono text-[11px]">{doc.fileType}</span>
                    {" · "}
                    {doc.size}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    {doc.uploaded}
                  </p>
                </div>
                <ChevronRight
                  className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0"
                  strokeWidth={1.5}
                />
              </button>
            ))
          )}
        </div>

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
      className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-sm border transition-all text-[11px] tracking-wider uppercase tap press min-h-[40px] ${
        active
          ? "border-primary text-primary bg-primary/5"
          : "border-border text-muted-foreground active:text-foreground"
      }`}
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
  const [category, setCategory] = useState<Document["category"]>("Others");
  const [done, setDone] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
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
      fileType: fileTypeFromName(file.name),
      size: formatFileSize(file.size),
      uploaded: "Uploaded just now",
      isNew: true,
    };
    onUploaded(doc);
    setDone(true);
  };

  if (done) {
    return (
      <ModalShell onClose={onClose} title="Upload document">
        <SuccessState
          headline="Document added"
          body={`${name.trim()} is in your library under ${category}.`}
          onClose={onClose}
        />
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} title="Upload document">
      <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-5">
        Add a file to your library and choose a category so it appears in the
        right filter.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="tap press w-full rounded-sm border border-dashed border-border px-4 py-6 mb-5 text-center active:bg-card/40 transition-colors"
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
            <p className="text-[13px] font-medium">Choose a file</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              PDF or DOC · up to 25 MB
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
          className="w-full bg-transparent border-0 border-b border-border py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </label>

      <div className="mb-6">
        <p className="label-eyebrow mb-2.5">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`tap press px-3 py-2 rounded-sm border text-[11px] tracking-wider uppercase transition-all min-h-[36px] ${
                category === cat
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-muted-foreground active:text-foreground"
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
        className="tap press w-full flex items-center justify-center gap-2 py-3.5 rounded-sm bg-primary text-primary-foreground font-medium tracking-[0.08em] text-[12.5px] uppercase active:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
      >
        <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
        Upload to library
      </button>
      <button
        type="button"
        onClick={onClose}
        className="tap w-full py-3 mt-2 text-[12px] tracking-[0.12em] uppercase text-muted-foreground active:text-foreground transition-colors"
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
      "Joseph Mews — Document Vault",
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
      <div className="rounded-sm border border-border px-4 py-4 mb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-sm border border-border flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label-eyebrow mb-2">{doc.category}</p>
            <p className="text-sm text-foreground/85 leading-relaxed">
              {doc.fileType} · {doc.size}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {doc.uploaded}
              {doc.property ? ` · ${doc.property}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-dashed border-border px-3.5 py-4 mb-6">
        <p className="text-[12.5px] text-foreground/85 leading-snug mb-2">
          Sample file
        </p>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          Download a sample copy of this document for your records. In
          production, the signed original would be provided here.
        </p>
      </div>

      <button
        onClick={handleDownload}
        className="tap press w-full flex items-center justify-center gap-2 py-3.5 rounded-sm bg-primary text-primary-foreground font-medium tracking-[0.08em] text-[12.5px] uppercase active:opacity-90 transition-opacity"
      >
        <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
        Download sample
      </button>
      <button
        onClick={onClose}
        className="tap w-full py-3 mt-2 text-[12px] tracking-[0.12em] uppercase text-muted-foreground active:text-foreground transition-colors"
      >
        Close
      </button>
    </ModalShell>
  );
}
