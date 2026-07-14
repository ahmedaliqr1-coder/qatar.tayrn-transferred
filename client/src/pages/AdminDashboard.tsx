import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: submissions, isLoading } = trpc.submissions.getAllSubmissions.useQuery();
  const { data: details } = trpc.submissions.getSubmissionDetails.useQuery(selectedSession || "", {
    enabled: !!selectedSession,
  });

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((sub) =>
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.selectedBank.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [submissions, searchTerm]);

  const handleExport = () => {
    if (details) {
      const jsonStr = JSON.stringify(details, null, 2);
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(jsonStr));
      element.setAttribute("download", `submission_${selectedSession}.json`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)" }} dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button variant="ghost" onClick={() => setLocation("/")} style={{ color: "#4b5563" }}>
            {t("back")}
          </Button>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#0f172a" }}>{t("adminDashboard")}</h1>
          <div style={{ width: "40px" }} />
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Search Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Input
            type="text"
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {/* Submissions Table */}
        <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
              <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite", color: "#dc2626" }} />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#4b5563" }}>{t("noData")}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%" }}>
                <thead style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                  <tr>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600", color: "#111827" }}>{t("sessionId")}</th>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600", color: "#111827" }}>البنك</th>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600", color: "#111827" }}>{t("submittedAt")}</th>
                    <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.875rem", fontWeight: "600", color: "#111827" }}>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid #e5e7eb" }}>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#4b5563", fontFamily: "monospace" }}>{submission.id.slice(0, 12)}...</td>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#111827", fontWeight: "600" }}>{submission.selectedBank.toUpperCase()}</td>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#4b5563" }}>
                        {new Date(submission.createdAt).toLocaleString(language === "ar" ? "ar-SA" : "en-US")}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(submission.id);
                            setShowDetails(true);
                          }}
                        >
                          {t("view")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent style={{ maxWidth: "48rem", maxHeight: "24rem", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>{t("details")}</DialogTitle>
          </DialogHeader>
          {details ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "0.5rem", overflow: "auto", maxHeight: "16rem" }}>
                <pre style={{ fontSize: "0.75rem", color: "#111827", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button style={{ flex: 1, background: "#dc2626", color: "white" }} onClick={handleExport}>
                  {t("export")}
                </Button>
                <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowDetails(false)}>
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
              <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite", color: "#dc2626" }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
